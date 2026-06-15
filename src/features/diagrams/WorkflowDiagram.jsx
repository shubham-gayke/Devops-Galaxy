import { LazyDiagram } from './LazyDiagram'

export default function WorkflowDiagram() {
  return (
    <LazyDiagram
      loader={() => import('../../Workflow')}
      fallbackHeight={300}
    />
  )
}
