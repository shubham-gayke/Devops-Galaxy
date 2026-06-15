import { LazyDiagram } from './LazyDiagram'

export default function VPCDiagram() {
  return (
    <LazyDiagram
      loader={() => import('../../VPCArchitectureDiagram')}
      fallbackHeight={500}
    />
  )
}
