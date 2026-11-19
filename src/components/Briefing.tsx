import { useEffect, useRef, useState } from 'react'
import { formatPhone, initialAnswers, objectives, projectTypes, projectUses, steps, validateStep, visualDirections } from '../content'
import type { Answers } from '../content'
import { ArrowIcon } from './BriefingUI'
import './Briefing.css'
import { ProjectPreview } from './BriefingPreview'
import MotionStation from '../features/submission/MotionStation'
import { submitRequest } from '../services/submitRequest'
import { Turnstile } from './Turnstile'
import type { TurnstileHandle } from './Turnstile'

export function Briefing({ visible, onHome: exitToLanding }: { visible: boolean; onHome: () => void }) {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState('')
  const [website, setWebsite] = useState('')
  const [answers, setAnswers] = useState<Answers>(initialAnswers)
  const [active, setActive] = useState(0)
  const [unlocked, setUnlocked] = useState(0)
  const [confirmed, setConfirmed] = useState<number[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const heading = useRef<HTMLHeadingElement>(null)
  const stepMenu = useRef<HTMLDetailsElement>(null)
  const pendingErrorFocus = useRef(false)
  const submitting = useRef(false)
  const turnstile = useRef<TurnstileHandle>(null)
  useEffect(() => {
    if (!pendingErrorFocus.current) return
    pendingErrorFocus.current = false
    const first = Object.keys(errors)[0]
    const selectors: Record<string, string> = { contact: '#phone', project: '[name="project"]', objectives: '.objective-option input', visualDirection: '[name="visualDirection"]', customColors: 'input[type="color"]' }
    document.querySelector<HTMLElement>(selectors[first] || `#${first}`)?.focus()
  }, [errors])
  const completed = steps.map((_, index) => confirmed.includes(index) && Object.keys(validateStep(index, answers)).length === 0)
  function onHome() {
    setShowConfirmation(false)
    setActive(0)
    exitToLanding()
  }
  useEffect(() => {
    if (visible) { window.scrollTo(0, 0); heading.current?.focus({ preventScroll: true }) }
  }, [active, visible])
  function update<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers(previous => ({ ...previous, [key]: value }))
    setErrors({})
  }
  function showErrors(nextErrors: Record<string, string>, step: number) {
    pendingErrorFocus.current = true
    setActive(step)
    setErrors(nextErrors)
  }
  function navigate(target: number) {
    if (target > unlocked) return
    if (stepMenu.current) stepMenu.current.open = false
    if (target > active) {
      for (let index = 0; index < target; index++) {
        const nextErrors = validateStep(index, answers)
        if (Object.keys(nextErrors).length) { showErrors(nextErrors, index); return }
      }
    }
    setErrors({})
    setActive(target)
  }
  function advance() {
    for (let index = 0; index <= active; index++) {
      const nextErrors = validateStep(index, answers)
      if (Object.keys(nextErrors).length) { showErrors(nextErrors, index); return }
    }
    setConfirmed(previous => previous.includes(active) ? previous : [...previous, active])
    setUnlocked(previous => Math.max(previous, active + 1))
    setErrors({})
    setActive(active + 1)
  }
  async function sendSubmission() {
    if (submitting.current) return
    for (let index = 0; index < 4; index++) {
      const nextErrors = validateStep(index, answers)
      if (Object.keys(nextErrors).length) { showErrors(nextErrors, index); return }
    }
    submitting.current = true
    setIsSubmitting(true)
    setSubmissionError('')
    try {
      if (!turnstile.current) throw new Error('Não foi possível iniciar a verificação de segurança. Tente novamente.')
      const turnstileToken = await turnstile.current.execute()
      await submitRequest(answers, { turnstileToken, website })
      setShowConfirmation(true)
    } catch (error) {
      turnstile.current?.reset()
      setWebsite('')
      setSubmissionError(error instanceof Error ? error.message : 'Não foi possível enviar sua solicitação. Tente novamente.')
    } finally {
      submitting.current = false
      setIsSubmitting(false)
    }
  }
  function startNewBriefing() {
    setAnswers(initialAnswers)
    setUnlocked(0)
    setConfirmed([])
    setErrors({})
    setSubmissionError('')
    setWebsite('')
    setActive(0)
    setShowConfirmation(false)
  }
  function errorProps(key: string) {
    if (key === 'phone' && errors.contact) return { 'aria-invalid': true as const, 'aria-describedby': 'contact-error' }
    return { 'aria-invalid': errors[key] ? true as const : undefined, 'aria-describedby': errors[key] ? `${key}-error` : undefined }
  }
  const errorMessage = (key: string) => errors[key] ? <p className="briefing-error" role="alert" id={`${key}-error`}>{errors[key]}</p> : null
  const review = [
    { title: 'Contato', values: [answers.phone.trim(), answers.email.trim()].filter(Boolean) },
    { title: 'Projeto', values: [answers.project, ...(answers.project === 'Ainda não sei qual escolher' ? [answers.projectDescription] : [])] },
    { title: 'Objetivos', values: [...answers.objectives.filter(item => item !== 'Outro'), ...(answers.objectives.includes('Outro') ? [`Outro: ${answers.otherObjective}`] : [])] },
    { title: 'Materiais e referências', values: [answers.link.trim(), answers.notes.trim(), answers.visualDirection && `Direção visual: ${answers.visualDirection}`].filter(Boolean) },
  ]
  return <>
    <header className="briefing-header">
      <a href="/" aria-label="Projetaê, início" onClick={event => { event.preventDefault(); onHome() }}><img src="/brand/projetae-logo.svg" alt="Projetaê — Sua ideia começa aqui." width="188" height="59" /></a>
      <button type="button" className="welcome-return" onClick={onHome}><ArrowIcon back /> Voltar ao início</button>
    </header>
    {showConfirmation ? <MotionStation onReplay={startNewBriefing} /> : <>
    <nav className="briefing-progress" aria-label="Etapas do briefing">
      <div className="briefing-progress-top"><p className="briefing-position"><span>{String(active + 1).padStart(2, '0')} / 05</span> — {steps[active].label}</p>
      <details ref={stepMenu} onKeyDown={event => { if (event.key === 'Escape' && stepMenu.current) { stepMenu.current.open = false; stepMenu.current.querySelector('summary')?.focus() } }}><summary>Etapas</summary><ol>{steps.map((step, index) => <li key={step.label}>
        <button type="button" disabled={index > unlocked} aria-current={active === index ? 'step' : undefined} onClick={() => navigate(index)}>
          <span className="briefing-step-number" aria-hidden="true">{completed[index] ? '✓' : index + 1}</span>
          <span>{step.label}<small>{index > unlocked ? 'Bloqueada' : completed[index] ? active === index ? 'Concluída · Atual' : 'Concluída' : active === index ? 'Atual' : 'Disponível'}</small></span>
        </button>
      </li>)}</ol></details></div>
      <div className="briefing-track" role="progressbar" aria-label="Etapas de preenchimento concluídas" aria-valuemin={0} aria-valuemax={4} aria-valuenow={completed.slice(0, 4).filter(Boolean).length}><span style={{ width: `${completed.slice(0, 4).filter(Boolean).length * 25}%` }} /></div>
    </nav>
    <main id="briefing-main" key={active} tabIndex={-1} className={`briefing-main briefing-stage ${active === 1 ? 'briefing-project-stage' : ''}`}>
      <h1 ref={heading} tabIndex={-1}>{steps[active].title}</h1>
      <p className="step-subtitle">{steps[active].subtitle}</p>
      {errors.contact && <div id="contact-error" className="briefing-error-summary" role="alert">{errors.contact}</div>}
      <form noValidate onSubmit={event => { event.preventDefault(); if (active < 4) advance() }}>
        <div className="briefing-fields">
          {active === 0 && <>
            <div className="field"><label htmlFor="phone">WhatsApp / Telefone</label><input className="field-control" id="phone" name="phone" type="tel" autoComplete="tel" placeholder="(86) 99999-9999" value={answers.phone} onChange={event => {
              const input = event.currentTarget
              const digitsBefore = input.value.slice(0, input.selectionStart ?? input.value.length).replace(/\D/g, '').length
              const formatted = formatPhone(input.value)
              update('phone', formatted)
              requestAnimationFrame(() => {
                let count = 0, caret = 0
                while (caret < formatted.length && count < digitsBefore) { if (/\d/.test(formatted[caret])) count++; caret++ }
                input.setSelectionRange(caret, caret)
              })
            }} onBlur={event => { if (event.relatedTarget instanceof HTMLElement && event.relatedTarget.closest('button')) return; if (answers.phone.trim()) setErrors(previous => { const next = { ...previous }; delete next.phone; const message = validateStep(0, answers).phone; if (message) next.phone = message; return next }) }} {...errorProps('phone')} />{errorMessage('phone')}</div>
            <div className="field"><label htmlFor="email">E-mail</label><input className="field-control" id="email" name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" value={answers.email} onChange={event => update('email', event.target.value)} onBlur={event => { if (event.relatedTarget instanceof HTMLElement && event.relatedTarget.closest('button')) return; if (answers.email.trim()) setErrors(previous => { const next = { ...previous }; delete next.email; const message = validateStep(0, answers).email; if (message) next.email = message; return next }) }} {...errorProps('email')} />{errorMessage('email')}</div>
            <p className="field-hint">Basta um contato válido. Se preencher os dois, confira ambos.</p>
          </>}
          {active === 1 && <>
            <fieldset {...errorProps('project')}><legend className="briefing-sr-only">Tipo de projeto</legend><div className="project-options">{projectTypes.map((type, index) => <label className={`project-option ${index === 4 ? 'project-unsure' : ''}`} key={type.name}>
              <input type="radio" name="project" value={type.name} checked={answers.project === type.name} onChange={() => update('project', type.name)} />
              {index < 4 && <ProjectPreview kind={index} />}
              <span className="project-option-name">{type.name}{answers.project === type.name && <span className="project-selection" aria-hidden="true">✓ Selecionado</span>}</span>
              {index < 4 && answers.project === type.name && <span className="project-inline-detail"><span>{type.about}</span><span><strong>Boa escolha para: </strong>{projectUses[index]}</span></span>}
            </label>)}</div>{errorMessage('project')}</fieldset>
            {answers.project && answers.project !== projectTypes[4].name && <div className="project-explanation" key={answers.project}><p>{projectTypes.find(type => type.name === answers.project)?.about}</p><p><strong>Boa escolha para: </strong>{projectUses[projectTypes.findIndex(type => type.name === answers.project)]}</p></div>}
            {answers.project === 'Ainda não sei qual escolher' && <div className="field"><label htmlFor="projectDescription">Conte o que você gostaria de criar</label><textarea className="field-control" id="projectDescription" value={answers.projectDescription} onChange={event => update('projectDescription', event.target.value)} rows={3} {...errorProps('projectDescription')} />{errorMessage('projectDescription')}</div>}
          </>}
          {active === 2 && <>
            <fieldset {...errorProps('objectives')}><legend className="briefing-sr-only">Objetivos do projeto</legend><div className="objective-options">{objectives.map(objective => <label className="objective-option" key={objective}><input type="checkbox" checked={answers.objectives.includes(objective)} onChange={event => update('objectives', event.target.checked ? [...answers.objectives, objective] : answers.objectives.filter(item => item !== objective))} /><span className="objective-check" aria-hidden="true">{answers.objectives.includes(objective) ? '✓' : '+'}</span><span>{objective}</span></label>)}</div>{errorMessage('objectives')}</fieldset>
            {answers.objectives.includes('Outro') && <div className="field"><label htmlFor="otherObjective">Qual outro objetivo?</label><textarea className="field-control" id="otherObjective" rows={3} value={answers.otherObjective} onChange={event => update('otherObjective', event.target.value)} {...errorProps('otherObjective')} />{errorMessage('otherObjective')}</div>}
          </>}
          {active === 3 && <>
            <p className="briefing-optional">Ainda não tem materiais ou referências? Sem problema. Esta etapa é opcional.</p>
            <fieldset><legend>Tem alguma preferência visual? <span>(opcional)</span></legend><div className="visual-directions">{visualDirections.slice(0, 4).map((direction, index) => <label className={`visual-direction direction-${index}`} key={direction}><input type="radio" name="visualDirection" checked={answers.visualDirection === direction} onChange={() => update('visualDirection', direction)} /><span className="direction-swatch" aria-hidden="true"><i /><i /><i /></span><span>{direction}</span><span className="direction-check" aria-hidden="true">{answers.visualDirection === direction ? '✓' : ''}</span></label>)}</div>
              <div className="visual-alternatives">{['Não tenho preferência', 'Personalizado'].map(direction => <label key={direction}><input type="radio" name="visualDirection" checked={answers.visualDirection === direction} onChange={() => update('visualDirection', direction)} /><span>{direction}</span></label>)}</div>
              {answers.visualDirection === 'Personalizado' && <div className="custom-colors"><p className="field-hint">Escolha até 4 cores como referência visual para o projeto.</p><div className="custom-color-list">{answers.customColors.map((color, index) => <div className="custom-color" key={index}><label><span className="briefing-sr-only">Cor {index + 1}</span><input type="color" value={color} onChange={event => update('customColors', answers.customColors.map((value, position) => position === index ? event.target.value : value))} /></label><button type="button" aria-label={`Remover cor ${index + 1}`} onClick={() => update('customColors', answers.customColors.filter((_, position) => position !== index))}>Remover</button></div>)}</div><div className="custom-color-actions"><button type="button" disabled={answers.customColors.length >= 4} onClick={() => update('customColors', [...answers.customColors, '#a65d3f'])}>Adicionar cor</button><button type="button" disabled={!answers.customColors.length} onClick={() => update('customColors', [])}>Limpar cores</button></div></div>}
              {errorMessage('visualDirection')}{errorMessage('customColors')}
            </fieldset>
            <div className="field"><label htmlFor="link">Link de referência <span>(opcional)</span></label><p className="field-hint" id="link-hint">Pode ser um site, um perfil no Instagram ou uma inspiração no Pinterest ou Behance.</p><input className="field-control" type="url" id="link" placeholder="https://exemplo.com" value={answers.link} onChange={event => update('link', event.target.value)} {...errorProps('link')} aria-describedby={errors.link ? 'link-hint link-error' : 'link-hint'} />{errorMessage('link')}</div>
            <div className="field"><label htmlFor="notes">Observação <span>(opcional)</span></label><textarea className="field-control" id="notes" rows={4} placeholder="Conte sobre os materiais ou referências que você já tem." value={answers.notes} onChange={event => update('notes', event.target.value)} /></div>
          </>}
          {active === 4 && <>
            <div className="briefing-review">{review.map((section, index) => section.values.length > 0 && <section key={section.title} aria-labelledby={`review-${index}`}><div className="briefing-review-heading"><h2 id={`review-${index}`}><span>{String(index + 1).padStart(2, '0')} — </span>{section.title}</h2><button className="text-button" type="button" onClick={() => navigate(index)} aria-label={`Editar ${section.title}`}>Editar <ArrowIcon /></button></div><ul className={index === 2 ? 'review-objectives' : ''}>{section.values.map((value, position) => <li key={position}>{value}</li>)}</ul>{index === 3 && answers.visualDirection === 'Personalizado' && <div className="review-colors" aria-label="Cores personalizadas">{answers.customColors.map((color, position) => <span key={position} style={{ backgroundColor: color }} role="img" aria-label={`Cor ${position + 1}: ${color}`} title={color} />)}</div>}</section>)}</div>
            <div className="briefing-honeypot" aria-hidden="true">
              <label htmlFor="company-website">Site da empresa</label>
              <input id="company-website" name="companyWebsite" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={event => setWebsite(event.target.value)} />
            </div>
            <Turnstile ref={turnstile} />
          </>}
        </div>
        <div className="navigation briefing-actions">
          <button type="button" className="button button-secondary" onClick={() => active === 0 ? onHome() : navigate(active - 1)}><ArrowIcon back /> Voltar</button>
          {active < 4 ? <button type="submit" className="button button-primary">{active === 3 ? 'Ver revisão' : 'Continuar'} <ArrowIcon /></button> : <button type="button" className="button button-primary" onClick={sendSubmission} disabled={isSubmitting} aria-busy={isSubmitting} aria-describedby={submissionError ? 'submission-notice submission-error' : 'submission-notice'}>{isSubmitting ? <><span className="submission-spinner" aria-hidden="true" /> Enviando...</> : <>Enviar solicitação <ArrowIcon /></>}</button>}
        </div>
      </form>
      {submissionError && <p className="briefing-error-summary" id="submission-error" role="alert">{submissionError}</p>}
      <p className="preview-notice" id="submission-notice">{active === 4 ? 'Sua solicitação será enviada ao Projetaê para análise.' : 'Suas respostas permanecem neste dispositivo até o envio.'}</p>
    </main>
    </>}
  </>
}
