import { ArrowIcon } from '../../../components/ui/ArrowIcon'

export function StartProjectButton({ onStart }: { onStart: () => void }) {
  return <button className="button button-primary" onClick={onStart}>Planejar meu projeto <ArrowIcon /></button>
}
