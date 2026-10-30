import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { ArrowIcon } from './BriefingUI'

export function ProcessVisual({ index }: { index: number }) {
  return <div className={'process-visual process-visual-' + index} aria-hidden="true">
    {index === 0 ? <><span className="idea-fragment fragment-one" /><span className="idea-fragment fragment-two" /><span className="note-mini"><i /><i /><i /></span><span className="pencil-mini" /></>
      : index === 1 ? <span className="checklist-mini"><span className="sheet-heading" />{[0, 1, 2].map((item) => <span className={'checklist-row checklist-row-' + item} key={item}><b>✓</b><i /></span>)}</span>
        : <><span className="request-sheet"><span className="sheet-heading" /><i /><i /><i /><span className="request-seal">✓</span></span><svg className="request-envelope" viewBox="0 0 104 62" fill="none"><path d="M2 5h100v53H2z" fill="#e2c7ae" stroke="#af8464" /><path d="m2 5 50 31L102 5M2 58l33-29m67 29L69 29" stroke="#af8464" strokeLinejoin="round" /></svg></>}
  </div>
}

export type ServiceType = 'landing' | 'institutional' | 'catalog' | 'portfolio'

const demoNames: Record<ServiceType, string> = {
  landing: 'Landing Page', institutional: 'Site Institucional', catalog: 'Catálogo Digital', portfolio: 'Portfólio Profissional',
}

const projects: readonly { type: ServiceType; description: string }[] = [
  { type: 'landing', description: 'Uma página focada em apresentar e gerar contato.' },
  { type: 'institutional', description: 'Seu negócio apresentado de forma profissional.' },
  { type: 'catalog', description: 'Seus produtos ou serviços organizados em uma vitrine.' },
  { type: 'portfolio', description: 'Seus trabalhos apresentados em um espaço profissional.' },
]

function ProjectTilt({ active, children }: { active: boolean; children: ReactNode }) {
  const tilt = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = tilt.current
    const project = element?.parentElement
    if (!element || !project || !active) return
    const mouse = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let x = 0
    let y = 0
    function reset() {
      cancelAnimationFrame(frame)
      frame = 0
      delete element!.dataset.returning
      element!.style.removeProperty('--tilt-x')
      element!.style.removeProperty('--tilt-y')
    }
    function settle() {
      reset()
      element!.dataset.returning = 'true'
    }
    function move(event: globalThis.PointerEvent) {
      if (event.pointerType !== 'mouse' || event.buttons || !mouse.matches || reduced.matches) return
      delete element!.dataset.returning
      // Measure the positioning wrapper, never the surface being tilted.
      const bounds = project!.getBoundingClientRect()
      x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1))
      y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1))
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0
        element!.style.setProperty('--tilt-x', `${(-y * 3).toFixed(2)}deg`)
        element!.style.setProperty('--tilt-y', `${(x * 3).toFixed(2)}deg`)
      })
    }
    element.addEventListener('pointermove', move)
    element.addEventListener('pointerleave', settle)
    element.addEventListener('pointerdown', reset)
    mouse.addEventListener('change', reset)
    reduced.addEventListener('change', reset)
    window.addEventListener('blur', reset)
    return () => {
      reset()
      element.removeEventListener('pointermove', move)
      element.removeEventListener('pointerleave', settle)
      element.removeEventListener('pointerdown', reset)
      mouse.removeEventListener('change', reset)
      reduced.removeEventListener('change', reset)
      window.removeEventListener('blur', reset)
    }
  }, [active])
  return <div ref={tilt} className="project-tilt">{children}</div>
}

