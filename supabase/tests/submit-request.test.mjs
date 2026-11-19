import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { createHandler } from '../functions/submit-request/handler.ts'

const origin = 'https://briefing.example.com'
const config = {
  supabaseUrl: 'https://project.example.com',
  serviceRoleKey: 'test-only-placeholder',
  allowedOrigins: origin,
  turnstileSecretKey: 'test-only-turnstile-secret',
}
const answers = {
  phone: '', email: 'cliente@example.com', project: 'Landing Page',
  projectDescription: '', objectives: ['Conseguir novos clientes'],
  otherObjective: '', link: '', notes: '', visualDirection: '', customColors: [],
}
const protection = { turnstileToken: 'test-only-turnstile-token', website: '' }
const valid = { ...answers, ...protection }
function request(body = valid, init = {}) {
  return new Request('https://function.example.com/submit-request', {
    method: 'POST', headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify(body), ...init,
  })
}
function validVerification() {
  return new Response(JSON.stringify({
    success: true,
    hostname: 'briefing.example.com',
    action: 'submit_request',
  }), { status: 200, headers: { 'content-type': 'application/json' } })
}

function setup(
  settings = config,
  databaseResponse = () => new Response(null, { status: 201 }),
  verificationResponse = validVerification,
) {
  const calls = []
  const handler = createHandler(settings, async (url, init) => {
    const target = url instanceof URL ? url : new URL(url)
    calls.push({ url: target, init })
    if (target.hostname === 'challenges.cloudflare.com') return verificationResponse()
    return databaseResponse()
  })
  return { handler, calls }
}

test('valida o Turnstile e só então salva os dez campos sem metadados do cliente', async () => {
  const { handler, calls } = setup()
  const payload = {
    ...valid, phone: '(86) 99999-9999', email: ' cliente@example.com ',
    project: 'Ainda não sei qual escolher', projectDescription: 'Minha ideia',
    objectives: ['Outro'], otherObjective: 'Meu objetivo',
    link: 'https://example.com/referencia', notes: 'Observações',
    visualDirection: 'Personalizado', customColors: ['#aAbB00', '#123456'],
  }
  const result = await handler(request(payload))
  assert.equal(result.status, 201)
  assert.deepEqual(await result.json(), { ok: true })
  assert.equal(calls.length, 2)
  const verification = calls[0]
  assert.equal(verification.url.href, 'https://challenges.cloudflare.com/turnstile/v0/siteverify')
  assert.equal(verification.init.method, 'POST')
  assert.equal(verification.init.headers['Content-Type'], 'application/x-www-form-urlencoded')
  assert.equal(verification.init.body.get('secret'), config.turnstileSecretKey)
  assert.equal(verification.init.body.get('response'), payload.turnstileToken)
  assert(verification.init.signal instanceof AbortSignal)

  const database = calls[1]
  assert.equal(database.url.href, 'https://project.example.com/rest/v1/requests')
  assert.equal(database.init.method, 'POST')
  assert.equal(database.init.headers.apikey, config.serviceRoleKey)
  assert.equal(database.init.headers.Prefer, 'return=minimal')
  assert.equal(database.init.headers['Content-Profile'], 'public')
  assert.equal(database.init.redirect, 'error')
  assert(database.init.signal instanceof AbortSignal)
  assert.deepEqual(JSON.parse(database.init.body), {
    phone: payload.phone, email: 'cliente@example.com', project: payload.project,
    project_description: payload.projectDescription, objectives: payload.objectives,
    other_objective: payload.otherObjective, link: payload.link, notes: payload.notes,
    visual_direction: payload.visualDirection, custom_colors: payload.customColors,
  })
  assert.equal(result.headers.get('access-control-allow-origin'), origin)
  assert.equal(result.headers.get('cache-control'), 'no-store')
})

