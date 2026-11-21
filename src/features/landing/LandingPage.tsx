import type { RefObject } from 'react'
import { AboutSection } from './components/AboutSection'
import { HeroSection } from './components/HeroSection'
import { LandingHeader } from './components/LandingHeader'
import { ProcessSection } from './components/ProcessSection'
import { ProjectsSection } from './components/ProjectsSection'
import { useLandingPresence } from './hooks/useLandingPresence'
import './styles/landing.css'

export function LandingPage({ headingRef, onStart }: {
  headingRef: RefObject<HTMLHeadingElement | null>
  onStart: () => void
}) {
  const page = useLandingPresence()

  return <div ref={page} className="landing-page">
    <LandingHeader onStart={onStart} />
    <main id="main" tabIndex={-1} className="landing-main">
      <HeroSection headingRef={headingRef} onStart={onStart} />
      <ProcessSection />
      <ProjectsSection />
      <AboutSection />
    </main>
  </div>
}