export function ProjectCarousel() {
  const [selection, setSelection] = useState({ index: 0, visit: 0 })
  const [dragging, setDragging] = useState(false)
  const active = selection.index
  const gesture = useRef<{ id: number; x: number; y: number; project: number | null } | null>(null)
  const current = projects[active]

  function navigate(delta: number) {
    setSelection((current) => ({ index: (current.index + delta + projects.length) % projects.length, visit: current.visit + 1 }))
  }

  function select(index: number) {
    setSelection((current) => current.index === index ? current : { index, visit: current.visit + 1 })
  }

  function resetDrag(element: HTMLDivElement) {
    gesture.current = null
    setDragging(false)
    element.style.removeProperty('--drag-offset')
    delete element.dataset.dragging
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current
    if (!start || start.id !== event.pointerId) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    resetDrag(event.currentTarget)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (Math.abs(dx) >= 42 && Math.abs(dx) > Math.abs(dy) * 1.2) navigate(dx < 0 ? 1 : -1)
    else if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && start.project !== null) select(start.project)
  }

  return <div className="project-carousel" role="region" aria-roledescription="carrossel" aria-labelledby="services-title">
    <div className="carousel-viewport" tabIndex={0} role="group" aria-label="Prévias dos projetos. Use as setas do teclado ou arraste para navegar."
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          event.currentTarget.focus({ preventScroll: true })
          navigate(event.key === 'ArrowRight' ? 1 : -1)
        } else if (event.key === 'Home' || event.key === 'End') {
          event.preventDefault()
          event.currentTarget.focus({ preventScroll: true })
          select(event.key === 'Home' ? 0 : projects.length - 1)
        }
      }}
      onPointerDown={(event) => {
        if (!event.isPrimary || event.button !== 0 || (event.target as HTMLElement).closest('button, a')) return
        const project = (event.target as HTMLElement).closest<HTMLElement>('[data-project-index]')
        gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, project: project ? Number(project.dataset.projectIndex) : null }
        setSelection((current) => ({ ...current, visit: current.visit + 1 }))
        setDragging(true)
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        const start = gesture.current
        if (!start || start.id !== event.pointerId) return
        const dx = event.clientX - start.x
        const dy = event.clientY - start.y
        if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.2) {
          if (event.cancelable) event.preventDefault()
          event.currentTarget.dataset.dragging = 'true'
          event.currentTarget.style.setProperty('--drag-offset', `${Math.max(-60, Math.min(60, dx * .2))}px`)
        }
      }}
      onPointerUp={endDrag}
      onPointerCancel={(event) => resetDrag(event.currentTarget)}
      onLostPointerCapture={(event) => resetDrag(event.currentTarget)}>
      {projects.map(({ type }, index) => {
        const distance = (index - active + projects.length) % projects.length
        const position = distance === 0 ? 'active' : distance === 1 ? 'next' : distance === projects.length - 1 ? 'previous' : 'parked'
        return <div key={type} className={'carousel-project service-' + type} data-position={position} data-project-index={index} role="group" aria-roledescription="slide" aria-label={`${index + 1} de ${projects.length}: ${demoNames[type]}`} aria-hidden={distance !== 0}>
          <ProjectTilt active={distance === 0 && !dragging}>
            <ServiceStage type={type} active={distance === 0 && !dragging} visit={selection.visit} />
          </ProjectTilt>
        </div>
      })}
    </div>
    <div className="carousel-caption">
      <div className="carousel-copy" aria-live="polite" aria-atomic="true"><h3>{demoNames[current.type]}</h3><p>{current.description}</p></div>
      <div className="carousel-navigation" aria-label="Navegação dos projetos">
        <button className="carousel-arrow" onClick={() => navigate(-1)} aria-label="Projeto anterior"><ArrowIcon back /></button>
        <span className="carousel-counter" aria-hidden="true">0{active + 1}<span> / 04</span></span>
        <button className="carousel-arrow" onClick={() => navigate(1)} aria-label="Próximo projeto"><ArrowIcon /></button>
      </div>
    </div>
    <div className="carousel-pagination" role="group" aria-label="Escolher projeto">{projects.map(({ type }, index) => <button key={type} aria-label={'Mostrar ' + demoNames[type]} aria-current={index === active ? 'true' : undefined} onClick={() => select(index)}><span /></button>)}</div>
  </div>
}
const demoDomains: Record<ServiceType, string> = {
  landing: 'espacovivo.exemplo', institutional: 'vertice.exemplo', catalog: 'objetos.exemplo', portfolio: 'lia.exemplo',
}
const demoStories: Record<ServiceType, readonly string[]> = {
  landing: ['Espaço Vivo apresenta uma consultoria de interiores.', 'A página revela os benefícios para cada ambiente.', 'O convite final é conversar sobre seu espaço.'],
  institutional: ['Vértice apresenta seu trabalho em arquitetura.', 'A página Sobre mostra a abordagem do estúdio.', 'Serviços reúne arquitetura, interiores e consultoria.', 'A navegação retorna à apresentação da empresa.'],
  catalog: ['Objetos apresenta três peças para a casa.', 'A categoria Cerâmica destaca o Vaso Aurora.', 'O detalhe apresenta material, acabamento e dimensões do vaso.'],
  portfolio: ['Lia Mota se apresenta como designer e diretora de arte.', 'A seleção reúne identidade visual e pesquisa tipográfica.', 'O contato convida a conversar sobre um novo projeto.'],
}

