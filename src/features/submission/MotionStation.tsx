import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './motion-station.css'

const phases = [
  [0, 'writing'],
  [2300, 'documentReady'],
  [2700, 'opening'],
  [3200, 'inserting'],
  [4800, 'closing'],
  [5400, 'stamped'],
  [6400, 'dispatching'],
  [7300, 'dispatched'],
  [7550, 'success'],
] as const
const last = phases.length - 1
const motionQuery = '(prefers-reduced-motion: reduce)'

export default function MotionStation({ onReplay }: { onReplay: () => void }) {
  const [step, setStep] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const skip = useRef<HTMLButtonElement>(null)
  const complete = step === last
  const phase = phases[step][1]

  useEffect(() => {
    const motion = window.matchMedia(motionQuery)
    const finish = () => { if (motion.matches) setStep(last) }
    motion.addEventListener('change', finish)
    return () => motion.removeEventListener('change', finish)
  }, [])
  useEffect(() => {
    if (complete) return
    const start = performance.now()
    const rate = window.matchMedia(motionQuery).matches ? 0.12 : 1
    let timer: ReturnType<typeof setTimeout>
    function advance(index: number) {
      setStep(index)
      const next = phases[index + 1]
      if (next) timer = setTimeout(() => advance(index + 1), Math.max(0, start + next[0] * rate - performance.now()))
    }
    advance(0)
    return () => clearTimeout(timer)
  }, [complete])
  useEffect(() => {
    if (complete) heading.current?.focus({ preventScroll: true })
    else skip.current?.focus({ preventScroll: true })
  }, [complete])

  return createPortal(<main className="delivery-experience" data-phase={phase} aria-label="Envio da solicitação">
    <header className="delivery-brand"><img src="/brand/projetae-logo.svg" alt="Projetaê" width="174" height="54" /></header>
    <div className="delivery-stage" aria-hidden="true">
      <div className="delivery-parcel">
      <div className="envelope-interior" />
      <div className="report-pocket">
      <div className="delivery-report">
        <div className="report-heading"><img src="/brand/projetae-symbol.svg" alt="" /><span>Solicitação de projeto</span></div>
        <div className="report-divider" />
        <div className="report-lines"><i /><i /><i /></div>
        <div className="report-field"><span /><span /></div>
        <div className="report-lines report-lines-second"><i /><i /></div>
        <svg className="report-check" viewBox="0 0 24 24"><path d="m5 12 5 5 9-10" pathLength="1" /></svg>
      </div>
      </div>
      <div className="delivery-envelope">
        <svg className="envelope-drawing" viewBox="0 0 280 178"><rect x="1" y="1" width="278" height="176" rx="7" /><path d="M3 175 103 87M277 175 177 87" /></svg>
        <img className="envelope-brand" src="/brand/projetae-symbol.svg" alt="" />
        <span className="delivery-stamp">RECEBIDO ✓</span>
      </div>
      <svg className="envelope-lid" viewBox="0 0 280 110"><path d="M1 1H279L151 101Q140 110 129 101Z" /></svg>
      <div className="dispatch-streaks"><i /><i /></div>
      </div>
    </div>
    {!complete && <p className="delivery-caption" role="status">{phase === 'dispatching' || phase === 'dispatched' ? 'Enviando sua solicitação...' : 'Preparando sua solicitação...'}</p>}
    {complete && <section className="delivery-success" aria-labelledby="delivery-title">
      <svg className="delivery-check" viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="43" /><path d="m27 48 14 14 28-29" pathLength="1" /></svg>
      <div className="delivery-message">
        <h1 ref={heading} id="delivery-title" tabIndex={-1}>Solicitação enviada!</h1>
        <p>Recebi sua solicitação e vou analisar as informações do projeto. Entrarei em contato com você em breve.</p>
        <button type="button" className="text-button delivery-replay" onClick={onReplay}>Rever demonstração</button>
      </div>
    </section>}
    {!complete && <button ref={skip} type="button" className="text-button delivery-skip" onClick={() => setStep(last)}>Pular animação</button>}
  </main>, document.body)
}
