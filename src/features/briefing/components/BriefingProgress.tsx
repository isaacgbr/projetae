import { useRef } from 'react'

import { steps } from '../../../content'

type BriefingProgressProps = {
  active: number
  unlocked: number
  completed: boolean[]
  onNavigate: (step: number) => void
}

/** Resume o estado de uma etapa sem misturar a regra de navegação ao JSX. */
function getStepStatus(index: number, active: number, unlocked: number, completed: boolean[]) {
  if (index > unlocked) return 'Bloqueada'
  if (completed[index]) return active === index ? 'Concluída · Atual' : 'Concluída'
  return active === index ? 'Atual' : 'Disponível'
}

export function BriefingProgress({
  active,
  unlocked,
  completed,
  onNavigate,
}: BriefingProgressProps) {
  const stepMenu = useRef<HTMLDetailsElement>(null)
  const completedRequiredSteps = completed.slice(0, 4).filter(Boolean).length

  // O Escape fecha o seletor móvel e devolve o foco ao controle que o abriu.
  function handleMenuKeyDown(event: React.KeyboardEvent<HTMLDetailsElement>) {
    if (event.key !== 'Escape' || !stepMenu.current) return

    stepMenu.current.open = false
    stepMenu.current.querySelector('summary')?.focus()
  }

  function handleStepClick(index: number) {
    if (stepMenu.current) stepMenu.current.open = false
    onNavigate(index)
  }

  return (
    <nav className="briefing-progress" aria-label="Etapas do briefing">
      <div className="briefing-progress-top">
        <p className="briefing-position">
          <span>{String(active + 1).padStart(2, '0')} / 05</span> — {steps[active].label}
        </p>

        <details ref={stepMenu} onKeyDown={handleMenuKeyDown}>
          <summary>Etapas</summary>

          <ol>
            {steps.map((step, index) => (
              <li key={step.label}>
                <button
                  type="button"
                  disabled={index > unlocked}
                  aria-current={active === index ? 'step' : undefined}
                  onClick={() => handleStepClick(index)}
                >
                  <span className="briefing-step-number" aria-hidden="true">
                    {completed[index] ? '✓' : index + 1}
                  </span>

                  <span>
                    {step.label}
                    <small>{getStepStatus(index, active, unlocked, completed)}</small>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </details>
      </div>

      <div
        className="briefing-track"
        role="progressbar"
        aria-label="Etapas de preenchimento concluídas"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={completedRequiredSteps}
      >
        <span style={{ width: `${completedRequiredSteps * 25}%` }} />
      </div>
    </nav>
  )
}
