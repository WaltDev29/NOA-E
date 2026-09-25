import { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  Panel,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore } from '../../store/useWorkflowStore';
import { InputNode, LLMNode, OutputNode, AgentNode, SearchNode, CalculatorNode } from './CustomNodes';
import CustomEdge from './CustomEdge';

const nodeTypes = {
  inputNode: InputNode,
  llmNode: LLMNode,
  agentNode: AgentNode,
  searchNode: SearchNode,
  calculatorNode: CalculatorNode,
  outputNode: OutputNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

let idCounters: Record<string, number> = { 
  inputNode: 1, 
  llmNode: 1, 
  outputNode: 1,
  agentNode: 1,
  searchNode: 1,
  calculatorNode: 1
};
const getId = (type: string) => {
  const prefix = type.replace('Node', '');
  if (!idCounters[type]) idCounters[type] = 1;
  return `${prefix}-${idCounters[type]++}`;
};

const Editor = () => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useWorkflowStore();

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const currentNodes = useWorkflowStore.getState().nodes;
      
      if (type === 'inputNode' && currentNodes.some(n => n.type === 'inputNode')) {
        alert('경고: Input 노드는 하나만 생성할 수 있습니다.');
        return;
      }
      
      if (type === 'outputNode' && currentNodes.some(n => n.type === 'outputNode')) {
        alert('경고: Output 노드는 하나만 생성할 수 있습니다.');
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const labels: Record<string, string> = {
        inputNode: 'Input',
        llmNode: 'LLM Agent',
        agentNode: 'Autonomous Agent',
        searchNode: 'Search Tool',
        calculatorNode: 'Calculator Tool',
        outputNode: 'Output'
      };

      const newNode = {
        id: getId(type),
        type,
        position,
        data: { label: labels[type] || 'Node', config: {} },
      };

      useWorkflowStore.getState().setNodes([...useWorkflowStore.getState().nodes, newNode]);
    },
    [reactFlowInstance],
  );

  return (
    <div className="flex-1 relative" style={{ width: '100%', height: '100%' }} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: 'custom', animated: true }}
        fitView
        className="bg-muted/10"
      >
        <Controls />
        <Background gap={24} size={2} color="hsl(var(--muted-foreground))" className="opacity-20" />
        
        {/* Sidebar Palette inside ReactFlow Panel */}
        <Panel position="top-left" className="bg-card/80 backdrop-blur-md p-3 rounded-lg border shadow-lg flex flex-col gap-2 max-h-[90vh] overflow-y-auto">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Core Nodes</h3>
          <div 
            className="px-3 py-2 bg-background border rounded cursor-grab hover:border-primary text-sm shadow-sm transition-colors"
            onDragStart={(e) => { e.dataTransfer.setData('application/reactflow', 'inputNode'); e.dataTransfer.effectAllowed = 'move'; }}
            draggable
          >
            Input Node
          </div>
          <div 
            className="px-3 py-2 bg-background border rounded cursor-grab hover:border-primary text-sm shadow-sm transition-colors"
            onDragStart={(e) => { e.dataTransfer.setData('application/reactflow', 'llmNode'); e.dataTransfer.effectAllowed = 'move'; }}
            draggable
          >
            LLM Agent
          </div>
          <div 
            className="px-3 py-2 bg-background border rounded cursor-grab hover:border-primary text-sm shadow-sm transition-colors"
            onDragStart={(e) => { e.dataTransfer.setData('application/reactflow', 'agentNode'); e.dataTransfer.effectAllowed = 'move'; }}
            draggable
          >
            Autonomous Agent
          </div>
          <div 
            className="px-3 py-2 bg-background border rounded cursor-grab hover:border-primary text-sm shadow-sm transition-colors"
            onDragStart={(e) => { e.dataTransfer.setData('application/reactflow', 'outputNode'); e.dataTransfer.effectAllowed = 'move'; }}
            draggable
          >
            Output Node
          </div>
          
          <h3 className="text-xs font-semibold uppercase text-muted-foreground mt-2 mb-1">Tools</h3>
          <div 
            className="px-3 py-2 bg-background border rounded cursor-grab hover:border-primary text-sm shadow-sm transition-colors"
            onDragStart={(e) => { e.dataTransfer.setData('application/reactflow', 'searchNode'); e.dataTransfer.effectAllowed = 'move'; }}
            draggable
          >
            Search Tool
          </div>
          <div 
            className="px-3 py-2 bg-background border rounded cursor-grab hover:border-primary text-sm shadow-sm transition-colors"
            onDragStart={(e) => { e.dataTransfer.setData('application/reactflow', 'calculatorNode'); e.dataTransfer.effectAllowed = 'move'; }}
            draggable
          >
            Calculator Tool
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export const WorkflowEditor = () => (
  <ReactFlowProvider>
    <Editor />
  </ReactFlowProvider>
);
