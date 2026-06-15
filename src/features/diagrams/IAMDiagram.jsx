import { LazyDiagram } from './LazyDiagram'

export default function IAMDiagram() {
  return (
    <LazyDiagram
      loader={() => import('../../IAMArchitectureDiagram')}
      fallbackHeight={500}
    />
  )
}
