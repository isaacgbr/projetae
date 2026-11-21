import { useEffect, useState, type RefObject } from 'react'

type DemoStatus = 'idle' | 'playing' | 'returning'

interface DemoScene {
  phase: number
  status: DemoStatus
  visit: number
}

interface DemoCycleOptions {
  active: boolean
  visit: number
  stage: RefObject<HTMLDivElement | null>
}

// Cada pausa começa após o término real das transições CSS, incluindo o retorno a zero.
const demoSteps: readonly { phase: number; hold: number; status: DemoStatus }[] = [
  { phase: 1, hold: 2100, status: 'playing' },
  { phase: 2, hold: 3000, status: 'playing' },
  { phase: 1, hold: 1000, status: 'returning' },
  { phase: 0, hold: 0, status: 'returning' },
]

function demoDelay(ms: number, signal: AbortSignal) {
  return new Promise<boolean>((resolve) => {
    if (signal.aborted) {
      resolve(false)
      return
    }

    const timer = window.setTimeout(() => {
      cleanup()
      resolve(true)
    }, ms)

    function abort() {
      clearTimeout(timer)
      cleanup()
      resolve(false)
    }

    function cleanup() {
      signal.removeEventListener('abort', abort)
    }

    signal.addEventListener('abort', abort, { once: true })
  })
}

function demoFrame(signal: AbortSignal) {
  return new Promise<boolean>((resolve) => {
    if (signal.aborted) {
      resolve(false)
      return
    }

    const frame = requestAnimationFrame(() => {
      cleanup()
      resolve(true)
    })

    function abort() {
      cancelAnimationFrame(frame)
      cleanup()
      resolve(false)
    }

    function cleanup() {
      signal.removeEventListener('abort', abort)
    }

    signal.addEventListener('abort', abort, { once: true })
  })
}

async function finishDemoMotion(element: HTMLElement, signal: AbortSignal, subtree = false) {
  // Aguarda o commit do React e a criação das transições pelo navegador antes de verificar o término.
  if (!await demoFrame(signal) || !await demoFrame(signal)) return false
  const animations = element.getAnimations({ subtree })

  return new Promise<boolean>((resolve) => {
    if (signal.aborted) {
      resolve(false)
      return
    }

    function abort() {
      signal.removeEventListener('abort', abort)
      resolve(false)
    }

    signal.addEventListener('abort', abort, { once: true })
    void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      signal.removeEventListener('abort', abort)
      resolve(!signal.aborted)
    })
  })
}

export function useProjectDemoCycle({ active, visit, stage }: DemoCycleOptions) {
  const [scene, setScene] = useState<DemoScene>({ phase: 0, status: 'idle', visit })

  useEffect(() => {
    const element = stage.current
    if (!active || !element) return
    const viewport = element.closest<HTMLElement>('.carousel-viewport')
    const project = element.closest<HTMLElement>('.carousel-project')
    const browser = element.querySelector<HTMLElement>('.demo-browser')
    if (!viewport || !project || !browser) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let cycle: AbortController | undefined
    let disposed = false
    // Observa a geometria estável da cena, não a superfície afetada pelo carrossel e pelo tilt.
    const bounds = viewport.getBoundingClientRect()
    let inView = Math.max(0, Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0)) / bounds.height >= .3

    function canPlay() {
      return !disposed && inView && !document.hidden && !reduced.matches
    }

    function stop() {
      cycle?.abort()
      cycle = undefined
      setScene((current) => current.phase === 0 && current.status === 'idle' && current.visit === visit
        ? current
        : { phase: 0, status: 'idle', visit })
    }

    async function play(signal: AbortSignal) {
      // O posicionamento e qualquer retorno interrompido da demo devem estabilizar antes da primeira pausa.
      if (!await finishDemoMotion(project!, signal) || !await finishDemoMotion(browser!, signal, true)) return
      if (!await demoDelay(1100, signal)) return

      while (canPlay() && !signal.aborted) {
        for (const step of demoSteps) {
          if (!canPlay() || signal.aborted) return
          setScene({ phase: step.phase, status: step.status, visit })
          if (!await finishDemoMotion(browser!, signal, true)) return
          if (step.hold && !await demoDelay(step.hold, signal)) return
        }

        if (!canPlay() || signal.aborted) return
        setScene({ phase: 0, status: 'idle', visit })
        if (!await demoDelay(1600, signal)) return
      }
    }

    function synchronize() {
      if (!canPlay()) {
        stop()
        return
      }
      if (cycle) return
      cycle = new AbortController()
      void play(cycle.signal)
    }

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= .3
      synchronize()
    }, { threshold: [0, .3] })

    observer.observe(viewport)
    reduced.addEventListener('change', synchronize)
    document.addEventListener('visibilitychange', synchronize)
    synchronize()

    return () => {
      disposed = true
      cycle?.abort()
      observer.disconnect()
      reduced.removeEventListener('change', synchronize)
      document.removeEventListener('visibilitychange', synchronize)
    }
  }, [active, stage, visit])

  const currentVisit = active && scene.visit === visit
  return {
    phase: currentVisit ? scene.phase : 0,
    status: currentVisit ? scene.status : 'idle',
  }
}