test('aceita contato só por telefone e campos opcionais ausentes', async () => {
  const { handler, calls } = setup()
  const result = await handler(request({
    phone: '+55 (86) 99999-9999', project: answers.project,
    objectives: answers.objectives, ...protection,
  }))
  assert.equal(result.status, 201)
  const row = JSON.parse(calls[1].init.body)
  assert.equal(row.email, '')
  assert.deepEqual(row.custom_colors, [])
})

test('rejeita entradas inválidas antes de verificar ou acessar o banco', async t => {
  const cases = [
    ['sem contato', { ...valid, email: '' }],
    ['telefone inválido mesmo com e-mail válido', { ...valid, phone: '123' }],
    ['telefone estrangeiro', { ...valid, phone: '+1 202 555 0123' }],
    ['e-mail inválido', { ...valid, email: 'a..b@example.com' }],
    ['tipo de projeto desconhecido', { ...valid, project: 'Aplicativo' }],
    ['ideia sem descrição', { ...valid, project: 'Ainda não sei qual escolher' }],
    ['nenhum objetivo', { ...valid, objectives: [] }],
    ['objetivo desconhecido', { ...valid, objectives: ['Inválido'] }],
    ['Outro sem complemento', { ...valid, objectives: ['Outro'] }],
    ['objetivo não textual', { ...valid, objectives: [null] }],
    ['objetivos demais', { ...valid, objectives: Array(7).fill(answers.objectives[0]) }],
    ['link com script', { ...valid, link: 'javascript:alert(1)' }],
    ['link com credenciais', { ...valid, link: 'https://user:password@example.com' }],
    ['link com domínio inválido', { ...valid, link: 'https://localhost/a' }],
    ['direção visual desconhecida', { ...valid, visualDirection: 'Outra' }],
    ['cor inválida mesmo sem direção personalizada', { ...valid, customColors: ['red'] }],
    ['cores demais', { ...valid, customColors: Array(5).fill('#123456') }],
    ['cores aninhadas', { ...valid, customColors: [['#123456']] }],
    ['texto longo', { ...valid, notes: 'a'.repeat(8001) }],
    ['byte nulo', { ...valid, notes: '\u0000' }],
    ['tipo inválido', { ...valid, phone: 123 }],
    ['null opcional', { ...valid, link: null }],
    ['token ausente', { ...answers, website: '' }],
    ['token vazio', { ...valid, turnstileToken: '' }],
    ['token longo', { ...valid, turnstileToken: 'a'.repeat(2049) }],
    ['honeypot null', { ...valid, website: null }],
    ['tentativa de definir status', { ...valid, status: 'aprovada' }],
    ['tentativa de definir ID', { ...valid, id: 'uuid' }],
    ['tentativa de definir data', { ...valid, created_at: '2026-01-01' }],
    ['campos snake_case não aceitos no contrato HTTP', { ...valid, project_description: 'extra' }],
    ['objeto ausente', null], ['array', []], ['string', 'texto'],
  ]
  for (const [name, payload] of cases) await t.test(name, async () => {
    const { handler, calls } = setup()
    const result = await handler(request(payload))
    assert.equal(result.status, 422)
    assert.equal(calls.length, 0)
    assert.equal(typeof (await result.json()).fields, 'object')
  })
})

test('honeypot preenchido bloqueia o envio sem consultar Turnstile ou banco', async () => {
  const { handler, calls } = setup()
  const result = await handler(request({ ...valid, website: 'https://spam.example.com' }))
  assert.equal(result.status, 403)
  assert.equal((await result.json()).code, 'verification_failed')
  assert.equal(calls.length, 0)
})

test('rejeita respostas Turnstile inválidas sem realizar INSERT', async t => {
  const cases = [
    ['desafio recusado', { success: false, hostname: 'briefing.example.com', action: 'submit_request' }],
    ['hostname divergente', { success: true, hostname: 'evil.example.com', action: 'submit_request' }],
    ['action divergente', { success: true, hostname: 'briefing.example.com', action: 'other_action' }],
  ]
  for (const [name, verification] of cases) await t.test(name, async () => {
    const respond = () => new Response(JSON.stringify(verification), { status: 200 })
    const { handler, calls } = setup(config, undefined, respond)
    const result = await handler(request())
    assert.equal(result.status, 403)
    assert.equal((await result.json()).code, 'verification_failed')
    assert.equal(calls.length, 1)
    assert.equal(calls[0].url.hostname, 'challenges.cloudflare.com')
  })
})

