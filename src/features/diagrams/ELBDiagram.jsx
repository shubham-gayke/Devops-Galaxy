import { LazyDiagram } from './LazyDiagram'

export default function ELBDiagram() {
  return (
    <LazyDiagram
      loader={() => import('../../ELBArchitectureDiagram')}
      fallbackHeight={500}
    />
  )
}
