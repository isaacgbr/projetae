import { useEffect, useRef } from 'react'

const logoSource = '/brand/projetae-logo.svg'

/** Executa uma formação finita por montagem. Retornar pelo scroll mantém a marca concluída. */
export function BrandFinale() {
  const finale = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = finale.current
    if (!element || !('IntersectionObserver' in window)) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let played = false
    let completion: ReturnType<typeof setTimeout> | undefined

    function complete() {
      clearTimeout(completion)
      element!.dataset.brandState = 'complete'
    }

    const observer = new IntersectionObserver((entries) => {
      if (played || !entries.some((entry) => entry.isIntersecting)) return
      played = true
      observer.disconnect()
      if (reduced.matches) {
        complete()
        return
      }
      element.dataset.brandState = 'forming'
      completion = setTimeout(complete, 1500)
    }, { threshold: .35 })

    function motionChange() {
      if (!reduced.matches) return
      played = true
      observer.disconnect()
      complete()
    }

    if (reduced.matches) complete()
    else element.dataset.brandState = 'ready'
    observer.observe(element)
    reduced.addEventListener('change', motionChange)

    return () => {
      clearTimeout(completion)
      observer.disconnect()
      reduced.removeEventListener('change', motionChange)
      delete element.dataset.brandState
    }
  }, [])

  return <div ref={finale} className="brand-finale" role="img" aria-label="Projetaê. Sua ideia começa aqui.">
    <img className="brand-part brand-part-symbol" src={logoSource} width="346" height="108" alt="" draggable={false} />
    <img className="brand-part brand-part-word" src={logoSource} width="346" height="108" alt="" draggable={false} />
    <img className="brand-part brand-part-signature" src={logoSource} width="346" height="108" alt="" draggable={false} />
  </div>
}
