import { Handle, Position } from '@xyflow/react';
import { Bot, LogIn, Flag, HelpCircle, Loader2, BrainCircuit, Search, Calculator } from 'lucide-react';
import clsx from 'clsx';
import { memo } from 'react';
import { useWorkflowStore } from '../../store/useWorkflowStore';

const NodeWrapper = ({ children, selected, title, icon: Icon, className, nodeType, id }: any) => {
  const openNodeModal = useWorkflowStore(state => state.openNodeModal);
  const activeNodeId = useWorkflowStore(state => state.activeNodeId);
  const isActive = activeNodeId === id;
  
  return (
    <div className={clsx(
      "group relative min-w-[200px] p-4 rounded-xl border-2 backdrop-blur-md bg-card/80 transition-all duration-200",
      isActive ? "border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02]" : 
      selected ? "border-primary shadow-lg shadow-primary/20 scale-[1.02]" : "border-border shadow-md",
      className
    )}>
      <button 
        onClick={(e) => { e.stopPropagation(); openNodeModal(nodeType); }}
        className="absolute top-2 right-2 p-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary rounded-md hover:bg-muted"
        title="Node Info"
      >
        <HelpCircle size={16} />
      </button>
      
      {isActive && (
        <div className="absolute top-2 right-8 p-1 text-blue-500 animate-spin">
          <Loader2 size={16} />
        </div>
      )}

      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50 pr-6">
        <div className="p-1.5 rounded-md bg-primary/10 text-primary">
          <Icon size={18} />
        </div>
        <h3 className="font-semibold text-sm tracking-wide">{title}</h3>
      </div>
      <div className="text-xs text-muted-foreground">
        {children}
      </div>
    </div>
  );
};

export const InputNode = memo(({ id, data, selected }: any) => {
  const updateNodeConfig = useWorkflowStore(state => state.updateNodeConfig);

  return (
    <>
      <NodeWrapper id={id} selected={selected} title="Input" icon={LogIn} nodeType="inputNode">
        <textarea
          className="nodrag nopan w-full mt-2 p-2 bg-background border rounded-md text-xs resize-none focus:ring-1 focus:ring-primary outline-none"
          placeholder="여기에 질문을 입력하세요..."
          rows={3}
          value={data.config?.input_text || ''}
          onChange={(e) => updateNodeConfig(id, { input_text: e.target.value })}
        />
      </NodeWrapper>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-primary border-2 border-background" />
    </>
  );
});

export const LLMNode = memo(({ id, data, selected }: any) => {
  return (
    <>
      <Handle type="target" id="tools" position={Position.Top} className="w-3 h-3 bg-purple-500 border-2 border-background" />
      <Handle type="target" id="left" position={Position.Left} className="w-3 h-3 bg-primary border-2 border-background" />
      <NodeWrapper id={id} selected={selected} title="LLM Agent" icon={Bot} nodeType="llmNode">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <span>Model:</span>
            <span className="font-medium text-foreground">{data.config?.model || 'gemma2:2b'}</span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1">Can use tools</span>
        </div>
      </NodeWrapper>
      <Handle type="source" id="right" position={Position.Right} className="w-3 h-3 bg-primary border-2 border-background" />
    </>
  );
});

export const AgentNode = memo(({ id, data, selected }: any) => {
  return (
    <>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-primary border-2 border-background" />
      <NodeWrapper id={id} selected={selected} title="Autonomous Agent" icon={BrainCircuit} nodeType="agentNode">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <span>Model:</span>
            <span className="font-medium text-foreground">{data.config?.model || 'gemma2:2b'}</span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-1">Can use tools</span>
        </div>
      </NodeWrapper>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-primary border-2 border-background" />
    </>
  );
});

export const SearchNode = memo(({ id, data, selected }: any) => {
  return (
    <>
      <NodeWrapper id={id} selected={selected} title="Search Tool" icon={Search} nodeType="searchNode" className="min-w-[150px]">
        <span className="text-[10px] text-muted-foreground">Web Search Engine</span>
      </NodeWrapper>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-purple-500 border-2 border-background" />
    </>
  );
});

export const CalculatorNode = memo(({ id, data, selected }: any) => {
  return (
    <>
      <NodeWrapper id={id} selected={selected} title="Calculator Tool" icon={Calculator} nodeType="calculatorNode" className="min-w-[150px]">
        <span className="text-[10px] text-muted-foreground">Math Expression Solver</span>
      </NodeWrapper>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-purple-500 border-2 border-background" />
    </>
  );
});

export const OutputNode = memo(({ id, data, selected }: any) => {
  const executionResult = useWorkflowStore(state => state.executionResult);
  const openOutputModal = useWorkflowStore(state => state.openOutputModal);

  return (
    <>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-primary border-2 border-background" />
      <NodeWrapper id={id} selected={selected} title="Output" icon={Flag} nodeType="outputNode" className="w-[300px]">
        <div 
          className="mt-2 p-3 bg-background border rounded-md text-xs text-foreground cursor-pointer hover:border-primary/50 transition-colors"
          onClick={openOutputModal}
        >
          {executionResult ? (
            <div className="line-clamp-6 leading-relaxed whitespace-pre-wrap">
              {executionResult}
            </div>
          ) : (
            <span className="text-muted-foreground italic">실행 결과가 여기에 표시됩니다.</span>
          )}
        </div>
      </NodeWrapper>
    </>
  );
});
