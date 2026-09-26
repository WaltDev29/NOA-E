import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { useWorkflowStore } from '../../store/useWorkflowStore';

interface NodeWrapperProps {
  id: string;
  selected?: boolean;
  title: string;
  subtitle?: string;
  icon: string;
  badge?: string;
  colorType?: 'primary' | 'secondary' | 'tertiary' | 'error';
  nodeType: string;
  children?: React.ReactNode;
}

const colorMap = {
  primary: {
    bg: 'bg-primary-container/20',
    text: 'text-primary',
    glow: 'shadow-[0_0_14px_rgba(77,142,255,0.35)]',
    border: 'border-primary/40',
    selectedBorder: 'border-primary shadow-[0_0_20px_rgba(77,142,255,0.5)]',
  },
  secondary: {
    bg: 'bg-secondary-container/40',
    text: 'text-secondary',
    glow: 'shadow-[0_0_14px_rgba(208,188,255,0.35)]',
    border: 'border-secondary/40',
    selectedBorder: 'border-secondary shadow-[0_0_20px_rgba(208,188,255,0.5)]',
  },
  tertiary: {
    bg: 'bg-tertiary-container/30',
    text: 'text-tertiary',
    glow: 'shadow-[0_0_14px_rgba(76,215,246,0.35)]',
    border: 'border-tertiary/40',
    selectedBorder: 'border-tertiary shadow-[0_0_20px_rgba(76,215,246,0.5)]',
  },
  error: {
    bg: 'bg-error-container/40',
    text: 'text-error',
    glow: 'shadow-[0_0_14px_rgba(255,180,171,0.35)]',
    border: 'border-error/40',
    selectedBorder: 'border-error shadow-[0_0_20px_rgba(255,180,171,0.5)]',
  },
};

const NodeWrapper: React.FC<NodeWrapperProps> = ({
  id,
  selected,
  title,
  subtitle,
  icon,
  badge,
  colorType = 'primary',
  nodeType,
  children,
}) => {
  const openNodeModal = useWorkflowStore((state) => state.openNodeModal);
  const activeNodeId = useWorkflowStore((state) => state.activeNodeId);
  const isActive = activeNodeId === id;

  const style = colorMap[colorType];

  return (
    <div
      className={`group relative min-w-[190px] max-w-[240px] p-3 rounded-2xl backdrop-blur-xl bg-surface-container/90 border transition-all duration-200 shadow-[0_8px_24px_rgba(0,0,0,0.5)] ${
        isActive
          ? 'border-tertiary shadow-[0_0_25px_rgba(76,215,246,0.6)] scale-[1.03]'
          : selected
          ? style.selectedBorder
          : 'border-outline-variant/30 hover:border-outline-variant/70'
      }`}
    >
      {/* Help info button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          openNodeModal(nodeType);
        }}
        className="absolute top-2 right-2 p-1 text-outline opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary rounded-md hover:bg-surface-container-high"
        title="노드 가이드 보기"
        type="button"
      >
        <span className="material-symbols-outlined text-[16px]">help</span>
      </button>

      {/* Active Running Centered Spinner & Dim Overlay */}
      {isActive && (
        <div className="absolute inset-0 z-30 rounded-2xl bg-surface-container-lowest/75 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1.5 animate-in fade-in duration-200 pointer-events-none">
          <svg
            className="w-7 h-7 animate-spin text-tertiary drop-shadow-[0_0_10px_rgba(76,215,246,0.8)]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-20"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-[10px] font-mono font-bold text-tertiary tracking-wider animate-pulse">
            RUNNING
          </span>
        </div>
      )}

      {/* Node Header */}
      <div className="flex items-center gap-2.5 mb-2 pb-2 border-b border-outline-variant/20 pr-6">
        <div
          className={`w-9 h-9 rounded-xl ${style.bg} ${style.text} ${style.glow} flex items-center justify-center shrink-0`}
        >
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        <div className="flex flex-col min-w-0">
          {badge && <span className={`text-[10px] font-semibold ${style.text}`}>{badge}</span>}
          <h3 className="font-display text-xs font-bold text-on-surface truncate">{title}</h3>
          {subtitle && <span className="text-[10px] text-outline truncate">{subtitle}</span>}
        </div>
      </div>

      {/* Node Body */}
      <div className="text-xs text-on-surface-variant font-sans">{children}</div>
    </div>
  );
};

