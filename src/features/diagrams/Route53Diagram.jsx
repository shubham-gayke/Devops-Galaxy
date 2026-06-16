import { LazyDiagram } from './LazyDiagram'

export default function Route53Diagram() {
  return (
    <LazyDiagram
      loader={() => import('../../Route53ArchitectureDiagram')}
      fallbackHeight={500}
    />
  )
}
