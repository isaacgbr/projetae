export type FieldDefinition = {
  id: string
  label: string
  placeholder?: string
  type?: 'text' | 'email' | 'url' | 'textarea' | 'select'
  options?: string[]
  hint?: string
}

type Step = {
  label: string
  title: string
  subtitle: string
  summary?: string
  fields?: FieldDefinition[]
}

export const steps: Step[] = [
  {
    label: 'Boas-vindas',
    title: 'Vamos criar seu projeto?',
    subtitle: 'Toda boa ideia começa com uma conversa.',
  },
  {
    label: 'Seu negócio',
    title: 'Primeiro, seu negócio.',
    subtitle: 'Queremos entender um pouco mais sobre você e o seu momento atual.',
    summary: 'Sobre você, sua marca e o que você faz.',
    fields: [
      { id: 'name', label: 'Seu nome', placeholder: 'Digite seu nome completo' },
      { id: 'email', label: 'E-mail de contato', type: 'email', placeholder: 'seu@email.com' },
      { id: 'business', label: 'Nome do negócio', placeholder: 'Como sua marca é chamada?' },
      { id: 'about', label: 'O que seu negócio faz?', type: 'textarea', placeholder: 'Conte brevemente sobre o que você faz, seus principais produtos ou serviços.' },
    ],
  },
  {
    label: 'Seu projeto',
    title: 'Dê espaço à sua ideia.',
    subtitle: 'Vamos entender o que você quer construir e aonde quer chegar.',
    summary: 'Formato, objetivos e público do projeto.',
    fields: [
      { id: 'project-type', label: 'Que tipo de projeto você tem em mente?', type: 'select', options: ['Landing page', 'Site institucional', 'Portfólio', 'Outro projeto digital', 'Ainda quero descobrir'] },
      { id: 'objective', label: 'Qual é o principal objetivo?', type: 'textarea', placeholder: 'Por exemplo: apresentar meus serviços ou receber mais contatos.' },
      { id: 'audience', label: 'Para quem é esse projeto?', placeholder: 'Conte um pouco sobre o público que você quer alcançar' },
    ],
  },
  {
    label: 'Estilo e materiais',
    title: 'Um projeto com a sua cara.',
    subtitle: 'Referências e detalhes que nos ajudam a conhecer seu universo.',
    summary: 'Direção visual, referências e materiais.',
    fields: [
      { id: 'style', label: 'Como você imagina o visual?', type: 'textarea', placeholder: 'Minimalista, acolhedor, marcante… descreva o que combina com a sua marca.' },
      { id: 'references', label: 'Tem alguma referência?', type: 'url', placeholder: 'https://um-site-que-voce-gosta.com', hint: 'Um site que inspire você, seja pelo estilo ou pela experiência.' },
      { id: 'materials', label: 'Quais materiais você já tem?', type: 'textarea', placeholder: 'Por exemplo: logo, paleta de cores, fotografias ou textos.', hint: 'Nesta prévia, basta descrever. Não há upload de arquivos.' },
    ],
  },
  {
    label: 'Revisão e envio',
    title: 'O próximo passo começa aqui.',
    subtitle: 'Um último olhar para a estrutura do seu briefing.',
  },
]
