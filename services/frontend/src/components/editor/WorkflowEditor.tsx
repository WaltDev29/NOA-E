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
import { useTheme } from '../../context/ThemeContext';
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
  const { theme } = useTheme();
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
        inputNode: 'Input',
        llmNode: 'LLM',
        agentNode: 'Autonomous Agent',
        searchNode: '웹 검색',
        calculatorNode: '계산기 도구',
        outputNode: 'Output',
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

  // Shift + Drag (좌우 이동) 및 Ctrl + Drag (확대/축소) 제어
  const dragStartRef = useRef<{
    x: number;
    y: number;
    viewport: { x: number; y: number; zoom: number };
    mode: 'shift' | 'ctrl';
  } | null>(null);

  const handleMouseDownCapture = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      // 노드 내부 또는 조작 UI 클릭 시에는 기본 이벤트 허용
      if (
        target.closest('.react-flow__node') ||
        target.closest('.react-flow__controls') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('button') ||
        target.closest('select')
      ) {
        return;
      }

      if (e.button === 0 && (e.shiftKey || e.ctrlKey)) {
        if (!reactFlowInstance) return;
        e.stopPropagation();
        dragStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          viewport: reactFlowInstance.getViewport(),
          mode: e.ctrlKey ? 'ctrl' : 'shift',
        };
      }
    },
    [reactFlowInstance],
  );

  const handleMouseMoveCapture = useCallback(
    (e: React.MouseEvent) => {
      if (!dragStartRef.current || !reactFlowInstance) return;
      e.preventDefault();
      e.stopPropagation();

      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const { viewport, mode } = dragStartRef.current;

      if (mode === 'shift') {
        // Shift + Drag: 좌우로만 이동 (Y축 고정)
        reactFlowInstance.setViewport({
          x: viewport.x + dx,
          y: viewport.y,
          zoom: viewport.zoom,
        });
      } else if (mode === 'ctrl') {
        // Ctrl + Drag: 위로 드래그 시 확대, 아래로 드래그 시 축소
        const zoomDelta = -dy * 0.01;
        const newZoom = Math.min(Math.max(0.2, viewport.zoom * (1 + zoomDelta)), 2.5);
        reactFlowInstance.setViewport({
          x: viewport.x,
          y: viewport.y,
          zoom: newZoom,
        });
      }
    },
    [reactFlowInstance],
  );

  const handleMouseUpCapture = useCallback(() => {
    dragStartRef.current = null;
  }, []);

  return (
    <div
      className="flex-1 w-full h-full relative select-none"
      ref={reactFlowWrapper}
      onMouseDownCapture={handleMouseDownCapture}
      onMouseMoveCapture={handleMouseMoveCapture}
      onMouseUpCapture={handleMouseUpCapture}
      onMouseLeave={handleMouseUpCapture}
    >
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
        colorMode={theme}
        className="bg-background"
        panOnDrag={true}
        panOnScroll={true}
        zoomOnScroll={true}
        zoomActivationKeyCode="Control"
        minZoom={0.2}
        maxZoom={2.5}
        defaultEdgeOptions={{
          type: 'custom',
          animated: true,
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color={theme === 'dark' ? "rgba(218, 226, 253, 0.12)" : "rgba(15, 23, 42, 0.18)"}
        />
        <Controls
          position="bottom-right"
          showInteractive={false}
          className="!bg-surface-container-low !backdrop-blur-md !border !border-outline-variant/60 !rounded-xl !p-1 !shadow-xl"
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
