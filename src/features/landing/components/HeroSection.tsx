import type { RefObject } from 'react'
import { StartProjectButton } from './StartProjectButton'

function StudioScene() {
  return <div className="studio-scene" aria-hidden="true">
    <img className="scene-frame" src="/images/interview-young-adult.webp" alt="" draggable={false} />
  </div>
}

export function HeroSection({ headingRef, onStart }: {
  headingRef: RefObject<HTMLHeadingElement | null>
  onStart: () => void
}) {
  return <section className="landing-hero landing-scene" aria-labelledby="landing-title">
    <div className="scene-content hero-scene-content">
      <div className="landing-container hero-inner">
        <div className="landing-hero-copy">
          <h1 id="landing-title" ref={headingRef} tabIndex={-1}>Sua ideia<br /> <span>começa</span> aqui.</h1>
          <p className="landing-hero-description">Organize sua ideia e planeje seu projeto digital com um briefing.</p>
          <div className="landing-hero-actions">
            <StartProjectButton onStart={onStart} />
          </div>
        </div>
      </div>
      <StudioScene />
    </div>
  </section>
}
