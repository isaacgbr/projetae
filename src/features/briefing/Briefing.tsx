import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import './styles/briefing.css'
import type { TurnstileHandle } from '../../components/Turnstile'
import { initialAnswers, steps, validateStep } from '../../content'
import type { Answers } from '../../content'
import MotionStation from '../submission/MotionStation'
import { submitRequest } from '../../services/submitRequest'
import { BriefingHeader } from './components/BriefingHeader'
import { BriefingNavigation } from './components/BriefingNavigation'
import { BriefingProgress } from './components/BriefingProgress'
import { ContactStep } from './steps/ContactStep'
import { ObjectivesStep } from './steps/ObjectivesStep'
import { ProjectStep } from './steps/ProjectStep'
import { ReferencesStep } from './steps/ReferencesStep'
import { ReviewStep } from './steps/ReviewStep'
import type { BriefingErrors } from './types'

type BriefingProps = {
  visible: boolean
  onHome: () => void
}

export function Briefing({ visible, onHome: exitToLanding }: BriefingProps) {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [submittedAnswers, setSubmittedAnswers] = useState<Answers | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState('')
  const [website, setWebsite] = useState('')
  const [answers, setAnswers] = useState<Answers>(initialAnswers)
  const [active, setActive] = useState(0)
  const [unlocked, setUnlocked] = useState(0)
  const [confirmed, setConfirmed] = useState<number[]>([])
  const [errors, setErrors] = useState<BriefingErrors>({})

  const heading = useRef<HTMLHeadingElement>(null)
  const pendingErrorFocus = useRef(false)
  const submitting = useRef(false)
  const turnstile = useRef<TurnstileHandle>(null)
  const submissionController = useRef<AbortController | null>(null)

  // Ao sair do Briefing, cancela a requisição e invalida qualquer prova pendente do Turnstile.
  useEffect(() => {
    if (!visible) {
      submissionController.current?.abort()
      turnstile.current?.reset()
    }

    return () => {
      submissionController.current?.abort()
    }
  }, [visible])

  // A validação pode mudar de etapa; o foco acompanha o primeiro erro exibido.
  useEffect(() => {
    if (!pendingErrorFocus.current) return

    pendingErrorFocus.current = false

    const firstError = Object.keys(errors)[0]
    const selectors: Record<string, string> = {
      contact: '#phone',
      project: '[name="project"]',
      objectives: '.objective-option input',
      visualDirection: '[name="visualDirection"]',
      customColors: 'input[type="color"]',
    }

    document.querySelector<HTMLElement>(selectors[firstError] || `#${firstError}`)?.focus()
  }, [errors])

  // Cada troca de etapa reposiciona a página e anuncia o novo título pelo foco.
  useEffect(() => {
    if (!visible) return

    window.scrollTo(0, 0)
    heading.current?.focus({ preventScroll: true })
  }, [active, visible])

  const completed = steps.map((_, index) => (
    confirmed.includes(index) && Object.keys(validateStep(index, answers)).length === 0
  ))

  function onHome() {
    if (submitting.current) return

    setShowConfirmation(false)
    setActive(0)
    exitToLanding()
  }

  function update<Key extends keyof Answers>(key: Key, value: Answers[Key]) {
    setAnswers(previous => ({ ...previous, [key]: value }))
    setErrors({})
  }

  function showErrors(nextErrors: BriefingErrors, step: number) {
    pendingErrorFocus.current = true
    setActive(step)
    setErrors(nextErrors)
  }

  function navigate(target: number) {
    if (submitting.current || target > unlocked) return

    // Ao avançar pelo menu, valida todas as etapas anteriores em ordem.
    if (target > active) {
      for (let index = 0; index < target; index++) {
        const nextErrors = validateStep(index, answers)

        if (Object.keys(nextErrors).length) {
          showErrors(nextErrors, index)
          return
        }
      }
    }

    setErrors({})
    setActive(target)
  }

  function advance() {
    if (submitting.current) return

    for (let index = 0; index <= active; index++) {
      const nextErrors = validateStep(index, answers)

      if (Object.keys(nextErrors).length) {
        showErrors(nextErrors, index)
        return
      }
    }

    setConfirmed(previous => previous.includes(active) ? previous : [...previous, active])
    setUnlocked(previous => Math.max(previous, active + 1))
    setErrors({})
    setActive(active + 1)
  }

  // Congela o conteúdo enviado e ignora resultados tardios de uma requisição cancelada.
  async function sendSubmission() {
    if (submitting.current || !visible) return

    for (let index = 0; index < 4; index++) {
      const nextErrors = validateStep(index, answers)

      if (Object.keys(nextErrors).length) {
        showErrors(nextErrors, index)
        return
      }
    }

    submitting.current = true
    setIsSubmitting(true)
    setSubmissionError('')

    const submission = structuredClone(answers)
    const controller = new AbortController()
    submissionController.current = controller

    try {
      if (!turnstile.current) {
        throw new Error('Não foi possível iniciar a verificação de segurança. Tente novamente.')
      }

      const turnstileToken = await turnstile.current.execute()
      controller.signal.throwIfAborted()

      await submitRequest(submission, { turnstileToken, website }, controller.signal)
      controller.signal.throwIfAborted()

      if (submissionController.current !== controller) return

      setSubmittedAnswers(submission)
      setShowConfirmation(true)
    } catch (error) {
      if (controller.signal.aborted || submissionController.current !== controller) return

      turnstile.current?.reset()
      setWebsite('')
      setSubmissionError(
        error instanceof Error
          ? error.message
          : 'Não foi possível enviar sua solicitação. Tente novamente.',
      )
    } finally {
      if (submissionController.current === controller) {
        submissionController.current = null
        submitting.current = false
        setIsSubmitting(false)
      }
    }
  }

  function startNewBriefing() {
    setAnswers(initialAnswers)
    setUnlocked(0)
    setConfirmed([])
    setErrors({})
    setSubmissionError('')
    setSubmittedAnswers(null)
    setWebsite('')
    setActive(0)
    setShowConfirmation(false)
  }

  function errorProps(key: string) {
    if (key === 'phone' && errors.contact) {
      return {
        'aria-invalid': true as const,
        'aria-describedby': 'contact-error',
      }
    }

    return {
      'aria-invalid': errors[key] ? true as const : undefined,
      'aria-describedby': errors[key] ? `${key}-error` : undefined,
    }
  }

  function errorMessage(key: string) {
    if (!errors[key]) return null

    return (
      <p className="briefing-error" role="alert" id={`${key}-error`}>
        {errors[key]}
      </p>
    )
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (active < 4) advance()
  }

  function handleBack() {
    if (active === 0) onHome()
    else navigate(active - 1)
  }

  function renderActiveStep() {
    if (active === 0) {
      return (
        <ContactStep
          answers={answers}
          update={update}
          setErrors={setErrors}
          errorProps={errorProps}
          errorMessage={errorMessage}
        />
      )
    }

    if (active === 1) {
      return (
        <ProjectStep
          answers={answers}
          update={update}
          errorProps={errorProps}
          errorMessage={errorMessage}
        />
      )
    }

    if (active === 2) {
      return (
        <ObjectivesStep
          answers={answers}
          update={update}
          errorProps={errorProps}
          errorMessage={errorMessage}
        />
      )
    }

    if (active === 3) {
      return (
        <ReferencesStep
          answers={answers}
          update={update}
          errorProps={errorProps}
          errorMessage={errorMessage}
        />
      )
    }

    return (
      <ReviewStep
        answers={answers}
        website={website}
        turnstile={turnstile}
        onWebsiteChange={setWebsite}
        onNavigate={navigate}
      />
    )
  }

  const notice = active === 4
    ? 'Sua solicitação será enviada ao Projetaê para análise.'
    : 'Suas respostas permanecem neste dispositivo até o envio.'

  return (
    <>
      <BriefingHeader onHome={onHome} />

      {visible && showConfirmation && submittedAnswers ? (
        <MotionStation
          answers={submittedAnswers}
          onNew={startNewBriefing}
          onHome={onHome}
        />
      ) : (
        <>
          <BriefingProgress
            active={active}
            unlocked={unlocked}
            completed={completed}
            onNavigate={navigate}
          />

          <main
            id="briefing-main"
            key={active}
            tabIndex={-1}
            className={`briefing-main briefing-stage ${active === 1 ? 'briefing-project-stage' : ''}`}
          >
            <h1 ref={heading} tabIndex={-1}>{steps[active].title}</h1>
            <p className="step-subtitle">{steps[active].subtitle}</p>

            {errors.contact && (
              <div id="contact-error" className="briefing-error-summary" role="alert">
                {errors.contact}
              </div>
            )}

            <form noValidate onSubmit={handleFormSubmit}>
              <div className="briefing-fields">{renderActiveStep()}</div>

              <BriefingNavigation
                active={active}
                isSubmitting={isSubmitting}
                submissionError={submissionError}
                onBack={handleBack}
                onSubmit={sendSubmission}
              />
            </form>

            {submissionError && (
              <p className="briefing-error-summary" id="submission-error" role="alert">
                {submissionError}
              </p>
            )}

            <p className="preview-notice" id="submission-notice">{notice}</p>
          </main>
        </>
      )}
    </>
  )
}
