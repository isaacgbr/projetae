const process = [
  ['Ideia', 'Conte o que você tem em mente.'],
  ['Briefing', 'Defina objetivos e referências.'],
  ['Solicitação', 'Revise os detalhes do seu projeto.'],
] as const

function ProcessVisual({ index }: { index: number }) {
  return (
    <div className={'process-visual process-visual-' + index} aria-hidden="true">
      {index === 0
        ? (
            <>
              <span className="idea-fragment fragment-one" />
              <span className="idea-fragment fragment-two" />
              <span className="note-mini">
                <i />
                <i />
                <i />
              </span>
              <span className="pencil-mini" />
            </>
          )
        : index === 1
          ? (
              <span className="checklist-mini">
                <span className="sheet-heading" />
                {[0, 1, 2].map((item) => (
                  <span className={'checklist-row checklist-row-' + item} key={item}>
                    <b>✓</b>
                    <i />
                  </span>
                ))}
              </span>
            )
          : (
              <>
                <span className="request-sheet">
                  <span className="sheet-heading" />
                  <i />
                  <i />
                  <i />
                  <span className="request-seal">✓</span>
                </span>
                <svg className="request-envelope" viewBox="0 0 104 62" fill="none">
                  <path d="M2 5h100v53H2z" fill="#e2c7ae" stroke="#af8464" />
                  <path
                    d="m2 5 50 31L102 5M2 58l33-29m67 29L69 29"
                    stroke="#af8464"
                    strokeLinejoin="round"
                  />
                </svg>
              </>
            )}
    </div>
  )
}

export function ProcessSection() {
  return (
    <section className="landing-section how-section landing-scene" id="como-funciona" aria-labelledby="how-title">
      <div className="landing-container scene-content">
        <div className="section-intro process-intro">
          <div>
            <p className="section-label">Como funciona</p>
            <h2 id="how-title">
              Da ideia à <span>solicitação.</span>
            </h2>
          </div>
        </div>
        <div className="process-flow">
          <div className="process-track" aria-hidden="true">
            <span />
          </div>
          <ol className="process-list">
            {process.map(([title, description], index) => (
              <li key={title} className="process-step">
                <ProcessVisual index={index} />
                <div className="process-caption">
                  <span className="process-number">0{index + 1}</span>
                  <h3>{title}</h3>
                </div>
                <p>{description}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="process-explanation">
          <p>Você não precisa chegar com tudo pronto.</p>
          <p>
            O briefing ajuda a organizar sua ideia e reunir as informações para entender o projeto e seus próximos passos.
          </p>
        </div>
      </div>
    </section>
  )
}
