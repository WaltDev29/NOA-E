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

const getUniqueId = (type: string, currentNodes: any[]) => {
  const prefix = type.replace('Node', '');
  // Find highest existing numerical suffix
  let maxSuffix = 0;
  currentNodes.forEach((node) => {
    if (node.id.startsWith(`${prefix}-`)) {
      const num = parseInt(node.id.replace(`${prefix}-`, ''), 10);
      if (!isNaN(num) && num > maxSuffix) {
        maxSuffix = num;
      }
    }
  });

  return `${prefix}-${maxSuffix + 1}`;
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

      const defaultConfigs: Record<string, any> = {
        llmNode: { model: 'gemma2:2b', system_prompt: 'You are a helpful assistant.' },
        agentNode: { model: 'gemma2:2b', system_prompt: 'You are an autonomous agent.' },
        inputNode: { input_text: '' },
        searchNode: {},
        calculatorNode: {},
        outputNode: {},
      };

      const newId = getUniqueId(type, currentNodes);

      const newNode = {
        id: newId,
        type,
        position,
        data: {
          label: labels[type] || 'Node',
          config: defaultConfigs[type] || {},
        },
      };

      useWorkflowStore.getState().setNodes([...currentNodes, newNode]);
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
