import type { Answers } from '../content'

const endpoint = import.meta.env.VITE_SUBMIT_REQUEST_URL

type SubmissionProtection = { turnstileToken: string; website: string }

export async function submitRequest(answers: Answers, protection: SubmissionProtection, signal?: AbortSignal) {
  if (!endpoint) {
    throw new Error('O envio ainda não está configurado neste ambiente.')
  }

  const requestSignal = signal
    ? AbortSignal.any([signal, AbortSignal.timeout(30_000)])
    : AbortSignal.timeout(30_000)
  requestSignal.throwIfAborted()

  let response: Response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...answers, ...protection }),
      signal: requestSignal,
    })
    requestSignal.throwIfAborted()
  } catch {
    if (requestSignal.aborted) throw new Error('O envio foi interrompido ou excedeu o tempo de espera. Suas respostas foram preservadas. Tente novamente.')
    throw new Error('Não foi possível conectar ao serviço de envio. Verifique sua conexão e tente novamente.')
  }

  let result: unknown
  try {
    result = await response.json()
    requestSignal.throwIfAborted()
  } catch {
    if (requestSignal.aborted) throw new Error('O envio foi interrompido ou excedeu o tempo de espera. Suas respostas foram preservadas. Tente novamente.')
    throw new Error('O serviço de envio retornou uma resposta inesperada. Tente novamente.')
  }

  if (response.ok && isSuccess(result)) return

  if (response.status === 422) {
    throw new Error('Algumas informações não foram aceitas. Revise o Briefing e tente novamente.')
  }
  if (response.status === 403 && hasCode(result, 'verification_failed')) {
    throw new Error('Não foi possível validar a verificação de segurança. Tente novamente.')
  }
  if (response.status === 403) {
    throw new Error('O envio não está autorizado neste endereço. Entre em contato com o responsável pelo Projetaê.')
  }
  if (response.status === 413) {
    throw new Error('A solicitação ultrapassa o limite permitido. Reduza os textos e tente novamente.')
  }
  if (response.status >= 500) {
    throw new Error('O serviço de envio está temporariamente indisponível. Tente novamente em instantes.')
  }
  throw new Error('Não foi possível enviar sua solicitação. Confira as informações e tente novamente.')
}

function isSuccess(result: unknown): result is { ok: true } {
  return !!result && typeof result === 'object' && 'ok' in result && result.ok === true
}

function hasCode(result: unknown, code: string) {
  return !!result && typeof result === 'object' && 'code' in result && result.code === code
}
