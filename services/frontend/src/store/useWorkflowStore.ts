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
  nodeInfoModal: { isOpen: boolean; nodeType: string | null };
  openNodeModal: (nodeType: string) => void;
  closeNodeModal: () => void;
  outputResultModal: { isOpen: boolean };
  openOutputModal: () => void;
  closeOutputModal: () => void;
  activeNodeId: string | null;
  setActiveNodeId: (nodeId: string | null) => void;
}

const initialNodes: Node[] = [
  { id: 'input-1', type: 'inputNode', position: { x: 100, y: 100 }, data: { label: 'Input', config: {} } },
  { id: 'llm-1', type: 'llmNode', position: { x: 400, y: 100 }, data: { label: 'LLM', config: { model: 'gemma2:2b', system_prompt: 'You are a helpful assistant.' } } },
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
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
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
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          const updatedNode = { ...node, data: { ...node.data, config: { ...node.data.config, ...config } } };
          // If the updated node is also the selected node, update selectedNode state
          if (get().selectedNode?.id === nodeId) {
            set({ selectedNode: updatedNode });
          }
          return updatedNode;
        }
        return node;
      }),
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
        // 기존 브라우저 로컬 스토리지에 남아있던 레거시 라벨 자동 마이그레이션
        const migratedNodes = parsed.nodes.map((node: any) => {
          let label = node.data?.label;
          if (label === 'LLM Agent') label = 'LLM';
          if (label === '사용자 입력') label = 'Input';
          if (label === '결과 출력') label = 'Output';
          return {
            ...node,
            data: {
              ...node.data,
              label: label || (node.type === 'inputNode' ? 'Input' : node.type === 'outputNode' ? 'Output' : node.type === 'llmNode' ? 'LLM' : node.id),
            },
          };
        });

        set({
          nodes: migratedNodes,
          edges: parsed.edges,
          selectedNode: null,
          selectedResultNodeId: null,
        });
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
  activeNodeId: null,
  setActiveNodeId: (nodeId) => set({ activeNodeId: nodeId }),
}));
