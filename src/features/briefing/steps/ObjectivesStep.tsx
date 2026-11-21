import type { ChangeEvent } from 'react'

import { objectives } from '../../../content'
import type { Answers } from '../../../content'
import type { AnswerUpdater, ErrorMessageRenderer, ErrorPropsGetter } from '../types'

type ObjectivesStepProps = {
  answers: Answers
  update: AnswerUpdater
  errorProps: ErrorPropsGetter
  errorMessage: ErrorMessageRenderer
}

export function ObjectivesStep({
  answers,
  update,
  errorProps,
  errorMessage,
}: ObjectivesStepProps) {
  // Mantém a coleção de objetivos imutável ao marcar ou desmarcar uma opção.
  function handleObjectiveChange(objective: string, checked: boolean) {
    const nextObjectives = checked
      ? [...answers.objectives, objective]
      : answers.objectives.filter(item => item !== objective)

    update('objectives', nextObjectives)
  }

  function handleOtherObjectiveChange(event: ChangeEvent<HTMLTextAreaElement>) {
    update('otherObjective', event.target.value)
  }

  return (
    <>
      <fieldset {...errorProps('objectives')}>
        <legend className="briefing-sr-only">Objetivos do projeto</legend>

        <div className="objective-options">
          {objectives.map(objective => (
            <label className="objective-option" key={objective}>
              <input
                type="checkbox"
                checked={answers.objectives.includes(objective)}
                onChange={event => handleObjectiveChange(objective, event.target.checked)}
              />
              <span className="objective-check" aria-hidden="true">
                {answers.objectives.includes(objective) ? '✓' : '+'}
              </span>
              <span>{objective}</span>
            </label>
          ))}
        </div>

        {errorMessage('objectives')}
      </fieldset>

      {answers.objectives.includes('Outro') && (
        <div className="field">
          <label htmlFor="otherObjective">Qual outro objetivo?</label>
          <textarea
            className="field-control"
            id="otherObjective"
            rows={3}
            value={answers.otherObjective}
            onChange={handleOtherObjectiveChange}
            {...errorProps('otherObjective')}
          />
          {errorMessage('otherObjective')}
        </div>
      )}
    </>
  )
}