type DemoStatus = 'idle' | 'playing' | 'returning'

// Each hold starts after the actual CSS transitions finish, including the return to zero.
const demoSteps: readonly { phase: number; hold: number; status: DemoStatus }[] = [
  { phase: 1, hold: 2100, status: 'playing' },
  { phase: 2, hold: 3000, status: 'playing' },
  { phase: 1, hold: 1000, status: 'returning' },
  { phase: 0, hold: 0, status: 'returning' },
]

function demoDelay(ms: number, signal: AbortSignal) {
  return new Promise<boolean>((resolve) => {
    if (signal.aborted) { resolve(false); return }
    const timer = window.setTimeout(() => { cleanup(); resolve(true) }, ms)
    function abort() { clearTimeout(timer); cleanup(); resolve(false) }
    function cleanup() { signal.removeEventListener('abort', abort) }
    signal.addEventListener('abort', abort, { once: true })
  })
}

function demoFrame(signal: AbortSignal) {
  return new Promise<boolean>((resolve) => {
    if (signal.aborted) { resolve(false); return }
    const frame = requestAnimationFrame(() => { cleanup(); resolve(true) })
    function abort() { cancelAnimationFrame(frame); cleanup(); resolve(false) }
    function cleanup() { signal.removeEventListener('abort', abort) }
    signal.addEventListener('abort', abort, { once: true })
  })
}

async function finishDemoMotion(element: HTMLElement, signal: AbortSignal, subtree = false) {
  // Let React commit and the browser create transitions before reading their completion.
  if (!await demoFrame(signal) || !await demoFrame(signal)) return false
  const animations = element.getAnimations({ subtree })
  return new Promise<boolean>((resolve) => {
    if (signal.aborted) { resolve(false); return }
    function abort() { signal.removeEventListener('abort', abort); resolve(false) }
    signal.addEventListener('abort', abort, { once: true })
    void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      signal.removeEventListener('abort', abort)
      resolve(!signal.aborted)
    })
  })
}

