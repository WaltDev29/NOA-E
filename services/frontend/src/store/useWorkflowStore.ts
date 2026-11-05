import { create } from 'zustand';
import { 
  addEdge, 
  applyNodeChanges, 
  applyEdgeChanges 
} from '@xyflow/react';
import type {
  Connection, 
  Edge, 
  EdgeChange, 
  Node, 
  NodeChange, 
  OnNodesChange, 
  OnEdgesChange, 
  OnConnect 
} from '@xyflow/react';

export interface ExecutionStep {
  stepIndex: number;
  input: string;
  output: string;
  timestamp: string;
  logs?: string[];
}

export interface NodeExecutionResult {
  nodeId: string;
  nodeType?: string;
  nodeLabel?: string;
  steps: ExecutionStep[];
  status: 'idle' | 'running' | 'completed' | 'error';
  timestamp?: string;
}

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  logs: string[];
  messages: any[]; // 대화 이력을 저장하기 위한 상태
  executionResult: string;
  isExecuting: boolean;
  nodeResults: Record<string, NodeExecutionResult>;
  selectedResultNodeId: string | null;
  onNodesChange: OnNodesChange<Node>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNode: (node: Node | null) => void;
  updateNodeConfig: (nodeId: string, config: any) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  saveToLocalStorage: (agentName: string) => void;
  loadFromLocalStorage: () => string | null;
  addLog: (log: string) => void;
  setMessages: (messages: any[]) => void;
  setExecutionResult: (result: string) => void;
  setIsExecuting: (isExecuting: boolean) => void;
  appendNodeStep: (
    nodeId: string,
    stepData: { input: string; output: string; logs?: string[] },
    nodeMeta?: { nodeType?: string; nodeLabel?: string; status?: 'idle' | 'running' | 'completed' | 'error' }
  ) => void;
  setSelectedResultNodeId: (nodeId: string | null) => void;
  clearNodeResults: () => void;
  clearLogs: () => void;
  clearMessages: () => void;
  addNode: (type: string, position?: { x: number; y: number }) => { success: boolean; node?: Node; message?: string };
  nodeInfoModal: { isOpen: boolean; nodeType: string | null };
  openNodeModal: (nodeType: string) => void;
  closeNodeModal: () => void;
  outputResultModal: { isOpen: boolean };
  openOutputModal: () => void;
  closeOutputModal: () => void;
  resetWorkflow: () => void;
  activeNodeId: string | null;
  setActiveNodeId: (nodeId: string | null) => void;
  modelCapabilities: Record<string, { image: boolean; tool: boolean; mcp: boolean; skill: boolean }>;
  setModelCapabilities: (caps: Record<string, { image: boolean; tool: boolean; mcp: boolean; skill: boolean }>) => void;
  fetchModelCapabilities: () => Promise<void>;

}

const DEFAULT_LLM_SYSTEM_PROMPT = '당신은 사용자의 요청에 정확하고 친절하게 답변하는 유능한 AI 어시스턴트입니다.';
const TOOL_NODE_TYPES = ['searchNode', 'weatherNode', 'youtubeNode'];

const pruneUnsupportedToolEdges = (
  nodes: Node[],
  edges: Edge[],
  caps: Record<string, { image: boolean; tool: boolean; mcp: boolean; skill: boolean }>
): Edge[] => {
  if (!caps || Object.keys(caps).length === 0) return edges;
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  return edges.filter((edge) => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);
    const isToolEdge =
      edge.targetHandle === 'tools' ||
      edge.sourceHandle === 'tools' ||
      TOOL_NODE_TYPES.includes(sourceNode?.type || '') ||
      TOOL_NODE_TYPES.includes(targetNode?.type || '');
    if (!isToolEdge) return true;
    if (targetNode?.type !== 'llmNode') return false;
    const modelName = (targetNode.data as any)?.config?.model || 'gemma2:2b';
    return Boolean(caps[modelName]?.tool);
  });
};

