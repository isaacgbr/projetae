import { useEffect, useRef, type RefObject } from 'react'
import { ArrowIcon, StudioScene } from './BriefingUI'
import { ProcessVisual, ProjectCarousel } from './LandingVisuals'
import { BrandFinale } from './BrandFinale'
import './LandingPage.css'

const gmailComposeUrl = 'https://mail.google.com/mail/?' + new URLSearchParams({
  view: 'cm',
  fs: '1',
  to: 'isaacgbr7@gmail.com',
  su: 'Tenho interesse em um projeto',
  body: 'Olá, Isaac!\r\n\r\nEncontrei seu contato pelo Projetaê e gostaria de conversar sobre uma ideia.\r\n\r\n',
}).toString()

const links = [
  ['#como-funciona', 'Como funciona'],
  ['#projetos', 'Projetos digitais'],
  ['#sobre', 'Sobre o Projetaê'],
] as const

const process = [
  ['Ideia', 'Conte o que você tem em mente.'],
  ['Briefing', 'Defina objetivos e referências.'],
  ['Solicitação', 'Revise os detalhes do seu projeto.'],
]

function StartButton({ onStart }: { onStart: () => void }) {
  return <button className="button button-primary" onClick={onStart}>Planejar meu projeto <ArrowIcon /></button>
}

export function LandingPage({ headingRef, onStart }: {
  headingRef: RefObject<HTMLHeadingElement | null>
  onStart: () => void
}) {
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
      // Read the four stable scene bounds before writing presentation styles.
      const bounds = scenes.map((scene) => scene.getBoundingClientRect())
      scenes.forEach((scene, index) => {
        const rect = bounds[index]
        const visible = Math.max(0, Math.min(viewport, rect.bottom) - Math.max(0, rect.top))
        const progress = Math.min(1, visible / Math.min(viewport, rect.height))
        // Keep the reading region fully present; deepen the shared entrance/exit
        // as the visible portion shrinks. No time-based easing trails the scroll.
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
      }
      else delete element!.dataset.documentHidden
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

  return <div ref={page} className="landing-page">
    <header className="landing-header" id="inicio">
      <div className="landing-container landing-header-inner">
        <a className="landing-brand-link" href="#inicio" aria-label="Projetaê, início"><img className="landing-brand-logo" src="/brand/projetae-logo.svg" width="346" height="108" alt="Projetaê — Sua ideia começa aqui." /></a>
        <nav className="desktop-nav" aria-label="Navegação principal">
          {links.map(([href, label]) => <a href={href} key={href}>{label}</a>)}
        </nav>
        <div className="desktop-start"><StartButton onStart={onStart} /></div>
        <details className="mobile-menu" onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.currentTarget.open = false
            event.currentTarget.querySelector('summary')?.focus()
          }
        }}>
          <summary>Menu <span className="menu-lines" aria-hidden="true" /></summary>
          <nav aria-label="Navegação mobile" onClick={(event) => {
            if ((event.target as HTMLElement).closest('a, button')) event.currentTarget.closest('details')?.removeAttribute('open')
          }}>
            {links.map(([href, label]) => <a href={href} key={href}>{label}</a>)}
            <StartButton onStart={onStart} />
          </nav>
        </details>
      </div>
    </header>

    <main id="main" tabIndex={-1} className="landing-main">
      <section className="landing-hero landing-scene" aria-labelledby="landing-title">
        <div className="scene-content hero-scene-content">
        <div className="landing-container hero-inner">
          <div className="landing-hero-copy">
            <h1 id="landing-title" ref={headingRef} tabIndex={-1}>Sua ideia<br /> <span>começa</span> aqui.</h1>
            <p className="landing-hero-description">Organize sua ideia e planeje seu projeto digital com um briefing.</p>
            <div className="landing-hero-actions">
              <StartButton onStart={onStart} />
            </div>
          </div>
        </div>
        <StudioScene />
        </div>
      </section>

      <section className="landing-section how-section landing-scene" id="como-funciona" aria-labelledby="how-title">
        <div className="landing-container scene-content">
          <div className="section-intro process-intro">
            <div><p className="section-label">Como funciona</p><h2 id="how-title">Da ideia à <span>solicitação.</span></h2></div>
          </div>
          <div className="process-flow">
            <div className="process-track" aria-hidden="true"><span /></div>
            <ol className="process-list">
              {process.map(([title, description], index) => <li key={title} className="process-step">
                <ProcessVisual index={index} />
                <div className="process-caption"><span className="process-number">0{index + 1}</span><h3>{title}</h3></div>
                <p>{description}</p>
              </li>)}
            </ol>
          </div>
          <div className="process-explanation"><p>Você não precisa chegar com tudo pronto.</p><p>O briefing ajuda a organizar sua ideia e reunir as informações para entender o projeto e seus próximos passos.</p></div>
        </div>
      </section>

      <section className="landing-section services-section landing-scene" id="projetos" aria-labelledby="services-title">
        <div className="landing-container scene-content">
          <div className="section-intro">
            <h2 id="services-title">Projetos digitais</h2>
          </div>
          <p className="demo-note">Algumas formas de apresentar seu negócio, seus produtos ou seu trabalho.</p>
          <ProjectCarousel />
          <p className="other-projects"><strong>Tem outra ideia em mente?</strong><span>O projeto pode ser pensado a partir da sua necessidade.</span></p>
        </div>
      </section>

      <section className="landing-section about-section landing-scene" id="sobre" aria-labelledby="about-title">
        <div className="landing-container about-content scene-content">
          <div className="about-layout">
            <div className="about-responsible">
              <div className="about-portrait"><img src="/images/isaac-projetae.png" alt="Isaac Gabriel, criador do Projetaê" /></div>
              <h3>Isaac Gabriel</h3>
              <p>Criador e responsável pelo Projetaê</p>
              <div className="professional-contacts" role="group" aria-label="Contatos profissionais">
                <a href="https://github.com/isaacgbr" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4 1-4-2-6-2m12 5v-4c0-1-.2-1.6-.7-2.1 3-.3 5.7-1.5 5.7-6.4 0-1.4-.5-2.5-1.3-3.4.1-.4.6-1.8-.1-3.5 0 0-1.1-.4-3.6 1.3a12.6 12.6 0 0 0-6 0C6.5 2.2 5.4 2.6 5.4 2.6c-.7 1.7-.2 3.1-.1 3.5A4.8 4.8 0 0 0 4 9.5c0 4.9 2.7 6.1 5.7 6.4-.5.5-.7 1.1-.7 2.1v4" /></svg><span>GitHub</span></a>
                <a href="https://www.linkedin.com/in/isaacgbr" target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 10v7m0-10v.1M11 17v-7m0 3a3 3 0 0 1 6 0v4" /></svg><span>LinkedIn</span></a>
                <a href={gmailComposeUrl} target="_blank" rel="noopener noreferrer"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg><span>Enviar e-mail</span></a>
              </div>
            </div>
            <div className="about-copy">
              <h2 id="about-title">Sobre o Projetaê</h2>
              <p className="about-description">O Projetaê é um espaço para você apresentar sua ideia e dar o primeiro passo para desenvolver seu projeto digital.</p>
              <p className="about-contact">Sua solicitação será enviada diretamente ao responsável pelo Projetaê, que entrará em contato para conversar sobre os próximos passos.</p>
            </div>
          </div>
          <div className="about-ending">
            <div className="about-closing"><BrandFinale /></div>
            <footer className="about-footer"><p>© 2026 Projetaê. Todos os direitos reservados.</p></footer>
          </div>
        </div>
      </section>

    </main>

  </div>
}
