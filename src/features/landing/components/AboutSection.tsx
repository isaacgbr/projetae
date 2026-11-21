import { BrandFinale } from './BrandFinale'

const gmailComposeUrl = 'https://mail.google.com/mail/?' + new URLSearchParams({
  view: 'cm',
  fs: '1',
  to: 'isaacgbr7@gmail.com',
  su: 'Tenho interesse em um projeto',
  body: 'Olá, Isaac!\r\n\r\nEncontrei seu contato pelo Projetaê e gostaria de conversar sobre uma ideia.\r\n\r\n',
}).toString()

export function AboutSection() {
  return (
    <section className="landing-section about-section landing-scene" id="sobre" aria-labelledby="about-title">
      <div className="landing-container about-content scene-content">
        <div className="about-layout">
          <div className="about-responsible">
            <div className="about-portrait">
              <img src="/images/isaac-projetae.png" alt="Isaac Gabriel, criador do Projetaê" />
            </div>
            <h3>Isaac Gabriel</h3>
            <p>Criador e responsável pelo Projetaê</p>
            <div className="professional-contacts" role="group" aria-label="Contatos profissionais">
              <a href="https://github.com/isaacgbr" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 19c-4 1-4-2-6-2m12 5v-4c0-1-.2-1.6-.7-2.1 3-.3 5.7-1.5 5.7-6.4 0-1.4-.5-2.5-1.3-3.4.1-.4.6-1.8-.1-3.5 0 0-1.1-.4-3.6 1.3a12.6 12.6 0 0 0-6 0C6.5 2.2 5.4 2.6 5.4 2.6c-.7 1.7-.2 3.1-.1 3.5A4.8 4.8 0 0 0 4 9.5c0 4.9 2.7 6.1 5.7 6.4-.5.5-.7 1.1-.7 2.1v4" />
                </svg>
                <span>GitHub</span>
              </a>
              <a href="https://www.linkedin.com/in/isaacgbr" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M7 10v7m0-10v.1M11 17v-7m0 3a3 3 0 0 1 6 0v4" />
                </svg>
                <span>LinkedIn</span>
              </a>
              <a href={gmailComposeUrl} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                <span>Enviar e-mail</span>
              </a>
            </div>
          </div>
          <div className="about-copy">
            <h2 id="about-title">Sobre o Projetaê</h2>
            <p className="about-description">
              O Projetaê é um espaço para você apresentar sua ideia e dar o primeiro passo para desenvolver seu projeto digital.
            </p>
            <p className="about-contact">
              Sua solicitação será enviada diretamente ao responsável pelo Projetaê, que entrará em contato para conversar sobre os próximos passos.
            </p>
          </div>
        </div>
        <div className="about-ending">
          <div className="about-closing">
            <BrandFinale />
          </div>
          <footer className="about-footer">
            <p>© 2026 Projetaê. Todos os direitos reservados.</p>
          </footer>
        </div>
      </div>
    </section>
  )
}
