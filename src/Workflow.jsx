import React, { useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MarkerType,
  useNodesState,
  useEdgesState,
  addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  {
    id: 'working-dir',
    type: 'default',
    data: { label: 'Working Directory\n(Your Files)' },
    position: { x: 50, y: 150 },
    className: 'node-working'
  },
  {
    id: 'staging-area',
    type: 'default',
    data: { label: 'Staging Area\n(Index)' },
    position: { x: 300, y: 150 },
    className: 'node-staging'
  },
  {
    id: 'local-repo',
    type: 'default',
    data: { label: 'Local Repository\n(.git folder)' },
    position: { x: 550, y: 150 },
    className: 'node-repo'
  },
  {
    id: 'remote-repo',
    type: 'default',
    data: { label: 'Remote Repository\n(GitHub)' },
    position: { x: 800, y: 150 },
    className: 'node-remote'
  }
];

const initialEdges = [
  {
    id: 'e1-2',
    source: 'working-dir',
    target: 'staging-area',
    label: 'git add',
    animated: true,
    style: { stroke: '#10b981' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' }
  },
  {
    id: 'e2-3',
    source: 'staging-area',
    target: 'local-repo',
    label: 'git commit',
    animated: true,
    style: { stroke: '#3b82f6' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
  },
  {
    id: 'e3-4',
    source: 'local-repo',
    target: 'remote-repo',
    label: 'git push',
    animated: true,
    style: { stroke: '#8b5cf6' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' }
  },
  {
    id: 'e4-1',
    source: 'remote-repo',
    target: 'working-dir',
    label: 'git pull / clone',
    animated: true,
    style: { stroke: '#f59e0b' },
    type: 'smoothstep',
    sourcePosition: 'bottom',
    targetPosition: 'bottom',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' }
  }
];

export default function Workflow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="workflow-container">
      <div className="workflow-overlay">
        <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>Interactive Git Workflow</h3>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Drag nodes to explore</p>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-right"
        className="react-flow"
      >
        <Background color="#334155" gap={16} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
