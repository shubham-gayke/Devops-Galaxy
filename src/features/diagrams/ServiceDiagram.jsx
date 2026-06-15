import { LazyDiagram } from './LazyDiagram'

export default function ServiceDiagram() {
  return (
    <LazyDiagram
      loader={() => import('../../ServiceModelDiagram')}
      fallbackHeight={400}
    />
  )
}
