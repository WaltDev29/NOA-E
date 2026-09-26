import React, { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore } from '../../store/useWorkflowStore';
import {
  InputNode,
  LLMNode,
  AgentNode,
  SearchNode,
  CalculatorNode,
  OutputNode,
} from './CustomNodes';
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
  calculatorNode: 1,
};

const getId = (type: string) => {
  const prefix = type.replace('Node', '');
  if (!idCounters[type]) idCounters[type] = 1;
  return `${prefix}-${idCounters[type]++}`;
};

const EditorInner: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useWorkflowStore();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const currentNodes = useWorkflowStore.getState().nodes;

      if (type === 'inputNode' && currentNodes.some((n) => n.type === 'inputNode')) {
        alert('경고: Input 노드는 하나만 생성할 수 있습니다.');
        return;
      }

      if (type === 'outputNode' && currentNodes.some((n) => n.type === 'outputNode')) {
        alert('경고: Output 노드는 하나만 생성할 수 있습니다.');
        return;
      }

      if (!reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const labels: Record<string, string> = {
        inputNode: '사용자 입력',
        llmNode: 'LLM',
        agentNode: 'Autonomous Agent',
        searchNode: '웹 검색',
        calculatorNode: '계산기 도구',
        outputNode: '결과 출력',
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
    <div className="flex-1 w-full h-full relative" ref={reactFlowWrapper}>
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
        fitView
        colorMode="dark"
        className="bg-[#0b1326]"
        defaultEdgeOptions={{
          type: 'custom',
          animated: true,
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="rgba(218, 226, 253, 0.12)"
        />
        <Controls
          position="bottom-right"
          showInteractive={false}
          className="!bg-surface-container-lowest/90 !backdrop-blur-md !border !border-outline-variant/40 !rounded-xl !p-1 !shadow-lg"
        />
      </ReactFlow>
    </div>
  );
};

export const WorkflowEditor: React.FC = () => {
  return (
    <ReactFlowProvider>
      <EditorInner />
    </ReactFlowProvider>
  );
};
