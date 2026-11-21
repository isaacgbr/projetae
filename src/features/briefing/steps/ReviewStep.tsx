import type { ChangeEvent, RefObject } from 'react'

import { ArrowIcon } from '../../../components/ui/ArrowIcon'
import { Turnstile } from '../../../components/Turnstile'
import type { TurnstileHandle } from '../../../components/Turnstile'
import type { Answers } from '../../../content'

type ReviewStepProps = {
  answers: Answers
  website: string
  turnstile: RefObject<TurnstileHandle | null>
  onWebsiteChange: (website: string) => void
  onNavigate: (step: number) => void
}

type ReviewSection = {
  title: string
  values: string[]
}

/** Monta a leitura final a partir do mesmo estado que será congelado no envio. */
function buildReview(answers: Answers): ReviewSection[] {
  return [
    {
      title: 'Contato',
      values: [
        `Nome: ${answers.name.trim()}`,
        answers.phone.trim(),
        answers.email.trim(),
      ].filter(Boolean),
    },
    {
      title: 'Projeto',
      values: [
        answers.project,
        ...(answers.project === 'Ainda não sei qual escolher'
          ? [answers.projectDescription]
          : []),
      ],
    },
    {
      title: 'Objetivos',
      values: [
        ...answers.objectives.filter(item => item !== 'Outro'),
        ...(answers.objectives.includes('Outro')
          ? [`Outro: ${answers.otherObjective}`]
          : []),
      ],
    },
    {
      title: 'Materiais e referências',
      values: [
        answers.link.trim(),
        answers.notes.trim(),
        answers.visualDirection && `Direção visual: ${answers.visualDirection}`,
      ].filter(Boolean),
    },
  ]
}

export function ReviewStep({
  answers,
  website,
  turnstile,
  onWebsiteChange,
  onNavigate,
}: ReviewStepProps) {
  const review = buildReview(answers)

  function handleWebsiteChange(event: ChangeEvent<HTMLInputElement>) {
    onWebsiteChange(event.target.value)
  }

  return (
    <>
      <div className="briefing-review">
        {review.map((section, index) => section.values.length > 0 && (
          <section key={section.title} aria-labelledby={`review-${index}`}>
            <div className="briefing-review-heading">
              <h2 id={`review-${index}`}>
                <span>{String(index + 1).padStart(2, '0')} — </span>
                {section.title}
              </h2>
              <button
                className="text-button"
                type="button"
                onClick={() => onNavigate(index)}
                aria-label={`Editar ${section.title}`}
              >
                Editar <ArrowIcon />
              </button>
            </div>

            <ul className={index === 2 ? 'review-objectives' : ''}>
              {section.values.map((value, position) => (
                <li key={position}>{value}</li>
              ))}
            </ul>

            {index === 3 && answers.visualDirection === 'Personalizado' && (
              <div className="review-colors" aria-label="Cores personalizadas">
                {answers.customColors.map((color, position) => (
                  <span
                    key={position}
                    style={{ backgroundColor: color }}
                    role="img"
                    aria-label={`Cor ${position + 1}: ${color}`}
                    title={color}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Campo-armadilha permanece fora da navegação visual e acompanha o payload público. */}
      <div className="briefing-honeypot" aria-hidden="true">
        <label htmlFor="company-website">Site da empresa</label>
        <input
          id="company-website"
          name="companyWebsite"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={handleWebsiteChange}
        />
      </div>

      <Turnstile ref={turnstile} />
    </>
  )
}
