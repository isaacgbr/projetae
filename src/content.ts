export const steps = [
  { label: 'Contato', title: 'Como podemos entrar em contato com você?', subtitle: 'Informe seu nome e pelo menos uma forma de contato.' },
  { label: 'Seu projeto', title: 'O que você gostaria de criar?', subtitle: 'Escolha o formato que combina com a sua ideia. Tudo bem se ainda não souber.' },
  { label: 'Seu objetivo', title: 'O que você quer alcançar com esse projeto?', subtitle: 'Você pode escolher mais de um objetivo.' },
  { label: 'Materiais e referências', title: 'Materiais e referências', subtitle: 'Se você já possui algo que possa ajudar a entender o projeto, pode adicionar aqui.' },
  { label: 'Revisão e envio', title: 'Tudo certo por aqui?', subtitle: 'Confira sua solicitação antes de enviar.' },
]
export const projectTypes = [
  { name: 'Landing Page', about: 'Uma página focada em apresentar uma oferta, serviço ou campanha e incentivar uma ação.' },
  { name: 'Site Institucional', about: 'Um site para apresentar uma empresa, negócio, serviços, informações e formas de contato.' },
  { name: 'Catálogo Digital', about: 'Um espaço para organizar e apresentar produtos ou serviços para consulta.' },
  { name: 'Portfólio Profissional', about: 'Um site para apresentar um profissional, seus trabalhos, experiência e formas de contato.' },
  { name: 'Ainda não sei qual escolher', about: '' },
]
export const objectives = ['Conseguir novos clientes', 'Apresentar meu negócio', 'Divulgar produtos ou serviços', 'Receber pedidos ou orçamentos', 'Fortalecer minha presença profissional', 'Outro']
export const visualDirections = ['Minimalista', 'Elegante', 'Criativo', 'Escuro / Impactante', 'Não tenho preferência']
export const projectUses = ['campanhas, serviços, lançamentos e captação de contatos.', 'apresentar seu negócio e reunir suas informações.', 'organizar uma coleção e facilitar a consulta.', 'valorizar trabalhos, experiência e trajetória profissional.']
export type Answers = { name: string; phone: string; email: string; project: string; projectDescription: string; objectives: string[]; otherObjective: string; link: string; notes: string; visualDirection: string; customColors: string[] }
export const initialAnswers: Answers = { name: '', phone: '', email: '', project: '', projectDescription: '', objectives: [], otherObjective: '', link: '', notes: '', visualDirection: '', customColors: [] }

export function formatPhone(value: string) {
  let digits = value.replace(/\D/g, '')
  if (value.startsWith('+') && !digits.startsWith('55')) return `+${digits.slice(0, 15)}`
  if (value.startsWith('+55') && (digits.length === 12 || digits.length === 13)) digits = digits.slice(2)
  if (!digits) return ''
  if (digits.length <= 2) return `(${digits}`
  const local = digits.slice(2)
  const split = local.length > 8 ? 5 : 4
  return `(${digits.slice(0, 2)}) ${local.slice(0, split)}${local.length > split ? `-${local.slice(split)}` : ''}`
}
export function validateStep(step: number, answers: Answers): Record<string, string> {
  const errors: Record<string, string> = {}
  if (step === 0) {
    const name = answers.name.trim(), phone = answers.phone.trim(), email = answers.email.trim()
    if (!name) errors.name = 'Digite seu nome para continuar.'
    if (!phone && !email) errors.contact = 'Informe um WhatsApp / telefone ou um e-mail válido para continuar.'
    const rawDigits = phone.replace(/\D/g, '')
    const digits = phone.startsWith('+55') ? rawDigits.slice(2) : rawDigits
    if (phone && (!/^\+?[\d\s().-]+$/.test(phone) || (phone.startsWith('+') && !phone.startsWith('+55')) || !/^[1-9]{2}(?:9\d{8}|[2-5]\d{7})$/.test(digits))) errors.phone = 'Complete o número de telefone com DDD.'
    const [local, domain, extra] = email.split('@')
    if (email && (email.length > 254 || extra !== undefined || !local || local.length > 64 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local) || local.startsWith('.') || local.endsWith('.') || local.includes('..') || !validDomain(domain || ''))) errors.email = 'Digite um e-mail válido.'
  }
  if (step === 1) {
    if (!projectTypes.some(type => type.name === answers.project)) errors.project = 'Escolha um tipo de projeto para continuar.'
    if (answers.project === 'Ainda não sei qual escolher' && !answers.projectDescription.trim()) errors.projectDescription = 'Explique brevemente sua ideia para continuar.'
  }
  if (step === 2) {
    if (!answers.objectives.length || answers.objectives.some(value => !objectives.includes(value))) errors.objectives = 'Escolha pelo menos um objetivo para continuar.'
    if (answers.objectives.includes('Outro') && !answers.otherObjective.trim()) errors.otherObjective = 'Descreva o outro objetivo.'
  }
  if (step === 3 && answers.link.trim()) {
    try {
      const url = new URL(answers.link.trim())
      if (!/^https?:\/\//i.test(answers.link.trim()) || /\s/.test(answers.link.trim()) || !validDomain(url.hostname) || url.username || url.password) throw new Error('Invalid reference')
    } catch { errors.link = 'Digite um link válido, como https://exemplo.com.' }
  }
  if (step === 3) {
    if (answers.visualDirection && ![...visualDirections, 'Personalizado'].includes(answers.visualDirection)) errors.visualDirection = 'Escolha uma preferência visual disponível.'
    if (answers.visualDirection === 'Personalizado' && (answers.customColors.length > 4 || answers.customColors.some(color => !/^#[\da-f]{6}$/i.test(color)))) errors.customColors = 'Escolha até 4 cores válidas.'
  }
  return errors
}

function validDomain(domain: string) {
  return domain.length <= 253 && /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,63}|xn--[a-z0-9-]{2,59})$/i.test(domain)
}
