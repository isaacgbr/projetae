// Amostra de portfólio: contrato baseado em Answers (src/content.ts).
// Sem imports do frontend: o bundle da Edge Function deve ser independente.
const projects = [
  'Landing Page', 'Site Institucional', 'Catálogo Digital',
  'Portfólio Profissional', 'Ainda não sei qual escolher',
]
const objectives = [
  'Conseguir novos clientes', 'Apresentar meu negócio',
  'Divulgar produtos ou serviços', 'Receber pedidos ou orçamentos',
  'Fortalecer minha presença profissional', 'Outro',
]
const directions = [
  '', 'Minimalista', 'Elegante', 'Criativo', 'Escuro / Impactante',
  'Não tenho preferência', 'Personalizado',
]
const textLimits = {
  phone: 32, email: 254, project: 100, projectDescription: 4000,
  otherObjective: 2000, link: 2048, notes: 8000, visualDirection: 80,
}
const maxBodyBytes = 32 * 1024

type Config = {
  supabaseUrl?: string
  serviceRoleKey?: string
  allowedOrigins?: string
}
type Answers = Record<keyof typeof textLimits, string> & {
  objectives: string[]
  customColors: string[]
}

function validDomain(domain: string) {
  return domain.length <= 253 && /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,63}|xn--[a-z0-9-]{2,59})$/i.test(domain)
}

function validate(payload: unknown): { answers?: Answers; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { errors: { body: 'Envie um objeto JSON com os campos do Briefing.' } }
  }
  const input = payload as Record<string, unknown>
  const keys = [...Object.keys(textLimits), 'objectives', 'customColors']
  if (Object.keys(input).some(key => !keys.includes(key))) {
    errors.body = 'O envio contém campos não permitidos.'
  }
  const answers = {} as Answers
  for (const field of Object.keys(textLimits) as (keyof typeof textLimits)[]) {
    const value = input[field] ?? ''
    // null não faz parte do contrato, mesmo nos campos opcionais.
    if (input[field] === null || typeof value !== 'string' || value.includes('\u0000') || value.length > textLimits[field]) {
      errors[field] = `Informe um texto de até ${textLimits[field]} caracteres.`
      answers[field] = ''
    } else answers[field] = value.trim()
  }
  for (const [field, limit] of [['objectives', 6], ['customColors', 4]] as const) {
    const value = input[field] === undefined ? [] : input[field]
    if (!Array.isArray(value) || value.length > limit || value.some(item => typeof item !== 'string' || item.includes('\u0000'))) {
      errors[field] = `Informe uma lista de textos com até ${limit} itens.`
      answers[field] = []
    } else answers[field] = value
  }
  if (Object.keys(errors).length) return { errors }

  if (!answers.phone && !answers.email) errors.contact = 'Informe telefone ou e-mail.'
  const rawDigits = answers.phone.replace(/\D/g, '')
  const digits = answers.phone.startsWith('+55') ? rawDigits.slice(2) : rawDigits
  if (answers.phone && (!/^\+?[\d\s().-]+$/.test(answers.phone) || (answers.phone.startsWith('+') && !answers.phone.startsWith('+55')) || !/^[1-9]{2}(?:9\d{8}|[2-5]\d{7})$/.test(digits))) {
    errors.phone = 'Informe um telefone brasileiro válido com DDD.'
  }
  const [local, domain, extra] = answers.email.split('@')
  if (answers.email && (extra !== undefined || !local || local.length > 64 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local) || local.startsWith('.') || local.endsWith('.') || local.includes('..') || !validDomain(domain || ''))) {
    errors.email = 'Informe um e-mail válido.'
  }
  if (!projects.includes(answers.project)) errors.project = 'Escolha um tipo de projeto disponível.'
  if (answers.project === projects[4] && !answers.projectDescription) errors.projectDescription = 'Descreva sua ideia.'
  if (!answers.objectives.length || answers.objectives.some(value => !objectives.includes(value))) errors.objectives = 'Escolha pelo menos um objetivo disponível.'
  if (answers.objectives.includes('Outro') && !answers.otherObjective) errors.otherObjective = 'Descreva o outro objetivo.'
  if (answers.link) {
    try {
      const url = new URL(answers.link)
      if (!/^https?:\/\//i.test(answers.link) || /\s/.test(answers.link) || !validDomain(url.hostname) || url.username || url.password) throw new Error('Invalid link')
    } catch { errors.link = 'Informe um link HTTP ou HTTPS válido, sem credenciais.' }
  }
  if (!directions.includes(answers.visualDirection)) errors.visualDirection = 'Escolha uma direção visual disponível.'
  // Validar cores mesmo quando outra direção está selecionada.
  if (answers.customColors.some(color => !/^#[\da-f]{6}$/i.test(color))) errors.customColors = 'Informe até quatro cores hexadecimais válidas.'
  return Object.keys(errors).length ? { errors } : { answers, errors }
}

class BodyTooLarge extends Error {}

async function readBody(request: Request): Promise<unknown> {
  const reader = request.body?.getReader()
  if (!reader) throw new SyntaxError('Missing body')
  const decoder = new TextDecoder('utf-8', { fatal: true })
  let size = 0
  let text = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maxBodyBytes) {
        await reader.cancel()
        throw new BodyTooLarge()
      }
      text += decoder.decode(value, { stream: true })
    }
    return JSON.parse(text + decoder.decode())
  } finally { reader.releaseLock() }
}

