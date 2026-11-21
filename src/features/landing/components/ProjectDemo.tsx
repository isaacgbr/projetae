import { useRef } from 'react'
import type { ProjectDefinition, ProjectType } from '../projects.data'
import { useProjectDemoCycle } from '../hooks/useProjectDemoCycle'

export function ProjectDemo({ project, active = true, visit = 0 }: {
  project: ProjectDefinition
  active?: boolean
  visit?: number
}) {
  const stage = useRef<HTMLDivElement>(null)
  const { phase, status } = useProjectDemoCycle({ active, visit, stage })

  return (
    <div
      ref={stage}
      className="demo-experience"
      data-demo-state={status}
      role="img"
      aria-label={'Prévia ilustrativa de ' + project.name}
      aria-describedby={'demo-description-' + project.type}
    >
      <div className="service-stage">
        <div className="demo-rig">
          <span className="demo-bottom-edge" aria-hidden="true" />
          <div className={'demo-browser demo-' + project.type} data-phase={phase} aria-hidden="true">
            <div className="demo-browser-bar">
              <span className="demo-dots">
                <i />
                <i />
                <i />
              </span>
              <span>{project.domain}</span>
              <span>◇</span>
            </div>
            <ProjectDemoVisual type={project.type} phase={phase} />
          </div>
        </div>
      </div>
      <p id={'demo-description-' + project.type} className="demo-description">
        {project.name}. Negócio fictício. {project.stories.join(' ')}
      </p>
    </div>
  )
}

