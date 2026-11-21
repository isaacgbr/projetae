import { useEffect, useRef, useState } from 'react'
import MotionStation from './MotionStation'
import type { Answers } from '../../content'

const project = 'Landing Page'

const demoAnswers: Answers = {
  name: 'Marina Exemplo',
  phone: '',
  email: 'marina@example.com',
  project,
  projectDescription: '',
  objectives: ['Conseguir novos clientes'],
  otherObjective: '',
  link: 'https://example.com/referencia',
  notes: 'Demonstração de uma página para um ateliê fictício.',
  visualDirection: 'Elegante',
  customColors: [],
}

const sections = [
  ['Contato', 'Marina Exemplo', 'marina@example.com'],
  ['Projeto', project],
  ['Objetivos', 'Conseguir novos clientes'],
  [
    'Materiais e referências',
    'https://example.com/referencia',
    'Demonstração de uma página para um ateliê fictício.',
    'Direção visual: Elegante',
  ],
]

export default function SubmissionDemo() {
  const [stage, setStage] = useState<'review' | 'scene'>('review')
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    heading.current?.focus({ preventScroll: true })
  }, [stage])

  if (stage === 'scene') {
    return (
      <MotionStation
        answers={demoAnswers}
        onNew={() => setStage('review')}
        onHome={() => window.location.assign('/')}
      />
    )
  }

  return (
    <div className="page-shell is-form briefing submission-demo">
      <header className="briefing-header">
        <a href="/">
          <img src="/brand/projetae-logo.svg" alt="Projetaê — início" width="188" height="59" />
        </a>
        <span>Demonstração interna</span>
      </header>

      <div className="briefing-progress">
        <p className="briefing-position">
          <span>05 / 05</span> — Revisão
        </p>
        <div
          className="briefing-track"
          role="progressbar"
          aria-label="Preenchimento concluído"
          aria-valuenow={100}
        >
          <span style={{ width: '100%' }} />
        </div>
      </div>

      <main className="briefing-main">
        <h1 ref={heading} tabIndex={-1}>
          Revise suas respostas
        </h1>
        <p className="step-subtitle">
          Dados fictícios para demonstrar o envio. Nenhum dado será enviado.
        </p>
        <div className="briefing-review">
          {sections.map(([title, ...values], index) => (
            <section key={title}>
              <h2>
                <span>0{index + 1} — </span>
                {title}
              </h2>
              <ul className={index === 2 ? 'review-objectives' : undefined}>
                {values.map((value) => <li key={value}>{value}</li>)}
              </ul>
            </section>
          ))}
        </div>
        <div className="navigation briefing-actions">
          <button
            type="button"
            className="button button-primary"
            onClick={() => setStage('scene')}
          >
            Enviar solicitação
          </button>
        </div>
      </main>
    </div>
  )
}