test('falha fechada quando o Siteverify está indisponível', async () => {
  for (const respond of [
    () => new Response(null, { status: 503 }),
    () => { throw new Error('network unavailable') },
  ]) {
    const { handler, calls } = setup(config, undefined, respond)
    const result = await handler(request())
    assert.equal(result.status, 502)
    assert.equal(calls.length, 1)
  }
})

test('CORS permite preflight e bloqueia origens não cadastradas', async () => {
  const { handler, calls } = setup()
  const preflight = await handler(request(undefined, { method: 'OPTIONS', body: undefined }))
  assert.equal(preflight.status, 204)
  assert.equal(preflight.headers.get('access-control-allow-origin'), origin)
  const denied = await handler(request(valid, { headers: { origin: 'https://other.example.com', 'content-type': 'application/json' } }))
  assert.equal(denied.status, 403)
  assert.equal(denied.headers.get('access-control-allow-origin'), null)
  assert.equal(calls.length, 0)
})

test('clientes HTTP sem Origin podem enviar: CORS não é autenticação', async () => {
  const { handler } = setup()
  assert.equal((await handler(request(valid, { headers: { 'content-type': 'application/json' } }))).status, 201)
})

test('método, formato, JSON malformado e tamanho são verificados sem chamadas externas', async () => {
  const { handler, calls } = setup()
  assert.equal((await handler(request(undefined, { method: 'GET', body: undefined }))).status, 405)
  assert.equal((await handler(request(valid, { headers: { origin, 'content-type': 'text/plain' } }))).status, 415)
  assert.equal((await handler(request(valid, { body: '{' }))).status, 400)
  assert.equal((await handler(request(valid, { body: '' }))).status, 400)
  assert.equal((await handler(request(valid, { headers: { origin, 'content-type': 'application/json', 'content-length': '32769' } }))).status, 413)
  // Sem Content-Length; o limite é aplicado aos bytes efetivamente lidos.
  assert.equal((await handler(request({ ...valid, notes: 'á'.repeat(17000) }))).status, 413)
  assert.equal(calls.length, 0)
})

test('falha fechada quando falta configuração de servidor', async () => {
  for (const settings of [
    { ...config, allowedOrigins: undefined }, { ...config, allowedOrigins: '*' },
    { ...config, serviceRoleKey: undefined }, { ...config, supabaseUrl: 'invalid' },
    { ...config, turnstileSecretKey: undefined },
  ]) {
    const { handler, calls } = setup(settings)
    assert.equal((await handler(request())).status, 503)
    assert.equal(calls.length, 0)
  }
})

test('erro do banco e erro de rede não retornam sucesso, dados internos ou segredo', async () => {
  for (const respond of [
    () => new Response('private SQL details', { status: 400 }),
    () => { throw new Error(config.serviceRoleKey) },
  ]) {
    const { handler, calls } = setup(config, respond)
    const result = await handler(request())
    assert.equal(result.status, 502)
    assert.equal(calls.length, 2)
    const text = await result.text()
    assert(!text.includes('private SQL'))
    assert(!text.includes(config.serviceRoleKey))
    assert(!text.includes(answers.email))
  }
})

test('contrato continua alinhado com os campos do Briefing', () => {
  const content = readFileSync(new URL('../../src/content.ts', import.meta.url), 'utf8')
  const fields = [...content.match(/export type Answers = \{([^}]+)\}/)[1].matchAll(/(\w+):/g)].map(([, name]) => name)
  assert.deepEqual(Object.keys(answers).sort(), fields.sort())
})