function ProjectDemoVisual({ type, phase }: { type: ProjectType; phase: number }) {
  const page = phase === 0 ? 0 : phase === 1 ? 1 : 2

  if (type === 'landing') {
    return (
      <div className="demo-viewport landing-viewport">
        <div className="demo-scroll">
          <div className="demo-landing-home">
            <div className="demo-nav">
              <b>
                espaço vivo<span> / interiores</span>
              </b>
              <span>Seu espaço, seu jeito.</span>
            </div>
            <div className="demo-landing-cover">
              <div className="demo-landing-copy">
                <strong>
                  Um novo<br />
                  <em>jeito de morar.</em>
                </strong>
                <p>Consultoria de interiores para transformar o que já é seu.</p>
                <span className="demo-benefit">Layout, cores e escolhas.</span>
                <span className="demo-cta">
                  Pedir uma proposta <span>↗</span>
                </span>
              </div>
              <div className="demo-arch">
                <i />
                <b />
                <span />
              </div>
            </div>
          </div>
          <div className="demo-collection">
            <div>
              <span className="demo-kicker">A CONSULTORIA</span>
              <strong>
                Mais vida em<br />
                cada ambiente.
              </strong>
              <p>Um plano para aproveitar seu espaço, escolher materiais e renovar com intenção.</p>
              <span className="demo-benefit">Seu ambiente · Suas escolhas · Seu ritmo</span>
            </div>
            <div className="collection-art">
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="demo-landing-contact">
            <span className="demo-kicker">VAMOS COMEÇAR?</span>
            <strong>
              Seu espaço tem<br />
              novas possibilidades.
            </strong>
            <p>
              Conte o que você imagina.<br />
              Vamos pensar no próximo passo.
            </p>
            <span className="demo-cta">
              Conversar sobre meu espaço <span>↗</span>
            </span>
            <small>espaço vivo / interiores</small>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'institutional') {
    return (
      <div className="demo-viewport institutional-viewport">
        <div className="demo-nav">
          <b>
            vértice<span> / estúdio</span>
          </b>
          <div className="demo-tabs">
            {['Início', 'Sobre', 'Serviços'].map((name, index) => (
              <span key={name} className={page === index ? 'active' : ''}>{name}</span>
            ))}
          </div>
        </div>
        <div className="institutional-scenes">
          <div className={'institutional-scene institutional-scene-0' + (page === 0 ? ' active' : '')}>
            <div>
              <strong>
                Espaços para<br />
                novas histórias.
              </strong>
              <p>
                Arquitetura e interiores.<br />
                Do conceito ao espaço.
              </p>
            </div>
            <div className="demo-building">
              <i />
              <b />
            </div>
          </div>
          <div className={'institutional-scene institutional-scene-1' + (page === 1 ? ' active' : '')}>
            <div>
              <span className="demo-kicker">SOBRE O ESTÚDIO</span>
              <strong>
                A escuta vem<br />
                antes do traço.
              </strong>
              <p>
                Matéria e luz.<br />
                Em cada escolha.
              </p>
            </div>
            <div className="studio-materials">
              <i />
              <b />
              <span />
            </div>
          </div>
          <div className={'institutional-scene institutional-scene-2' + (page === 2 ? ' active' : '')}>
            <div>
              <span className="demo-kicker">NOSSA ATUAÇÃO</span>
              <strong>
                Do traço<br />
                ao espaço.
              </strong>
              <p>
                Vamos conversar<br />
                sobre seu projeto? ↗
              </p>
            </div>
            <div className="institutional-services">
              <span><i />Arquitetura</span>
              <span><i />Interiores</span>
              <span><i />Consultoria</span>
            </div>
          </div>
        </div>
        <div className="institutional-foot">
          <span>ARQUITETURA · INTERIORES</span>
          <span>Contato ↗</span>
        </div>
      </div>
    )
  }

  if (type === 'catalog') {
    return (
      <div className="demo-viewport catalog-viewport">
        <div className="demo-nav">
          <b>
            objetos<span> / casa</span>
          </b>
          <span>Coleção essencial</span>
        </div>
        <div className="demo-catalog-heading">
          <strong>Feito para ficar.</strong>
          <span>03 peças</span>
        </div>
        <div className="demo-categories">
          <span className={phase === 0 ? 'active' : ''}>Todos</span>
          <span className={phase > 0 ? 'active' : ''}>Cerâmica</span>
          <span>Iluminação</span>
        </div>
        <div className="demo-products">
          {[
            ['vase', 'Vaso Aurora', 'Cerâmica'],
            ['lamp', 'Luminária Arco', 'Metal'],
            ['bowl', 'Bowl Terra', 'Madeira'],
          ].map(([art, title, copy], index) => (
            <div className={'demo-product product-' + index} key={art}>
              <div className="demo-product-art">
                <i className={'object-' + art} />
              </div>
              <b>{title}</b>
              <span>{copy}</span>
              <small>{index === 0 && phase > 0 ? 'Ver Vaso Aurora ↗' : 'Ver peça'}</small>
            </div>
          ))}
        </div>
        <div className="demo-product-detail">
          <div className="demo-detail-art">
            <i className="object-vase" />
          </div>
          <div>
            <span className="demo-kicker">A PEÇA EM DETALHE</span>
            <strong>Vaso Aurora</strong>
            <p>
              Cerâmica natural<br />
              Acabamento fosco<br />
              Altura: 24 cm
            </p>
            <span className="demo-detail-link">Coleção essencial / 01</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="demo-viewport portfolio-viewport">
      <div className="demo-nav">
        <b>
          LIA MOTA<span>®</span>
        </b>
        <span>Design & direção de arte</span>
      </div>
      <div className="portfolio-scenes">
        <div className={'portfolio-scene portfolio-presentation' + (page === 0 ? ' active' : '')}>
          <span className="demo-kicker">DESIGNER INDEPENDENTE</span>
          <strong>
            Identidades que<br />
            contam histórias.
          </strong>
          <p>
            Sou Lia. Transformo ideias em marcas,<br />
            imagens e novas formas de comunicar.
          </p>
          <span className="portfolio-presentation-mark">lm.</span>
          <small>Conheça meu trabalho ↓</small>
        </div>
        <div className={'portfolio-scene portfolio-work' + (page === 1 ? ' active' : '')}>
          <div className="demo-portfolio-intro">
            <span>Trabalhos selecionados</span>
            <span>2026</span>
          </div>
          <div className="portfolio-work-grid">
            <div className="portfolio-poster">
              <div className="portfolio-art">
                <strong>entre formas.</strong>
                <i />
                <span className="poster-seal">ef.</span>
              </div>
              <div className="portfolio-caption">
                <b>Entre Formas</b>
                <span>Identidade</span>
              </div>
            </div>
            <div className="portfolio-type">
              <div className="portfolio-art">
                <strong>Aa</strong>
                <i />
              </div>
              <div className="portfolio-caption">
                <b>Estudo de letras</b>
                <span>Tipografia</span>
              </div>
            </div>
          </div>
        </div>
        <div className={'portfolio-scene portfolio-contact' + (page === 2 ? ' active' : '')}>
          <span className="demo-kicker">TEM UMA IDEIA?</span>
          <strong>
            Vamos dar<br />
            forma a ela.
          </strong>
          <p>Identidade visual · Direção de arte</p>
          <span className="portfolio-contact-action">Converse comigo ↗</span>
          <small>Lia Mota / Disponível para novos projetos</small>
        </div>
      </div>
      <div className="portfolio-index">
        <span>Designer independente · Contato ↗</span>
        <span>0{page + 1} / 03</span>
      </div>
    </div>
  )
}
