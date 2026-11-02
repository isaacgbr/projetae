import { useRef, useState } from 'react'
import { LandingPage } from './components/LandingPage'
import { Briefing } from './components/Briefing'
export default function App() {
  const [isForm, setIsForm] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const landingHeading = useRef<HTMLHeadingElement>(null)
  function showLanding() {
    setIsForm(false)
    requestAnimationFrame(() => { window.scrollTo(0, 0); landingHeading.current?.focus({ preventScroll: true }) })
  }
  return <div className={`page-shell ${isForm ? 'is-form briefing' : 'is-welcome'}`}>
    <a className="skip-link" href={isForm ? '#briefing-main' : '#main'}>Pular para o conteúdo</a>
    {!isForm && <LandingPage headingRef={landingHeading} onStart={() => { setHasStarted(true); setIsForm(true) }} />}
    {hasStarted && <div hidden={!isForm} className={isForm ? 'briefing-arrival' : undefined}><Briefing visible={isForm} onHome={showLanding} /></div>}
  </div>
}
