import { LazyDiagram } from './LazyDiagram'

export default function EC2Diagram() {
  return (
    <LazyDiagram
      loader={() => import('../../components/EC2RequestFlow')}
      fallbackHeight={500}
    />
  )
}
