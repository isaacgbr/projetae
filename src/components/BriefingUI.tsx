import type { FieldDefinition } from '../content'

export function StudioScene() {
  return (
    <div className="studio-scene scene-conversation" aria-hidden="true">
      <div className="scene-frame" style={{ backgroundImage: 'url(/images/interview-young-adult.webp)' }} />
    </div>
  )
}
export function ArrowIcon({ back = false }: { back?: boolean }) {
  return <svg className={back ? 'arrow-icon back' : 'arrow-icon'} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

export function Progress({ steps, activeStep, onNavigate }: {
  steps: { label: string }[]
  activeStep: number
  onNavigate: (index: number) => void
}) {
  return (
    <nav className="progress-nav" aria-label="Etapas do briefing">
      <p className="mobile-progress">Etapa {activeStep + 1} de {steps.length} <span>{steps[activeStep].label}</span></p>
      <ol className="progress-list">
        {steps.map((step, index) => (
          <li key={step.label} className={index === activeStep ? 'active' : index < activeStep ? 'previous' : ''}>
            <button className="progress-button" onClick={() => onNavigate(index)} aria-current={index === activeStep ? 'step' : undefined} aria-label={`Etapa ${index + 1}: ${step.label}`}>
              <span className="step-number" aria-hidden="true">0{index + 1}</span>
              <span className="step-label">{step.label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function Field({ id, label, type = 'text', placeholder, options, hint }: FieldDefinition) {
  const controlProps = { id, name: id, 'aria-describedby': hint ? `${id}-hint` : undefined, className: 'field-control' }
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {type === 'textarea' ? <textarea {...controlProps} placeholder={placeholder} rows={3} />
        : type === 'select' ? <select {...controlProps} defaultValue=""><option value="" disabled>Selecione uma opção</option>{options?.map((option) => <option key={option}>{option}</option>)}</select>
          : <input {...controlProps} type={type} placeholder={placeholder} autoComplete="off" />}
      {hint && <p className="field-hint" id={`${id}-hint`}>{hint}</p>}
    </div>
  )
}

export function PreviewNotice({ fields = false }: { fields?: boolean }) {
  return <p className="preview-notice">Prévia da interface. O envio ainda não está disponível.{fields && <><br />Campos ilustrativos: o que você digitar não é salvo ao mudar de etapa.</>}</p>
}
