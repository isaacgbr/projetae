import type { ChangeEvent } from 'react'

import { projectTypes, projectUses } from '../../../content'
import type { Answers } from '../../../content'
import { ProjectPreview } from '../components/ProjectPreview'
import type { AnswerUpdater, ErrorMessageRenderer, ErrorPropsGetter } from '../types'

type ProjectStepProps = {
  answers: Answers
  update: AnswerUpdater
  errorProps: ErrorPropsGetter
  errorMessage: ErrorMessageRenderer
}

export function ProjectStep({
  answers,
  update,
  errorProps,
  errorMessage,
}: ProjectStepProps) {
  const selectedProjectIndex = projectTypes.findIndex(type => type.name === answers.project)
  const selectedProject = projectTypes[selectedProjectIndex]

  function handleProjectChange(project: string) {
    update('project', project)
  }

  function handleDescriptionChange(event: ChangeEvent<HTMLTextAreaElement>) {
    update('projectDescription', event.target.value)
  }

  return (
    <>
      <fieldset {...errorProps('project')}>
        <legend className="briefing-sr-only">Tipo de projeto</legend>

        <div className="project-options">
          {projectTypes.map((type, index) => (
            <label
              className={`project-option ${index === 4 ? 'project-unsure' : ''}`}
              key={type.name}
            >
              <input
                type="radio"
                name="project"
                value={type.name}
                checked={answers.project === type.name}
                onChange={() => handleProjectChange(type.name)}
              />

              {index < 4 && <ProjectPreview kind={index} />}

              <span className="project-option-name">
                {type.name}
                {answers.project === type.name && (
                  <span className="project-selection" aria-hidden="true">
                    ✓ Selecionado
                  </span>
                )}
              </span>

              {index < 4 && answers.project === type.name && (
                <span className="project-inline-detail">
                  <span>{type.about}</span>
                  <span>
                    <strong>Boa escolha para: </strong>
                    {projectUses[index]}
                  </span>
                </span>
              )}
            </label>
          ))}
        </div>

        {errorMessage('project')}
      </fieldset>

      {/* O resumo amplia a opção selecionada sem duplicar a regra que define seu conteúdo. */}
      {selectedProject && selectedProjectIndex < 4 && (
        <div className="project-explanation" key={answers.project}>
          <p>{selectedProject.about}</p>
          <p>
            <strong>Boa escolha para: </strong>
            {projectUses[selectedProjectIndex]}
          </p>
        </div>
      )}

      {answers.project === 'Ainda não sei qual escolher' && (
        <div className="field">
          <label htmlFor="projectDescription">Conte o que você gostaria de criar</label>
          <textarea
            className="field-control"
            id="projectDescription"
            value={answers.projectDescription}
            onChange={handleDescriptionChange}
            rows={3}
            {...errorProps('projectDescription')}
          />
          {errorMessage('projectDescription')}
        </div>
      )}
    </>
  )
}
