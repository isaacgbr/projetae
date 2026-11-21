import type { ChangeEvent } from 'react'

import { visualDirections } from '../../../content'
import type { Answers } from '../../../content'
import type { AnswerUpdater, ErrorMessageRenderer, ErrorPropsGetter } from '../types'

type ReferencesStepProps = {
  answers: Answers
  update: AnswerUpdater
  errorProps: ErrorPropsGetter
  errorMessage: ErrorMessageRenderer
}

const alternativeDirections = ['Não tenho preferência', 'Personalizado']
const defaultCustomColor = '#a65d3f'

export function ReferencesStep({
  answers,
  update,
  errorProps,
  errorMessage,
}: ReferencesStepProps) {
  const linkErrorProps = errorProps('link')

  function handleVisualDirectionChange(direction: string) {
    update('visualDirection', direction)
  }

  function handleCustomColorChange(index: number, color: string) {
    const nextColors = answers.customColors.map((value, position) => (
      position === index ? color : value
    ))

    update('customColors', nextColors)
  }

  function handleRemoveColor(index: number) {
    update('customColors', answers.customColors.filter((_, position) => position !== index))
  }

  // O limite também é validado no domínio; aqui evitamos criar um quinto seletor.
  function handleAddColor() {
    update('customColors', [...answers.customColors, defaultCustomColor])
  }

  function handleClearColors() {
    update('customColors', [])
  }

  function handleLinkChange(event: ChangeEvent<HTMLInputElement>) {
    update('link', event.target.value)
  }

  function handleNotesChange(event: ChangeEvent<HTMLTextAreaElement>) {
    update('notes', event.target.value)
  }

  return (
    <>
      <p className="briefing-optional">
        Ainda não tem materiais ou referências? Sem problema. Esta etapa é opcional.
      </p>

      <fieldset>
        <legend>
          Tem alguma preferência visual? <span>(opcional)</span>
        </legend>

        <div className="visual-directions">
          {visualDirections.slice(0, 4).map((direction, index) => (
            <label className={`visual-direction direction-${index}`} key={direction}>
              <input
                type="radio"
                name="visualDirection"
                checked={answers.visualDirection === direction}
                onChange={() => handleVisualDirectionChange(direction)}
              />
              <span className="direction-swatch" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span>{direction}</span>
              <span className="direction-check" aria-hidden="true">
                {answers.visualDirection === direction ? '✓' : ''}
              </span>
            </label>
          ))}
        </div>

        <div className="visual-alternatives">
          {alternativeDirections.map(direction => (
            <label key={direction}>
              <input
                type="radio"
                name="visualDirection"
                checked={answers.visualDirection === direction}
                onChange={() => handleVisualDirectionChange(direction)}
              />
              <span>{direction}</span>
            </label>
          ))}
        </div>

        {answers.visualDirection === 'Personalizado' && (
          <div className="custom-colors">
            <p className="field-hint">
              Escolha até 4 cores como referência visual para o projeto.
            </p>

            <div className="custom-color-list">
              {answers.customColors.map((color, index) => (
                <div className="custom-color" key={index}>
                  <label>
                    <span className="briefing-sr-only">Cor {index + 1}</span>
                    <input
                      type="color"
                      value={color}
                      onChange={event => handleCustomColorChange(index, event.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    aria-label={`Remover cor ${index + 1}`}
                    onClick={() => handleRemoveColor(index)}
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>

            <div className="custom-color-actions">
              <button
                type="button"
                disabled={answers.customColors.length >= 4}
                onClick={handleAddColor}
              >
                Adicionar cor
              </button>
              <button
                type="button"
                disabled={!answers.customColors.length}
                onClick={handleClearColors}
              >
                Limpar cores
              </button>
            </div>
          </div>
        )}

        {errorMessage('visualDirection')}
        {errorMessage('customColors')}
      </fieldset>

      <div className="field">
        <label htmlFor="link">
          Link de referência <span>(opcional)</span>
        </label>
        <p className="field-hint" id="link-hint">
          Pode ser um site, um perfil no Instagram ou uma inspiração no Pinterest ou Behance.
        </p>
        <input
          className="field-control"
          type="url"
          id="link"
          placeholder="https://exemplo.com"
          value={answers.link}
          onChange={handleLinkChange}
          {...linkErrorProps}
          aria-describedby={getLinkDescription(linkErrorProps)}
        />
        {errorMessage('link')}
      </div>

      <div className="field">
        <label htmlFor="notes">
          Observação <span>(opcional)</span>
        </label>
        <textarea
          className="field-control"
          id="notes"
          rows={4}
          placeholder="Conte sobre os materiais ou referências que você já tem."
          value={answers.notes}
          onChange={handleNotesChange}
        />
      </div>
    </>
  )
}

/** Combina a ajuda permanente do campo com o erro condicional já usado pelo formulário. */
function getLinkDescription(attributes: ReturnType<ErrorPropsGetter>) {
  return attributes['aria-invalid'] ? 'link-hint link-error' : 'link-hint'
}