export function ServiceStage({ type, active = true, visit = 0 }: { type: ServiceType; active?: boolean; visit?: number }) {
  const [scene, setScene] = useState<{ phase: number; status: DemoStatus; visit: number }>({ phase: 0, status: 'idle', visit })
  const stage = useRef<HTMLDivElement>(null)

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
    // Observe stable scene geometry, not the surface affected by carousel/tilt transforms.
    const bounds = viewport.getBoundingClientRect()
    let inView = Math.max(0, Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, 0)) / bounds.height >= .3
    function canPlay() { return !disposed && inView && !document.hidden && !reduced.matches }
    function stop() {
      cycle?.abort()
      cycle = undefined
      setScene((current) => current.phase === 0 && current.status === 'idle' && current.visit === visit ? current : { phase: 0, status: 'idle', visit })
    }
    async function play(signal: AbortSignal) {
      // Positioning and any interrupted demo return must both settle before the first pause.
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
      if (!canPlay()) { stop(); return }
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
  }, [active, visit])

  const currentVisit = active && scene.visit === visit
  const phase = currentVisit ? scene.phase : 0
  return <div ref={stage} className="demo-experience" data-demo-state={currentVisit ? scene.status : 'idle'} role="img" aria-label={'Prévia ilustrativa de ' + demoNames[type]} aria-describedby={'demo-description-' + type}>
    <div className="service-stage">
      <div className="demo-rig">
        <span className="demo-bottom-edge" aria-hidden="true" />
        <div className={'demo-browser demo-' + type} data-phase={phase} aria-hidden="true">
          <div className="demo-browser-bar"><span className="demo-dots"><i /><i /><i /></span><span>{demoDomains[type]}</span><span>◇</span></div>
          <ServiceVisual type={type} phase={phase} />
        </div>
      </div>
    </div>
    <p id={'demo-description-' + type} className="demo-description">{demoNames[type]}. Negócio fictício. {demoStories[type].join(' ')}</p>
  </div>
}

