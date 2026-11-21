import type { KeyboardEvent, MouseEvent } from 'react'
import { StartProjectButton } from './StartProjectButton'

const links = [
  ['#como-funciona', 'Como funciona'],
  ['#projetos', 'Projetos digitais'],
  ['#sobre', 'Sobre o Projetaê'],
] as const

export function LandingHeader({ onStart }: { onStart: () => void }) {
  function handleMenuKeyDown(event: KeyboardEvent<HTMLDetailsElement>) {
    if (event.key !== 'Escape') return
    event.currentTarget.open = false
    event.currentTarget.querySelector('summary')?.focus()
  }

  function handleMenuClick(event: MouseEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest('a, button')) {
      event.currentTarget.closest('details')?.removeAttribute('open')
    }
  }

  return (
    <header className="landing-header" id="inicio">
      <div className="landing-container landing-header-inner">
        <a className="landing-brand-link" href="#inicio" aria-label="Projetaê, início">
          <img
            className="landing-brand-logo"
            src="/brand/projetae-logo.svg"
            width="346"
            height="108"
            alt="Projetaê — Sua ideia começa aqui."
          />
        </a>
        <nav className="desktop-nav" aria-label="Navegação principal">
          {links.map(([href, label]) => (
            <a href={href} key={href}>{label}</a>
          ))}
        </nav>
        <div className="desktop-start">
          <StartProjectButton onStart={onStart} />
        </div>
        <details className="mobile-menu" onKeyDown={handleMenuKeyDown}>
          <summary>
            Menu <span className="menu-lines" aria-hidden="true" />
          </summary>
          <nav aria-label="Navegação mobile" onClick={handleMenuClick}>
            {links.map(([href, label]) => (
              <a href={href} key={href}>{label}</a>
            ))}
            <StartProjectButton onStart={onStart} />
          </nav>
        </details>
      </div>
    </header>
  )
}