export function createHandler(config: Config, send: typeof fetch = fetch) {
  return async (request: Request): Promise<Response> => {
    const origin = request.headers.get('origin')
    const origins = config.allowedOrigins?.split(',').map(value => value.trim()).filter(Boolean) ?? []
    const originAllowed = !!origin && origins.includes(origin)
    const headers = new Headers({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Vary': 'Origin',
    })
    if (originAllowed) {
      headers.set('Access-Control-Allow-Origin', origin)
      headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
      headers.set('Access-Control-Allow-Headers', 'content-type, apikey, authorization, x-client-info')
    }
    const json = (status: number, body: object) => new Response(JSON.stringify(body), { status, headers })

    // Falha fechada quando as origens não foram configuradas; nunca usar '*'.
    if (!origins.length || origins.some(value => {
      try { return new URL(value).origin !== value || !/^https?:\/\//.test(value) } catch { return true }
    })) return json(503, { error: 'Serviço temporariamente indisponível.' })
    if (origin && !originAllowed) return json(403, { error: 'Origem não permitida.' })
    // Sem Origin é permitido para clientes HTTP; CORS não autentica remetentes.
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
    if (request.method !== 'POST') {
      headers.set('Allow', 'POST, OPTIONS')
      return json(405, { error: 'Método não permitido.' })
    }
    if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
      return json(415, { error: 'Use Content-Type application/json.' })
    }
    const length = request.headers.get('content-length')
    if (length !== null && (!/^\d+$/.test(length) || Number(length) > maxBodyBytes)) {
      return json(413, { error: 'O envio excede o limite de 32 KiB.' })
    }
    let payload: unknown
    try { payload = await readBody(request) } catch (error) {
      return error instanceof BodyTooLarge
        ? json(413, { error: 'O envio excede o limite de 32 KiB.' })
        : json(400, { error: 'JSON inválido.' })
    }
    const { answers, errors } = validate(payload)
    if (!answers) return json(422, { error: 'Confira os campos do Briefing.', fields: errors })

    let endpoint: URL
    try {
      const base = new URL(config.supabaseUrl || '')
      if (!['https:', 'http:'].includes(base.protocol) || base.username || base.password || !config.serviceRoleKey) throw new Error('Missing configuration')
      endpoint = new URL('/rest/v1/requests', base)
    } catch { return json(503, { error: 'Serviço temporariamente indisponível.' }) }

    // Lista explícita: id, created_at e status ficam a cargo dos defaults do banco.
    const row = {
      phone: answers.phone, email: answers.email, project: answers.project,
      project_description: answers.projectDescription, objectives: answers.objectives,
      other_objective: answers.otherObjective, link: answers.link, notes: answers.notes,
      visual_direction: answers.visualDirection, custom_colors: answers.customColors,
    }
    try {
      const response = await send(endpoint, {
        method: 'POST',
        headers: {
          apikey: config.serviceRoleKey!,
          Authorization: `Bearer ${config.serviceRoleKey}`,
          'Content-Type': 'application/json',
          'Content-Profile': 'public',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(row),
        signal: AbortSignal.timeout(10_000),
        redirect: 'error',
      })
      // Não repassar erros SQL, respostas do banco, contatos ou credenciais.
      await response.body?.cancel()
      if (!response.ok) return json(502, { error: 'Não foi possível confirmar o salvamento da solicitação.' })
      return json(201, { ok: true })
    } catch {
      return json(502, { error: 'Não foi possível confirmar o salvamento da solicitação.' })
    }
  }
}
