import type { ChangeEvent, FocusEvent } from 'react'

import { formatPhone, validateStep } from '../../../content'
import type { Answers } from '../../../content'
import type {
  AnswerUpdater,
  BriefingErrors,
  ErrorMessageRenderer,
  ErrorPropsGetter,
} from '../types'

type ContactStepProps = {
  answers: Answers
  update: AnswerUpdater
  setErrors: React.Dispatch<React.SetStateAction<BriefingErrors>>
  errorProps: ErrorPropsGetter
  errorMessage: ErrorMessageRenderer
}

export function ContactStep({
  answers,
  update,
  setErrors,
  errorProps,
  errorMessage,
}: ContactStepProps) {
  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    update('name', event.target.value)
  }

  // Atualiza o telefone preservando a posição lógica do cursor após aplicar a máscara.
  function handlePhoneChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const valueBeforeCursor = input.value.slice(0, input.selectionStart ?? input.value.length)
    const digitsBeforeCursor = valueBeforeCursor.replace(/\D/g, '').length
    const formattedPhone = formatPhone(input.value)

    update('phone', formattedPhone)

    requestAnimationFrame(() => {
      let digitCount = 0
      let caretPosition = 0

      while (caretPosition < formattedPhone.length && digitCount < digitsBeforeCursor) {
        if (/\d/.test(formattedPhone[caretPosition])) digitCount++
        caretPosition++
      }

      input.setSelectionRange(caretPosition, caretPosition)
    })
  }

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    update('email', event.target.value)
  }

  // A navegação por botão valida no avanço; o blur cuida apenas da saída comum do campo.
  function shouldSkipBlurValidation(event: FocusEvent<HTMLInputElement>) {
    return event.relatedTarget instanceof HTMLElement && Boolean(event.relatedTarget.closest('button'))
  }

  function validateContactField(field: 'phone' | 'email') {
    if (!answers[field].trim()) return

    setErrors(previous => {
      const nextErrors = { ...previous }
      const message = validateStep(0, answers)[field]

      delete nextErrors[field]
      if (message) nextErrors[field] = message

      return nextErrors
    })
  }

  function handlePhoneBlur(event: FocusEvent<HTMLInputElement>) {
    if (!shouldSkipBlurValidation(event)) validateContactField('phone')
  }

  function handleEmailBlur(event: FocusEvent<HTMLInputElement>) {
    if (!shouldSkipBlurValidation(event)) validateContactField('email')
  }

  return (
    <>
      <div className="field">
        <label htmlFor="name">Qual é o seu nome?</label>
        <input
          className="field-control"
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Digite seu nome"
          maxLength={120}
          required
          value={answers.name}
          onChange={handleNameChange}
          {...errorProps('name')}
        />
        {errorMessage('name')}
      </div>

      <div className="field">
        <label htmlFor="phone">WhatsApp / Telefone</label>
        <input
          className="field-control"
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="(86) 99999-9999"
          value={answers.phone}
          onChange={handlePhoneChange}
          onBlur={handlePhoneBlur}
          {...errorProps('phone')}
        />
        {errorMessage('phone')}
      </div>

      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input
          className="field-control"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={answers.email}
          onChange={handleEmailChange}
          onBlur={handleEmailBlur}
          {...errorProps('email')}
        />
        {errorMessage('email')}
      </div>

      <p className="field-hint">
        Basta um contato válido. Se preencher os dois, confira ambos.
      </p>
    </>
  )
}
