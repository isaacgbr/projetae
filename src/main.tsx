import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const visualDemo = import.meta.env.DEV && window.location.pathname === '/dev/envio-visual'
const Demo = visualDemo
  ? lazy(() => import('./features/submission/SubmissionDemo'))
  : null

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {Demo ? <Suspense fallback={<p>Abrindo demonstração…</p>}><Demo /></Suspense> : <App />}
  </StrictMode>,
)
