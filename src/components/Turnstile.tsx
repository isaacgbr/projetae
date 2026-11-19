import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

const scriptId = 'cloudflare-turnstile-script'
const scriptUrl = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''
const failureMessage = 'Não foi possível concluir a verificação de segurança. Tente novamente.'

type TurnstileOptions = {
  sitekey: string
  action: string
  execution: 'execute'
  appearance: 'interaction-only'
  theme: 'light'
  size: 'flexible'
  language: 'pt-BR'
  'response-field': false
  callback: (token: string) => void
  'error-callback': () => boolean
  'expired-callback': () => void
  'timeout-callback': () => void
  'unsupported-callback': () => void
}

type TurnstileApi = {
  render(container: HTMLElement, options: TurnstileOptions): string
  execute(widgetId: string): void
  reset(widgetId: string): void
  remove(widgetId: string): void
}

declare global {
  interface Window { turnstile?: TurnstileApi }
}

let scriptPromise: Promise<TurnstileApi> | null = null

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise<TurnstileApi>((resolve, reject) => {
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null
    const script = existing ?? document.createElement('script')
    const loaded = () => window.turnstile ? resolve(window.turnstile) : reject(new Error(failureMessage))
    const failed = () => {
      scriptPromise = null
      if (!existing) script.remove()
      reject(new Error(failureMessage))
    }
    script.addEventListener('load', loaded, { once: true })
    script.addEventListener('error', failed, { once: true })
    if (!existing) {
      script.id = scriptId
      script.src = scriptUrl
      script.async = true
      script.defer = true
      document.head.append(script)
    }
  })
  return scriptPromise
}

export type TurnstileHandle = {
  execute(): Promise<string>
  reset(): void
}

export const Turnstile = forwardRef<TurnstileHandle>(function Turnstile(_, ref) {
  const container = useRef<HTMLDivElement>(null)
  const widget = useRef<{ api: TurnstileApi; id: string } | null>(null)
  const initializing = useRef<Promise<{ api: TurnstileApi; id: string }> | null>(null)
  const pending = useRef<{ resolve: (token: string) => void; reject: (error: Error) => void } | null>(null)
  const mounted = useRef(true)

  function rejectPending() {
    pending.current?.reject(new Error(failureMessage))
    pending.current = null
  }

  async function ensureWidget() {
    if (widget.current) return widget.current
    if (initializing.current) return initializing.current
    if (!siteKey) throw new Error('A verificação de segurança ainda não está configurada neste ambiente.')

    initializing.current = loadTurnstile().then(api => {
      if (!mounted.current || !container.current) throw new Error(failureMessage)
      if (widget.current) return widget.current
      const id = api.render(container.current, {
        sitekey: siteKey,
        action: 'submit_request',
        execution: 'execute',
        appearance: 'interaction-only',
        theme: 'light',
        size: 'flexible',
        language: 'pt-BR',
        'response-field': false,
        callback: token => {
          pending.current?.resolve(token)
          pending.current = null
        },
        'error-callback': () => { rejectPending(); return true },
        'expired-callback': rejectPending,
        'timeout-callback': rejectPending,
        'unsupported-callback': rejectPending,
      })
      widget.current = { api, id }
      return widget.current
    }).finally(() => { initializing.current = null })
    return initializing.current
  }

  useImperativeHandle(ref, () => ({
    async execute() {
      const current = await ensureWidget()
      rejectPending()
      current.api.reset(current.id)
      return new Promise<string>((resolve, reject) => {
        pending.current = { resolve, reject }
        current.api.execute(current.id)
      })
    },
    reset() {
      rejectPending()
      if (widget.current) widget.current.api.reset(widget.current.id)
    },
  }))

  useEffect(() => {
    mounted.current = true
    void ensureWidget().catch(() => undefined)
    return () => {
      mounted.current = false
      rejectPending()
      if (widget.current) widget.current.api.remove(widget.current.id)
      widget.current = null
      initializing.current = null
    }
  }, [])

  return <div ref={container} className="turnstile-container" aria-live="polite" />
})
