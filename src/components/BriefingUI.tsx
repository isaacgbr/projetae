export function StudioScene() {
  return (
    <div className="studio-scene" aria-hidden="true">
      <img className="scene-frame" src="/images/interview-young-adult.webp" alt="" draggable={false} />
    </div>
  )
}
export function ArrowIcon({ back = false }: { back?: boolean }) {
  return <svg className={back ? 'arrow-icon back' : 'arrow-icon'} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
