import { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { WorkflowNode } from './WorkflowNode';

// Define node types for the custom nodes
const nodeTypes = {
  customNode: WorkflowNode,
};

interface WorkflowCanvasProps {
  initialNodes?: any[];
  initialEdges?: any[];
  onNodesChange?: (nodes: any[]) => void;
  onEdgesChange?: (edges: any[]) => void;
}

export default function WorkflowCanvas({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
}: WorkflowCanvasProps) {
  // Initialize nodes and edges with default values or from props
  const [nodes, setNodes, onNodesUpdated] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesUpdated] = useEdgesState(initialEdges);

  // Sync nodes and edges with parent component if needed
  useEffect(() => {
    if (initialNodes.length > 0) {
      setNodes(initialNodes);
    }
  }, [initialNodes, setNodes]);

  useEffect(() => {
    if (initialEdges.length > 0) {
      setEdges(initialEdges);
    }
  }, [initialEdges, setEdges]);

  // Call parent callbacks when nodes or edges change
  useEffect(() => {
    if (onNodesChange) {
      onNodesChange(nodes);
    }
  }, [nodes, onNodesChange]);

  useEffect(() => {
    if (onEdgesChange) {
      onEdgesChange(edges);
    }
  }, [edges, onEdgesChange]);

  // Handle connection between nodes
  const onConnect = useCallback(
    (connection: Connection | Edge) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  // Function to add a new node at specified position
  const handleAddNode = (nodeType: string, position: { x: number; y: number }) => {
    const newId = `node_${nodes.length + 1}`;
    const newNode = {
      id: newId,
      type: 'customNode',
      position,
      data: { 
        label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
        type: nodeType,
        nodeColor: getNodeColor(nodeType),
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
    return newId;
  };

  // Get color based on node type
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'linkedin':
        return '#0A66C2';
      case 'instagram':
        return '#E4405F';
      case 'twitter':
        return '#1DA1F2';
      case 'send-dm':
        return '#3B82F6';
      case 'wait':
        return '#6B7280';
      case 'condition':
        return '#8B5CF6';
      case 'google-sheets':
        return '#34A853';
      default:
        return '#6B7280';
    }
  };

  return (
    <div className="workflow-canvas w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesUpdated}
        onEdgesChange={onEdgesUpdated}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <Background color="#d1d5db" gap={25} size={1} />
      </ReactFlow>
    </div>
  );
}
