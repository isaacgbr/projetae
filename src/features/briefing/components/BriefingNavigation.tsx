import { ArrowIcon } from '../../../components/ui/ArrowIcon'

type BriefingNavigationProps = {
  active: number
  isSubmitting: boolean
  submissionError: string
  onBack: () => void
  onSubmit: () => void
}

/** Centraliza as ações sem alterar a submissão nativa das etapas anteriores. */
export function BriefingNavigation({
  active,
  isSubmitting,
  submissionError,
  onBack,
  onSubmit,
}: BriefingNavigationProps) {
  const isReview = active === 4
  return (
    <div className="navigation briefing-actions">
      <button
        type="button"
        className="button button-secondary"
        onClick={onBack}
      >
        <ArrowIcon back /> Voltar
      </button>

      {!isReview ? (
        <button type="submit" className="button button-primary">
          {active === 3 ? 'Ver revisão' : 'Continuar'} <ArrowIcon />
        </button>
      ) : (
        <button
          type="button"
          className="button button-primary"
          onClick={onSubmit}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          aria-describedby={submissionError ? 'submission-notice submission-error' : 'submission-notice'}
        >
          {isSubmitting ? (
            <>
              <span className="submission-spinner" aria-hidden="true" /> Enviando...
            </>
          ) : (
            <>
              Enviar solicitação <ArrowIcon />
            </>
          )}
        </button>
      )}
    </div>
  )
}
