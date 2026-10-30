import { useRef, useState } from 'react'
import { ArrowIcon, Field, PreviewNotice, Progress } from './components/BriefingUI'
import { LandingPage } from './components/LandingPage'
import { steps } from './content'

const formSteps = steps.slice(1)

export default function App() {
  const [isForm, setIsForm] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const landingHeading = useRef<HTMLHeadingElement>(null)
  const current = formSteps[activeStep]

  function navigate(index: number) {
    setActiveStep(index)
    setHasStarted(true)
    setIsForm(true)
    requestAnimationFrame(() => {
      window.scrollTo(0, 0)
      heading.current?.focus({ preventScroll: true })
    })
  }

  function showLanding() {
    setIsForm(false)
    requestAnimationFrame(() => {
      window.scrollTo(0, 0)
      landingHeading.current?.focus({ preventScroll: true })
    })
  }

  return (
    <div className={`page-shell ${isForm ? 'is-form' : 'is-welcome'}`}>
      <a className="skip-link" href={isForm ? '#briefing-main' : '#main'}>Pular para o conteúdo</a>
      {isForm && <header className="site-header flex items-center justify-between gap-6">
        <a className="wordmark" href="/" aria-label="Projetaê, início" onClick={(event) => { event.preventDefault(); showLanding() }}>
          <span className="brand-name">projeta<span className="brand-accent">ê</span></span>
          <span className="brand-tagline">Sua ideia começa aqui.</span>
        </a>
        <button className="welcome-return" onClick={showLanding}><ArrowIcon back /> Voltar ao início</button>
      </header>}
      {!isForm && <LandingPage headingRef={landingHeading} onStart={() => navigate(activeStep)} />}
      {/* Keep the open step mounted while visiting the landing, preserving its inputs. */}
      {hasStarted && <div hidden={!isForm}>
      <Progress steps={formSteps} activeStep={activeStep} onNavigate={navigate} />
      <main id="briefing-main" tabIndex={-1} className="main-content form-screen">
        <section className="step-content" key={activeStep} aria-labelledby="step-title">
          <div className="step-body">
          <h1 id="step-title" ref={heading} tabIndex={-1}>{current.title}</h1>
          <p className="step-subtitle">{current.subtitle}</p>
          {activeStep === 3 ? (
            <>
              <div className="review-intro"><span className="review-mark" aria-hidden="true">◎</span><p>Esta é uma prévia da revisão. As respostas dos campos ilustrativos não são salvas nem reunidas aqui.</p></div>
              <div className="review-list">
                {formSteps.slice(0, 3).map((step, index) => (
                  <div className="review-row flex items-center justify-between gap-4" key={step.label}>
                    <div><h2>{step.label}</h2><p>{step.summary}</p></div>
                    <button className="text-button" onClick={() => navigate(index)} aria-label={`Ver etapa ${step.label}`}>Ver etapa <ArrowIcon /></button>
                  </div>
                ))}
              </div>
              <div className="navigation flex items-center justify-between gap-4">
                <button className="button button-secondary" onClick={() => navigate(2)}><ArrowIcon back /> Voltar</button>
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
                <button className="button button-secondary" onClick={() => activeStep === 0 ? showLanding() : navigate(activeStep - 1)}><ArrowIcon back /> Voltar</button>
                <button className="button button-primary" onClick={() => navigate(activeStep + 1)}>{activeStep === 2 ? 'Ver revisão' : 'Continuar'} <ArrowIcon /></button>
              </div>
              <PreviewNotice fields />
            </>
          )}
          </div>
        </section>
      </main>
      </div>}
    </div>
  )
}
