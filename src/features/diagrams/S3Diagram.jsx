import { LazyDiagram } from './LazyDiagram'

export default function S3Diagram() {
  return (
    <LazyDiagram
      loader={() => import('../../S3ArchitectureDiagram')}
      fallbackHeight={500}
    />
  )
}
