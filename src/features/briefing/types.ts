import type { ReactNode } from 'react'

import type { Answers } from '../../content'

// Contratos compartilhados mantêm as etapas desacopladas do estado do orquestrador.
export type BriefingErrors = Record<string, string>

export type AnswerUpdater = <Key extends keyof Answers>(
  key: Key,
  value: Answers[Key],
) => void

export type ErrorAttributes = {
  'aria-invalid'?: true
  'aria-describedby'?: string
}

export type ErrorPropsGetter = (key: string) => ErrorAttributes
export type ErrorMessageRenderer = (key: string) => ReactNode
