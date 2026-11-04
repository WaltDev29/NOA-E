import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { useModal } from '../../context/ModalContext';
import { useOnboarding } from '../../context/OnboardingContext';
import {
  InputNode,
  LLMNode,
  SearchNode,
  CalculatorNode,
  OutputNode,
  PlannerNode,
  RouterNode,
  AggregatorNode,
} from './CustomNodes';
import { ConnectionMode } from '@xyflow/react';
import type { Connection, Edge } from '@xyflow/react';
import CustomEdge from './CustomEdge';

const nodeTypes = {
  inputNode: InputNode,
  llmNode: LLMNode,
  plannerNode: PlannerNode,
  routerNode: RouterNode,
  aggregatorNode: AggregatorNode,
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
  const { activeGuide } = useOnboarding();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const { showAlert } = useModal();

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useWorkflowStore();

  const isValidConnection = useCallback((connection: Edge | Connection) => {
    if (connection.source === connection.target) return false;

    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);

    // Output 노드로부터 나가는 연결 금지
    if (sourceNode?.type === 'outputNode') return false;

    // Router의 루프 포트(loop-return) 연결 검증:
    // 드래그 방향에 상관없이(targetHandle 또는 sourceHandle이 loop-return인 경우)
    const isLoopTarget = connection.targetHandle === 'loop-return';
    const isLoopSource = connection.sourceHandle === 'loop-return';

    if (isLoopTarget || isLoopSource) {
      const otherNode = isLoopTarget ? sourceNode : targetNode;
      if (otherNode?.type === 'inputNode' || otherNode?.type === 'plannerNode') {
        showAlert('루프 포트는 Worker 노드(LLM, 도구 등)와의 작업 순환 연결 전용입니다.', { type: 'warning' });
        return false;
      }
      return true;
    }

    return true;
  }, [nodes, showAlert]);

  // 에이전트 가이드 시 캔버스가 노드 1개 크기로 과도하게 줌인되지 않도록 넉넉한 뷰포트(zoom 0.8) 유지
  useEffect(() => {
    if (activeGuide === 'studio_quest' && reactFlowInstance) {
      reactFlowInstance.setViewport({ x: 60, y: 80, zoom: 0.8 }, { duration: 250 });
    }
  }, [activeGuide, reactFlowInstance]);

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
        showAlert('경고: Input 노드는 하나만 생성할 수 있습니다.', { type: 'warning' });
        return;
      }

      if (type === 'outputNode' && currentNodes.some((n) => n.type === 'outputNode')) {
        showAlert('경고: Output 노드는 하나만 생성할 수 있습니다.', { type: 'warning' });
        return;
      }

      if (!reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const labels: Record<string, string> = {
        inputNode: 'Input',
        plannerNode: 'Planner',
        routerNode: 'Router',
        llmNode: 'LLM',
        aggregatorNode: 'Aggregator',
        searchNode: '웹 검색',
        calculatorNode: '계산기 도구',
        outputNode: 'Output',
      };

      const defaultConfigs: Record<string, any> = {
        inputNode: { input_text: '' },
        plannerNode: {
          model: 'gemma2:2b',
          system_prompt: '사용자 요청을 달성하기 위한 구체적인 단계별 실행 계획을 수립하세요.',
        },
        routerNode: {
          model: 'gemma2:2b',
          max_loops: 5,
          system_prompt: '당신은 지능형 작업 분배 관리자입니다. 주어진 지침과 작업 내용을 바탕으로 가장 적절한 노드로 분기하세요.',
        },
        llmNode: {
          model: 'gemma2:2b',
          system_prompt: 'You are a helpful assistant.',
          react_loop: true,
          max_tool_iterations: 3,
          tool_instruction: '',
        },
        aggregatorNode: {
          model: 'gemma2:2b',
          system_prompt: '각 단계에서 처리된 결과들을 종합하여 사용자 요청에 대한 명확하고 정리된 최종 답변을 작성하세요.',
        },
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
        isValidConnection={isValidConnection}
        connectionMode={ConnectionMode.Loose}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView={activeGuide !== 'studio_quest'}
        fitViewOptions={{ maxZoom: 0.85, padding: 0.3 }}
        defaultViewport={{ x: 60, y: 80, zoom: 0.8 }}
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
