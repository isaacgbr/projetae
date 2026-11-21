import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { ArrowIcon } from '../../../components/ui/ArrowIcon'
import { projects } from '../projects.data'
import { ProjectDemo } from './ProjectDemo'

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
      // Mede o contêiner de posicionamento, nunca a superfície inclinada.
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
    setSelection((currentSelection) => ({
      index: (currentSelection.index + delta + projects.length) % projects.length,
      visit: currentSelection.visit + 1,
    }))
  }

  function select(index: number) {
    setSelection((currentSelection) => currentSelection.index === index
      ? currentSelection
      : { index, visit: currentSelection.visit + 1 })
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

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
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
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary || event.button !== 0 || (event.target as HTMLElement).closest('button, a')) return
    const project = (event.target as HTMLElement).closest<HTMLElement>('[data-project-index]')
    gesture.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      project: project ? Number(project.dataset.projectIndex) : null,
    }
    setSelection((currentSelection) => ({ ...currentSelection, visit: currentSelection.visit + 1 }))
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = gesture.current
    if (!start || start.id !== event.pointerId) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (event.cancelable) event.preventDefault()
      event.currentTarget.dataset.dragging = 'true'
      event.currentTarget.style.setProperty('--drag-offset', `${Math.max(-60, Math.min(60, dx * .2))}px`)
    }
  }

  return <div className="project-carousel" role="region" aria-roledescription="carrossel" aria-labelledby="services-title">
    <div
      className="carousel-viewport"
      tabIndex={0}
      role="group"
      aria-label="Prévias dos projetos. Use as setas do teclado ou arraste para navegar."
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={(event) => resetDrag(event.currentTarget)}
      onLostPointerCapture={(event) => resetDrag(event.currentTarget)}
    >
      {projects.map((project, index) => {
        const distance = (index - active + projects.length) % projects.length
        const position = distance === 0
          ? 'active'
          : distance === 1
            ? 'next'
            : distance === projects.length - 1
              ? 'previous'
              : 'parked'

        return <div
          key={project.type}
          className={'carousel-project service-' + project.type}
          data-position={position}
          data-project-index={index}
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} de ${projects.length}: ${project.name}`}
          aria-hidden={distance !== 0}
        >
          <ProjectTilt active={distance === 0 && !dragging}>
            <ProjectDemo project={project} active={distance === 0 && !dragging} visit={selection.visit} />
          </ProjectTilt>
        </div>
      })}
    </div>
    <div className="carousel-caption">
      <div className="carousel-copy" aria-live="polite" aria-atomic="true"><h3>{current.name}</h3><p>{current.description}</p></div>
      <div className="carousel-navigation" aria-label="Navegação dos projetos">
        <button className="carousel-arrow" onClick={() => navigate(-1)} aria-label="Projeto anterior"><ArrowIcon back /></button>
        <span className="carousel-counter" aria-hidden="true">0{active + 1}<span> / 04</span></span>
        <button className="carousel-arrow" onClick={() => navigate(1)} aria-label="Próximo projeto"><ArrowIcon /></button>
      </div>
    </div>
    <div className="carousel-pagination" role="group" aria-label="Escolher projeto">{projects.map((project, index) => <button key={project.type} aria-label={'Mostrar ' + project.name} aria-current={index === active ? 'true' : undefined} onClick={() => select(index)}><span /></button>)}</div>
  </div>
}
