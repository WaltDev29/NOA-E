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

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  logs: string[];
  messages: any[]; // 대화 이력을 저장하기 위한 상태
  executionResult: string;
  isExecuting: boolean;
  onNodesChange: OnNodesChange<Node>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNode: (node: Node | null) => void;
  updateNodeConfig: (nodeId: string, config: any) => void;
  addLog: (log: string) => void;
  setMessages: (messages: any[]) => void;
  setExecutionResult: (result: string) => void;
  setIsExecuting: (isExecuting: boolean) => void;
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
  { id: 'llm-1', type: 'llmNode', position: { x: 400, y: 100 }, data: { label: 'LLM Agent', config: { model: 'gemma2:2b', system_prompt: 'You are a helpful assistant.' } } },
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
  onNodesChange: (changes: NodeChange<Node>[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
    
    // Update selected node if it changed
    const selected = get().nodes.find(n => n.selected);
    set({ selectedNode: selected || null });
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
    selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode
  })),
  setSelectedNode: (node) => set({ selectedNode: node }),
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
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  setMessages: (messages) => set({ messages }),
  setExecutionResult: (result) => set({ executionResult: result }),
  setIsExecuting: (isExecuting) => set({ isExecuting }),
  clearLogs: () => set({ logs: [], executionResult: '' }),
  clearMessages: () => set({ messages: [], logs: [], executionResult: '' }),
  nodeInfoModal: { isOpen: false, nodeType: null },
  openNodeModal: (nodeType) => set({ nodeInfoModal: { isOpen: true, nodeType } }),
  closeNodeModal: () => set({ nodeInfoModal: { isOpen: false, nodeType: null } }),
  outputResultModal: { isOpen: false },
  openOutputModal: () => set({ outputResultModal: { isOpen: true } }),
  closeOutputModal: () => set({ outputResultModal: { isOpen: false } }),
  activeNodeId: null,
  setActiveNodeId: (nodeId) => set({ activeNodeId: nodeId }),
}));
