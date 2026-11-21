import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

const scriptId = 'cloudflare-turnstile-script'
const scriptUrl = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''
const failureMessage = 'Não foi possível concluir a verificação de segurança. Tente novamente.'
const scriptTimeoutMs = 15_000
const verificationTimeoutMs = 60_000

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

  const loading = new Promise<TurnstileApi>((resolve, reject) => {
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null
    const script = existing ?? document.createElement('script')
    const cleanup = () => {
      clearTimeout(timer)
      script.removeEventListener('load', loaded)
      script.removeEventListener('error', failed)
    }
    const loaded = () => {
      if (!window.turnstile) { failed(); return }
      cleanup()
      resolve(window.turnstile)
    }
    const failed = () => {
      cleanup()
      script.remove()
      reject(new Error(failureMessage))
    }
    const timer = setTimeout(failed, scriptTimeoutMs)
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
  // Libera tanto falhas quanto sucessos: a API global é a fonte após o load.
  scriptPromise = loading.finally(() => { scriptPromise = null })
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
  const execution = useRef(0)
  const verificationTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearVerificationTimer() {
    if (verificationTimer.current !== null) clearTimeout(verificationTimer.current)
    verificationTimer.current = null
  }

  function invalidateExecution() { execution.current++ }

  function rejectPending() {
    clearVerificationTimer()
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
          clearVerificationTimer()
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
      const attempt = ++execution.current
      const current = await ensureWidget()
      if (!mounted.current || attempt !== execution.current) throw new Error(failureMessage)
      rejectPending()
      current.api.reset(current.id)
      return new Promise<string>((resolve, reject) => {
        pending.current = { resolve, reject }
        verificationTimer.current = setTimeout(() => {
          rejectPending()
          current.api.reset(current.id)
        }, verificationTimeoutMs)
        try { current.api.execute(current.id) }
        catch { rejectPending() }
      })
    },
    reset() {
      invalidateExecution()
      rejectPending()
      if (widget.current) widget.current.api.reset(widget.current.id)
    },
  }))

  useEffect(() => {
    mounted.current = true
    void ensureWidget().catch(() => undefined)
    return () => {
      invalidateExecution()
      mounted.current = false
      rejectPending()
      if (widget.current) widget.current.api.remove(widget.current.id)
      widget.current = null
      initializing.current = null
    }
  }, [])

  return <div ref={container} className="turnstile-container" aria-live="polite" />
})