export function ServiceVisual({ type, phase }: { type: ServiceType; phase: number }) {
  const page = phase === 0 ? 0 : phase === 1 ? 1 : 2
  if (type === 'landing') return <div className="demo-viewport landing-viewport">
    <div className="demo-scroll">
      <div className="demo-landing-home">
      <div className="demo-nav"><b>espaço vivo<span> / interiores</span></b><span>Seu espaço, seu jeito.</span></div>
      <div className="demo-landing-cover"><div className="demo-landing-copy"><strong>Um novo<br /><em>jeito de morar.</em></strong><p>Consultoria de interiores para transformar o que já é seu.</p><span className="demo-benefit">Layout, cores e escolhas.</span><span className="demo-cta">Pedir uma proposta <span>↗</span></span></div><div className="demo-arch"><i /><b /><span /></div></div>
      </div>
      <div className="demo-collection"><div><span className="demo-kicker">A CONSULTORIA</span><strong>Mais vida em<br />cada ambiente.</strong><p>Um plano para aproveitar seu espaço, escolher materiais e renovar com intenção.</p><span className="demo-benefit">Seu ambiente · Suas escolhas · Seu ritmo</span></div><div className="collection-art"><i /><i /><i /></div></div>
      <div className="demo-landing-contact"><span className="demo-kicker">VAMOS COMEÇAR?</span><strong>Seu espaço tem<br />novas possibilidades.</strong><p>Conte o que você imagina.<br />Vamos pensar no próximo passo.</p><span className="demo-cta">Conversar sobre meu espaço <span>↗</span></span><small>espaço vivo / interiores</small></div>
    </div>
  </div>
  if (type === 'institutional') return <div className="demo-viewport institutional-viewport">
    <div className="demo-nav"><b>vértice<span> / estúdio</span></b><div className="demo-tabs">{['Início', 'Sobre', 'Serviços'].map((name, index) => <span key={name} className={page === index ? 'active' : ''}>{name}</span>)}</div></div>
    <div className="institutional-scenes">
      <div className={'institutional-scene institutional-scene-0' + (page === 0 ? ' active' : '')}><div><strong>Espaços para<br />novas histórias.</strong><p>Arquitetura e interiores.<br />Do conceito ao espaço.</p></div><div className="demo-building"><i /><b /></div></div>
      <div className={'institutional-scene institutional-scene-1' + (page === 1 ? ' active' : '')}><div><span className="demo-kicker">SOBRE O ESTÚDIO</span><strong>A escuta vem<br />antes do traço.</strong><p>Matéria e luz.<br />Em cada escolha.</p></div><div className="studio-materials"><i /><b /><span /></div></div>
      <div className={'institutional-scene institutional-scene-2' + (page === 2 ? ' active' : '')}><div><span className="demo-kicker">NOSSA ATUAÇÃO</span><strong>Do traço<br />ao espaço.</strong><p>Vamos conversar<br />sobre seu projeto? ↗</p></div><div className="institutional-services"><span><i />Arquitetura</span><span><i />Interiores</span><span><i />Consultoria</span></div></div>
    </div>
    <div className="institutional-foot"><span>ARQUITETURA · INTERIORES</span><span>Contato ↗</span></div>
  </div>
  if (type === 'catalog') return <div className="demo-viewport catalog-viewport">
    <div className="demo-nav"><b>objetos<span> / casa</span></b><span>Coleção essencial</span></div>
    <div className="demo-catalog-heading"><strong>Feito para ficar.</strong><span>03 peças</span></div>
    <div className="demo-categories"><span className={phase === 0 ? 'active' : ''}>Todos</span><span className={phase > 0 ? 'active' : ''}>Cerâmica</span><span>Iluminação</span></div><div className="demo-products">{[['vase', 'Vaso Aurora', 'Cerâmica'], ['lamp', 'Luminária Arco', 'Metal'], ['bowl', 'Bowl Terra', 'Madeira']].map(([art, title, copy], index) => <div className={'demo-product product-' + index} key={art}><div className="demo-product-art"><i className={'object-' + art} /></div><b>{title}</b><span>{copy}</span><small>{index === 0 && phase > 0 ? 'Ver Vaso Aurora ↗' : 'Ver peça'}</small></div>)}</div>
    <div className="demo-product-detail"><div className="demo-detail-art"><i className="object-vase" /></div><div><span className="demo-kicker">A PEÇA EM DETALHE</span><strong>Vaso Aurora</strong><p>Cerâmica natural<br />Acabamento fosco<br />Altura: 24 cm</p><span className="demo-detail-link">Coleção essencial / 01</span></div></div>
  </div>
  return <div className="demo-viewport portfolio-viewport">
    <div className="demo-nav"><b>LIA MOTA<span>®</span></b><span>Design & direção de arte</span></div>
    <div className="portfolio-scenes">
      <div className={'portfolio-scene portfolio-presentation' + (page === 0 ? ' active' : '')}><span className="demo-kicker">DESIGNER INDEPENDENTE</span><strong>Identidades que<br />contam histórias.</strong><p>Sou Lia. Transformo ideias em marcas,<br />imagens e novas formas de comunicar.</p><span className="portfolio-presentation-mark">lm.</span><small>Conheça meu trabalho ↓</small></div>
      <div className={'portfolio-scene portfolio-work' + (page === 1 ? ' active' : '')}><div className="demo-portfolio-intro"><span>Trabalhos selecionados</span><span>2026</span></div><div className="portfolio-work-grid"><div className="portfolio-poster"><div className="portfolio-art"><strong>entre formas.</strong><i /><span className="poster-seal">ef.</span></div><div className="portfolio-caption"><b>Entre Formas</b><span>Identidade</span></div></div><div className="portfolio-type"><div className="portfolio-art"><strong>Aa</strong><i /></div><div className="portfolio-caption"><b>Estudo de letras</b><span>Tipografia</span></div></div></div></div>
      <div className={'portfolio-scene portfolio-contact' + (page === 2 ? ' active' : '')}><span className="demo-kicker">TEM UMA IDEIA?</span><strong>Vamos dar<br />forma a ela.</strong><p>Identidade visual · Direção de arte</p><span className="portfolio-contact-action">Converse comigo ↗</span><small>Lia Mota / Disponível para novos projetos</small></div>
    </div>
    <div className="portfolio-index"><span>Designer independente · Contato ↗</span><span>0{page + 1} / 03</span></div>
  </div>
}
