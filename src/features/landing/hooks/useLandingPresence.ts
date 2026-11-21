import { useEffect, useRef } from 'react'

export function useLandingPresence() {
  const page = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = page.current
    if (!element || !('IntersectionObserver' in window)) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const scenes = Array.from(element.querySelectorAll<HTMLElement>('.landing-scene'))
    let frame = 0

    function updatePresence() {
      frame = 0
      if (reducedMotion.matches) return

      const viewport = window.innerHeight
      const compact = window.innerWidth <= 700
      // Lê os limites estáveis das cenas antes de aplicar os estilos de apresentação.
      const bounds = scenes.map((scene) => scene.getBoundingClientRect())

      scenes.forEach((scene, index) => {
        const rect = bounds[index]
        const visible = Math.max(0, Math.min(viewport, rect.bottom) - Math.max(0, rect.top))
        const progress = Math.min(1, visible / Math.min(viewport, rect.height))
        // Mantém a região de leitura totalmente presente e acentua entrada e saída nas bordas.
        const passage = Math.max(0, Math.min(1, (progress - .12) / .78))
        const presence = Math.pow(passage * passage * (3 - 2 * passage), 1.35)
        const opacity = ((compact ? .56 : .34) + (compact ? .44 : .66) * presence).toFixed(4)
        const direction = rect.top + rect.height / 2 >= viewport / 2 ? 1 : -1
        const offset = `${((1 - presence) * direction * (compact ? 24 : 48)).toFixed(2)}px`
        const scale = (1 - (1 - presence) * (compact ? .008 : .015)).toFixed(5)

        if (scene.style.getPropertyValue('--scene-opacity') !== opacity) scene.style.setProperty('--scene-opacity', opacity)
        if (scene.style.getPropertyValue('--scene-offset') !== offset) scene.style.setProperty('--scene-offset', offset)
        if (scene.style.getPropertyValue('--scene-scale') !== scale) scene.style.setProperty('--scene-scale', scale)
      })
    }

    function requestPresence() {
      if (!frame && !reducedMotion.matches && !document.hidden) frame = requestAnimationFrame(updatePresence)
    }

    const activityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle('is-in-view', entry.isIntersecting))
    }, { threshold: .1 })

    element.querySelectorAll('.process-flow').forEach((item) => activityObserver.observe(item))

    function configureMotion() {
      if (reducedMotion.matches) {
        cancelAnimationFrame(frame)
        frame = 0
        delete element!.dataset.motion
        scenes.forEach((scene) => {
          scene.style.removeProperty('--scene-opacity')
          scene.style.removeProperty('--scene-offset')
          scene.style.removeProperty('--scene-scale')
        })
        return
      }

      element!.dataset.motion = 'ready'
      requestPresence()
    }

    function documentVisibility() {
      if (document.hidden) {
        element!.dataset.documentHidden = 'true'
        cancelAnimationFrame(frame)
        frame = 0
      } else {
        delete element!.dataset.documentHidden
      }
      requestPresence()
    }

    configureMotion()
    documentVisibility()
    reducedMotion.addEventListener('change', configureMotion)
    document.addEventListener('visibilitychange', documentVisibility)
    window.addEventListener('scroll', requestPresence, { passive: true })
    window.addEventListener('resize', requestPresence)

    const resizeObserver = new ResizeObserver(requestPresence)
    scenes.forEach((scene) => resizeObserver.observe(scene))

    return () => {
      activityObserver.disconnect()
      resizeObserver.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestPresence)
      window.removeEventListener('resize', requestPresence)
      reducedMotion.removeEventListener('change', configureMotion)
      document.removeEventListener('visibilitychange', documentVisibility)
      delete element.dataset.motion
      delete element.dataset.documentHidden
    }
  }, [])

  return page
}