const initialNodes: Node[] = [
  { id: 'input-1', type: 'inputNode', position: { x: 100, y: 100 }, data: { label: 'Input', config: {} } },
  { id: 'llm-1', type: 'llmNode', position: { x: 400, y: 100 }, data: { label: 'LLM', config: { model: 'gemma2:2b', temperature: 0.7, system_prompt: DEFAULT_LLM_SYSTEM_PROMPT } } },
  { id: 'output-1', type: 'outputNode', position: { x: 700, y: 100 }, data: { label: 'Output', config: {} } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'input-1', target: 'llm-1', targetHandle: 'left', type: 'custom', animated: true },
  { id: 'e2-3', source: 'llm-1', sourceHandle: 'right', target: 'output-1', type: 'custom', animated: true },
];

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNode: null,
  logs: [],
  messages: [],
  executionResult: '',
  isExecuting: false,
  nodeResults: {},
  selectedResultNodeId: null,
  modelCapabilities: {},
  setModelCapabilities: (caps) =>
    set((state) => ({
      modelCapabilities: caps,
      edges: pruneUnsupportedToolEdges(state.nodes, state.edges, caps),
    })),
  fetchModelCapabilities: async () => {
    try {
      const res = await (await import('../services/workflowApi')).workflowApi.getAvailableModels();
      if (res.model_capabilities) {
        get().setModelCapabilities(res.model_capabilities);
      }
    } catch (e) {
      console.error('Failed to fetch model capabilities:', e);
    }
  },

  onNodesChange: (changes: NodeChange<Node>[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
    
    // Update selected node if it changed
    const selected = get().nodes.find(n => n.selected);
    set({ 
      selectedNode: selected || null,
      selectedResultNodeId: selected ? selected.id : get().selectedResultNodeId,
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    const existingEdges = get().edges;

    // 케이스 1: Router 하단 루프 포트(loop-return)에서 Worker 노드로 드래그한 경우
    if (connection.sourceHandle === 'loop-return') {
      const routerId = connection.source;
      const workerId = connection.target;

      const hasReturnEdge = existingEdges.some(
        (e) => e.source === workerId && e.target === routerId
      );
      const hasForwardEdge = existingEdges.some(
        (e) => e.source === routerId && e.target === workerId
      );

      const newEdges = [...existingEdges];

      // Router -> Worker 분기선이 없으면 추가
      if (!hasForwardEdge) {
        newEdges.push({
          id: `e-${routerId}-${workerId}`,
          source: routerId,
          sourceHandle: 'right',
          target: workerId,
          targetHandle: connection.targetHandle || 'left',
          type: 'custom',
          animated: true,
        });
      }

      // Worker -> Router (loop-return) 복귀선 추가
      if (!hasReturnEdge) {
        newEdges.push({
          id: `e-${workerId}-${routerId}-loop`,
          source: workerId,
          sourceHandle: 'right',
          target: routerId,
          targetHandle: 'loop-return',
          type: 'custom',
          animated: true,
        });
      }

      set({ edges: newEdges });
      return;
    }

    // 케이스 2: Worker 노드에서 Router 하단 루프 포트(loop-return)로 드래그한 경우
    if (connection.targetHandle === 'loop-return') {
      const workerId = connection.source;
      const routerId = connection.target;

      const hasReturnEdge = existingEdges.some(
        (e) => e.source === workerId && e.target === routerId
      );

      if (!hasReturnEdge) {
        set({
          edges: addEdge(
            {
              ...connection,
              type: 'custom',
              animated: true,
            },
            existingEdges
          ),
        });
      }
      return;
    }

    // 일반 에지 연결
    set({
      edges: addEdge(
        {
          ...connection,
          type: 'custom',
          animated: true,
        },
        existingEdges
      ),
    });
  },
  setNodes: (nodes) =>
    set((state) => {
      const normalizedNodes = nodes.map((node) => {
        if (node.type === 'llmNode' && (node.data as any)?.config?.system_prompt === 'You are a helpful assistant.') {
          return {
            ...node,
            data: {
              ...node.data,
              config: {
                ...(node.data as any).config,
                system_prompt: DEFAULT_LLM_SYSTEM_PROMPT,
              },
            },
          };
        }
        return node;
      });
      return {
        nodes: normalizedNodes,
        edges: pruneUnsupportedToolEdges(normalizedNodes, state.edges, state.modelCapabilities),
      };
    }),
  setEdges: (edges) =>
    set((state) => ({
      edges: pruneUnsupportedToolEdges(state.nodes, edges, state.modelCapabilities),
    })),
  deleteNode: (nodeId) => set((state) => ({
    nodes: state.nodes.filter(n => n.id !== nodeId),
    edges: state.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
    selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode,
    selectedResultNodeId: state.selectedResultNodeId === nodeId ? null : state.selectedResultNodeId,
  })),
  setSelectedNode: (node) => set({ 
    selectedNode: node,
    selectedResultNodeId: node ? node.id : get().selectedResultNodeId,
  }),
  updateNodeConfig: (nodeId, config) => {
    const updatedNodes = get().nodes.map((node) => {
      if (node.id === nodeId) {
        return { ...node, data: { ...node.data, config: { ...(node.data as any)?.config, ...config } } };
      }
      return node;
    });
    const updatedTarget = updatedNodes.find((n) => n.id === nodeId) || null;
    const prunedEdges = pruneUnsupportedToolEdges(updatedNodes, get().edges, get().modelCapabilities);
    set({
      nodes: updatedNodes,
      edges: prunedEdges,
      selectedNode: get().selectedNode?.id === nodeId ? updatedTarget : get().selectedNode,
    });
  },
  updateNodeLabel: (nodeId, label) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          const updatedNode = { ...node, data: { ...node.data, label } };
          if (get().selectedNode?.id === nodeId) {
            set({ selectedNode: updatedNode });
          }
          return updatedNode;
        }
        return node;
      }),
    });
  },
  saveToLocalStorage: (agentName: string) => {
    try {
      const state = get();
      const payload = {
        agentName,
        nodes: state.nodes,
        edges: state.edges,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('noa_saved_workflow', JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save workflow to localStorage:', e);
    }
  },
  loadFromLocalStorage: () => {
    try {
      const raw = localStorage.getItem('noa_saved_workflow');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed.nodes && parsed.edges) {
        // 기존 브라우저 로컬 스토리지에 남아있던 레거시 라벨 및 영문 기본 프롬프트 자동 마이그레이션
        const migratedNodes = parsed.nodes.map((node: any) => {
          let label = node.data?.label;
          if (label === 'LLM Agent') label = 'LLM';
          if (label === '사용자 입력') label = 'Input';
          if (label === '결과 출력') label = 'Output';
          const rawConfig = node.data?.config || {};
          const migratedConfig =
            node.type === 'llmNode' && rawConfig.system_prompt === 'You are a helpful assistant.'
              ? { ...rawConfig, system_prompt: DEFAULT_LLM_SYSTEM_PROMPT }
              : rawConfig;
          return {
            ...node,
            data: {
              ...node.data,
              config: migratedConfig,
              label: label || (node.type === 'inputNode' ? 'Input' : node.type === 'outputNode' ? 'Output' : node.type === 'llmNode' ? 'LLM' : node.id),
            },
          };
        });

        set((state) => ({
          nodes: migratedNodes,
          edges: pruneUnsupportedToolEdges(migratedNodes, parsed.edges, state.modelCapabilities),
          selectedNode: null,
          selectedResultNodeId: null,
        }));
        return parsed.agentName || null;
      }
    } catch (e) {
      console.error('Failed to load workflow from localStorage:', e);
    }
    return null;
  },
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  setMessages: (messages) => set({ messages }),
  setExecutionResult: (result) => set({ executionResult: result }),
  setIsExecuting: (isExecuting) => set({ isExecuting }),
  appendNodeStep: (nodeId, stepData, nodeMeta) => set((state) => {
    const existing = state.nodeResults[nodeId] || {
      nodeId,
      nodeType: nodeMeta?.nodeType,
      nodeLabel: nodeMeta?.nodeLabel,
      steps: [],
      status: 'idle',
    };

    const newStep: ExecutionStep = {
      stepIndex: existing.steps.length + 1,
      input: stepData.input,
      output: stepData.output,
      timestamp: new Date().toLocaleTimeString(),
      logs: stepData.logs,
    };

    return {
      nodeResults: {
        ...state.nodeResults,
        [nodeId]: {
          ...existing,
          nodeType: nodeMeta?.nodeType || existing.nodeType,
          nodeLabel: nodeMeta?.nodeLabel || existing.nodeLabel,
          status: nodeMeta?.status || 'completed',
          timestamp: new Date().toLocaleTimeString(),
          steps: [...existing.steps, newStep],
        },
      },
    };
  }),
  setSelectedResultNodeId: (nodeId) => set({ selectedResultNodeId: nodeId }),
  clearNodeResults: () => set({ nodeResults: {}, selectedResultNodeId: null }),
  clearLogs: () => set({ logs: [], executionResult: '', nodeResults: {}, selectedResultNodeId: null }),
  clearMessages: () => set({ messages: [], logs: [], executionResult: '', nodeResults: {}, selectedResultNodeId: null }),
  nodeInfoModal: { isOpen: false, nodeType: null },
  openNodeModal: (nodeType) => set({ nodeInfoModal: { isOpen: true, nodeType } }),
  closeNodeModal: () => set({ nodeInfoModal: { isOpen: false, nodeType: null } }),
  outputResultModal: { isOpen: false },
  openOutputModal: () => set({ outputResultModal: { isOpen: true } }),
  closeOutputModal: () => set({ outputResultModal: { isOpen: false } }),
  resetWorkflow: () => {
    // 깊은 복사로 초기 노드 및 엣지 복원 (참조 공유 방지)
    const clonedInitialNodes: Node[] = JSON.parse(JSON.stringify(initialNodes));
    const clonedInitialEdges: Edge[] = JSON.parse(JSON.stringify(initialEdges));
    set({
      nodes: clonedInitialNodes,
      edges: clonedInitialEdges,
      selectedNode: null,
      logs: [],
      messages: [],
      executionResult: '',
      isExecuting: false,
      nodeResults: {},
      selectedResultNodeId: null,
      activeNodeId: null,
    });
  },
  activeNodeId: null,
  setActiveNodeId: (nodeId) => set({ activeNodeId: nodeId }),
  addNode: (type, position) => {
    const currentNodes = get().nodes;

    // Input 노드는 단일 시작점이므로 캔버스에 이미 존재하면 포커스만 이동하고 중복 생성 방지
    if (type === 'inputNode') {
      const existingInput = currentNodes.find((n) => n.type === 'inputNode');
      if (existingInput) {
        set({
          nodes: currentNodes.map((n) => ({ ...n, selected: n.id === existingInput.id })),
          selectedNode: existingInput,
          selectedResultNodeId: existingInput.id,
        });
        return { success: false, node: existingInput, message: 'Input 노드는 이미 캔버스에 존재합니다. 해당 노드로 이동했습니다.' };
      }
    }

    // Output 노드 역시 단일 종착점이므로 중복 생성 방지
    if (type === 'outputNode') {
      const existingOutput = currentNodes.find((n) => n.type === 'outputNode');
      if (existingOutput) {
        set({
          nodes: currentNodes.map((n) => ({ ...n, selected: n.id === existingOutput.id })),
          selectedNode: existingOutput,
          selectedResultNodeId: existingOutput.id,
        });
        return { success: false, node: existingOutput, message: 'Output 노드는 이미 캔버스에 존재합니다. 해당 노드로 이동했습니다.' };
      }
    }

    const prefix = type.replace('Node', '');
    let maxSuffix = 0;
    currentNodes.forEach((node) => {
      if (node.id.startsWith(`${prefix}-`)) {
        const num = parseInt(node.id.replace(`${prefix}-`, ''), 10);
        if (!isNaN(num) && num > maxSuffix) {
          maxSuffix = num;
        }
      }
    });
    const newId = `${prefix}-${maxSuffix + 1}`;

    const labels: Record<string, string> = {
      inputNode: 'Input',
      plannerNode: 'Planner',
      routerNode: 'Router',
      llmNode: 'LLM',
      aggregatorNode: 'Aggregator',
      searchNode: '검색 Tool',
      weatherNode: '날씨 Tool',
      youtubeNode: 'YouTube Tool',
      outputNode: 'Output',
    };

    const defaultConfigs: Record<string, any> = {
      inputNode: { input_text: '' },
      plannerNode: {
        model: 'gemma2:2b',
        temperature: 0.7,
        system_prompt: '사용자 요청을 달성하기 위한 구체적인 세부 작업(Task) 계획을 수립하세요. 최종 결과 제시, 답변 작성, 요약 등의 작업은 후속 노드가 처리하므로 계획 목록에 포함하지 마세요.',
      },
      routerNode: {
        model: 'gemma2:2b',
        temperature: 0.7,
        max_loops: 5,
        system_prompt: '당신은 지능형 작업 분배 관리자입니다. 주어진 지침과 작업 내용을 바탕으로 가장 적절한 노드로 분기하세요.',
      },
      llmNode: {
        model: 'gemma2:2b',
        temperature: 0.7,
        system_prompt: DEFAULT_LLM_SYSTEM_PROMPT,
        react_loop: true,
        max_tool_iterations: 3,
        tool_instruction: '',
      },
      aggregatorNode: {
        model: 'gemma2:2b',
        temperature: 0.7,
        system_prompt: '각 단계에서 처리된 결과들을 종합하여 사용자 요청에 대한 명확하고 정리된 최종 답변을 작성하세요.',
      },
      searchNode: {},
      weatherNode: {},
      youtubeNode: {},
      outputNode: {},
    };

    const toolNodeTypes = ['searchNode', 'weatherNode', 'youtubeNode'];
    let calculatedPos = position;
    if (!calculatedPos) {
      if (toolNodeTypes.includes(type)) {
        const toolCount = currentNodes.filter((n) => toolNodeTypes.includes(n.type || '')).length;
        calculatedPos = { x: 380 + (toolCount * 170), y: -40 };
      } else if (type === 'plannerNode') {
        calculatedPos = { x: 260, y: 150 };
      } else if (type === 'routerNode') {
        calculatedPos = { x: 450, y: 150 };
      } else if (type === 'aggregatorNode') {
        calculatedPos = { x: 750, y: 150 };
      } else {
        const lastNode = currentNodes[currentNodes.length - 1];
        calculatedPos = lastNode
          ? { x: lastNode.position.x + 40, y: lastNode.position.y + 120 }
          : { x: 250, y: 150 };
      }
    }

    const newNode: Node = {
      id: newId,
      type,
      position: calculatedPos,
      data: {
        label: labels[type] || 'Node',
        config: defaultConfigs[type] || {},
      },
      selected: true,
    };

    // 기존 노드 선택 해제 및 신규 노드 추가
    const updatedNodes: Node[] = [...currentNodes.map((n) => ({ ...n, selected: false })), newNode];
    set({
      nodes: updatedNodes,
      selectedNode: newNode,
      selectedResultNodeId: newNode.id,
    });

    return { success: true, node: newNode, message: `${labels[type] || type} 노드가 캔버스에 추가되었습니다.` };
  },
}));
