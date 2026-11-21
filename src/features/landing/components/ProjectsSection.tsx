import { ProjectCarousel } from './ProjectCarousel'

export function ProjectsSection() {
  return <section className="landing-section services-section landing-scene" id="projetos" aria-labelledby="services-title">
    <div className="landing-container scene-content">
      <div className="section-intro">
        <h2 id="services-title">Projetos digitais</h2>
      </div>
      <p className="demo-note">Algumas formas de apresentar seu negócio, seus produtos ou seu trabalho.</p>
      <ProjectCarousel />
      <p className="other-projects"><strong>Tem outra ideia em mente?</strong><span>O projeto pode ser pensado a partir da sua necessidade.</span></p>
    </div>
  </section>
}
