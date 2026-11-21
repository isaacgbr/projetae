export type ProjectType = 'landing' | 'institutional' | 'catalog' | 'portfolio'

export interface ProjectDefinition {
  type: ProjectType
  name: string
  description: string
  domain: string
  stories: readonly string[]
}

export const projects: readonly ProjectDefinition[] = [
  {
    type: 'landing',
    name: 'Landing Page',
    description: 'Uma página focada em apresentar e gerar contato.',
    domain: 'espacovivo.exemplo',
    stories: [
      'Espaço Vivo apresenta uma consultoria de interiores.',
      'A página revela os benefícios para cada ambiente.',
      'O convite final é conversar sobre seu espaço.',
    ],
  },
  {
    type: 'institutional',
    name: 'Site Institucional',
    description: 'Seu negócio apresentado de forma profissional.',
    domain: 'vertice.exemplo',
    stories: [
      'Vértice apresenta seu trabalho em arquitetura.',
      'A página Sobre mostra a abordagem do estúdio.',
      'Serviços reúne arquitetura, interiores e consultoria.',
      'A navegação retorna à apresentação da empresa.',
    ],
  },
  {
    type: 'catalog',
    name: 'Catálogo Digital',
    description: 'Seus produtos ou serviços organizados em uma vitrine.',
    domain: 'objetos.exemplo',
    stories: [
      'Objetos apresenta três peças para a casa.',
      'A categoria Cerâmica destaca o Vaso Aurora.',
      'O detalhe apresenta material, acabamento e dimensões do vaso.',
    ],
  },
  {
    type: 'portfolio',
    name: 'Portfólio Profissional',
    description: 'Seus trabalhos apresentados em um espaço profissional.',
    domain: 'lia.exemplo',
    stories: [
      'Lia Mota se apresenta como designer e diretora de arte.',
      'A seleção reúne identidade visual e pesquisa tipográfica.',
      'O contato convida a conversar sobre um novo projeto.',
    ],
  },
]