export const InputNode = memo(({ id, data, selected }: any) => {
  const updateNodeConfig = useWorkflowStore((state) => state.updateNodeConfig);

  return (
    <>
      <NodeWrapper
        id={id}
        selected={selected}
        title="사용자 입력"
        subtitle="시작 노드"
        badge="START"
        icon="login"
        colorType="tertiary"
        nodeType="inputNode"
      >
        <textarea
          className="nodrag nopan w-full mt-1 p-2 bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-xs text-on-surface placeholder:text-outline/60 resize-none focus:border-tertiary focus:outline-none transition-colors"
          placeholder="여기에 질문을 입력하세요..."
          rows={2}
          value={data.config?.input_text || ''}
          onChange={(e) => updateNodeConfig(id, { input_text: e.target.value })}
        />
      </NodeWrapper>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-tertiary"
      />
    </>
  );
});

export const LLMNode = memo(({ id, data, selected }: any) => {
  return (
    <>
      <Handle
        type="target"
        id="tools"
        position={Position.Top}
        className="!bg-secondary"
      />
      <Handle
        type="target"
        id="left"
        position={Position.Left}
        className="!bg-primary"
      />
      <NodeWrapper
        id={id}
        selected={selected}
        title="LLM"
        subtitle="대화형 지능"
        badge="GENERATIVE"
        icon="neurology"
        colorType="secondary"
        nodeType="llmNode"
      >
        <div className="flex flex-col gap-1 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-outline">모델:</span>
            <span className="font-mono font-medium text-secondary-fixed-dim">
              {data.config?.model || 'gemma2:2b'}
            </span>
          </div>
          <span className="text-[10px] text-outline mt-0.5">상단에 Tool 연결 가능</span>
        </div>
      </NodeWrapper>
      <Handle
        type="source"
        id="right"
        position={Position.Right}
        className="!bg-secondary"
      />
    </>
  );
});

export const AgentNode = memo(({ id, data, selected }: any) => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-primary"
      />
      <NodeWrapper
        id={id}
        selected={selected}
        title="Autonomous Agent"
        subtitle="자율 에이전트"
        badge="AGENT"
        icon="smart_toy"
        colorType="secondary"
        nodeType="agentNode"
      >
        <div className="flex flex-col gap-1 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-outline">모델:</span>
            <span className="font-mono font-medium text-secondary-fixed-dim">
              {data.config?.model || 'gemma2:2b'}
            </span>
          </div>
          <span className="text-[10px] text-outline mt-0.5">자율 의사결정 파이프라인</span>
        </div>
      </NodeWrapper>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-secondary"
      />
    </>
  );
});

export const SearchNode = memo(({ id, selected }: any) => {
  return (
    <>
      <NodeWrapper
        id={id}
        selected={selected}
        title="웹 검색"
        subtitle="실시간 검색 도구"
        badge="TOOL"
        icon="travel_explore"
        colorType="primary"
        nodeType="searchNode"
      >
        <span className="text-[11px] text-outline">최신 웹 정보 수집 및 요약</span>
      </NodeWrapper>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary"
      />
    </>
  );
});

export const CalculatorNode = memo(({ id, selected }: any) => {
  return (
    <>
      <NodeWrapper
        id={id}
        selected={selected}
        title="계산기 도구"
        subtitle="수학 연산 도구"
        badge="TOOL"
        icon="calculate"
        colorType="tertiary"
        nodeType="calculatorNode"
      >
        <span className="text-[11px] text-outline">정밀 수학 수식 계산 실행</span>
      </NodeWrapper>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-tertiary"
      />
    </>
  );
});

export const OutputNode = memo(({ id, selected }: any) => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-error"
      />
      <NodeWrapper
        id={id}
        selected={selected}
        title="결과 출력"
        subtitle="종료 노드"
        badge="EXIT"
        icon="output"
        colorType="error"
        nodeType="outputNode"
      >
        <span className="text-[11px] text-error font-medium">최종 결과 렌더링</span>
      </NodeWrapper>
    </>
  );
});
