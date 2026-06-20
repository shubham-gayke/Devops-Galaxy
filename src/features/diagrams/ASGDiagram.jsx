import { LazyDiagram } from './LazyDiagram'

export default function ASGDiagram() {
  return (
    <LazyDiagram
      loader={() => import('../../ASGArchitectureDiagram')}
      fallbackHeight={500}
    />
  )
}
