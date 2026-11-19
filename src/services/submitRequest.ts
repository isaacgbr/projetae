import type { Answers } from '../content'

const endpoint = import.meta.env.VITE_SUBMIT_REQUEST_URL

export async function submitRequest(answers: Answers) {
  if (!endpoint) {
    throw new Error('O envio ainda não está configurado neste ambiente.')
  }

  let response: Response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers),
    })
  } catch {
    throw new Error('Não foi possível conectar ao serviço de envio. Verifique sua conexão e tente novamente.')
  }

  let result: unknown
  try {
    result = await response.json()
  } catch {
    throw new Error('O serviço de envio retornou uma resposta inesperada. Tente novamente.')
  }

  if (response.ok && isSuccess(result)) return

  if (response.status === 422) {
    throw new Error('Algumas informações não foram aceitas. Revise o Briefing e tente novamente.')
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
