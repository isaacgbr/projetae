import { useRef, useState } from 'react'
import { ArrowIcon, Field, PreviewNotice, Progress, StudioScene } from './components/BriefingUI'
import { steps } from './content'

export default function App() {
  const [activeStep, setActiveStep] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const current = steps[activeStep]

  function navigate(index: number) {
    setActiveStep(index)
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true })
    })
  }

  return (
    <div className={`page-shell ${activeStep === 0 ? 'is-welcome' : 'is-form'}`}>
      <a className="skip-link" href="#main">Pular para o conteúdo</a>
      <header className="site-header flex items-center justify-between gap-6">
        <a className="wordmark" href="#" aria-label="Briefing Web, início" onClick={(event) => { event.preventDefault(); navigate(0) }}>
          briefing <span className="brand-slash">/</span> <span className="brand-light">web</span>
        </a>
        {activeStep > 0 && <button className="welcome-return" onClick={() => navigate(0)}><ArrowIcon back /> Boas-vindas</button>}
      </header>
      <Progress steps={steps} activeStep={activeStep} onNavigate={navigate} />
      <main id="main" tabIndex={-1} className={`main-content ${activeStep === 0 ? 'welcome' : 'form-screen'}`}>
        <section className="step-content" key={activeStep} aria-labelledby="step-title">
          {activeStep === 0 && <StudioScene />}
          <div className="step-body">
          <h1 id="step-title" ref={heading} tabIndex={-1}>{activeStep === 0 ? <>Conte sua ideia.<br /><span>Vamos construir juntos.</span></> : current.title}</h1>
          <p className="step-subtitle">{activeStep === 0 ? 'Um espaço simples e objetivo para entendermos seu negócio, suas necessidades e o que você deseja construir.' : current.subtitle}</p>
          {activeStep === 0 ? (
            <>

              <div className="welcome-actions"><button className="button button-primary" onClick={() => navigate(1)}>Começar briefing <ArrowIcon /></button>
              <PreviewNotice /></div>
            </>
          ) : activeStep === 4 ? (
            <>
              <div className="review-intro"><span className="review-mark" aria-hidden="true">◎</span><p>Esta é uma prévia da revisão. As respostas dos campos ilustrativos não são salvas nem reunidas aqui.</p></div>
              <div className="review-list">
                {steps.slice(1, 4).map((step, index) => (
                  <div className="review-row flex items-center justify-between gap-4" key={step.label}>
                    <div><h2>{step.label}</h2><p>{step.summary}</p></div>
                    <button className="text-button" onClick={() => navigate(index + 1)} aria-label={`Ver etapa ${step.label}`}>Ver etapa <ArrowIcon /></button>
                  </div>
                ))}
              </div>
              <div className="navigation flex items-center justify-between gap-4">
                <button className="button button-secondary" onClick={() => navigate(3)}><ArrowIcon back /> Voltar</button>
                <button className="button button-primary" disabled aria-describedby="submission-notice">Envio indisponível <ArrowIcon /></button>
              </div>
              <p className="preview-notice" id="submission-notice">Prévia da interface. O envio ainda não está disponível. Nenhuma solicitação será enviada.</p>
            </>
          ) : (
            <>
              <form className="fields" noValidate onSubmit={(event) => event.preventDefault()}>
                {current.fields?.map((field) => <Field key={field.id} {...field} />)}
              </form>
              <div className="navigation flex items-center justify-between gap-4">
                <button className="button button-secondary" onClick={() => navigate(activeStep - 1)}><ArrowIcon back /> Voltar</button>
                <button className="button button-primary" onClick={() => navigate(activeStep + 1)}>{activeStep === 3 ? 'Ver revisão' : 'Continuar'} <ArrowIcon /></button>
              </div>
              <PreviewNotice fields />
            </>
          )}
          </div>
        </section>
      </main>

    </div>
  )
}