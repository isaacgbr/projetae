import { ArrowIcon } from '../../../components/ui/ArrowIcon'

type BriefingHeaderProps = {
  onHome: () => void
}

/** Mantém as duas formas de retorno à Landing com a mesma ação de navegação. */
export function BriefingHeader({ onHome }: BriefingHeaderProps) {
  function handleLogoClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    onHome()
  }

  return (
    <header className="briefing-header">
      <a
        href="/"
        aria-label="Projetaê, início"
        onClick={handleLogoClick}
      >
        <img
          src="/brand/projetae-logo.svg"
          alt="Projetaê — Sua ideia começa aqui."
          width="188"
          height="59"
        />
      </a>

      <button
        type="button"
        className="welcome-return"
        onClick={onHome}
      >
        <ArrowIcon back /> Voltar ao início
      </button>
    </header>
  )
}
