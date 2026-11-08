import React, { memo, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react';
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
        className="absolute top-2 right-2 p-1 text-outline opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary rounded-md hover:bg-surface-container-high cursor-pointer"
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
          {badge && <span className={`text-[10px] font-semibold tracking-wider ${style.text}`}>{badge}</span>}
          <h3 className="font-display text-xs font-bold text-on-surface truncate">{title}</h3>
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
        title={data?.label || "Input"}
        badge="Input"
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
  const reactLoop = data.config?.react_loop ?? true;
  const maxToolIterations = data.config?.max_tool_iterations || 3;
  const modelName = data.config?.model || 'gemma2:2b';
  const modelCapabilities = useWorkflowStore((state) => state.modelCapabilities);
  const updateNodeInternals = useUpdateNodeInternals();

  // .env.backend의 MODELS_CONFIG에서 tool: true인 모델만 상단 Tool 연결 포트 활성화
  // 초기 마운트 시점(modelCapabilities 로드 전)에도 도구 연결 엣지가 누락되지 않도록 기본값 보완
  const supportsTool =
    Object.keys(modelCapabilities).length === 0
      ? modelName !== 'gemma2:2b'
      : Boolean(modelCapabilities[modelName]?.tool);

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, supportsTool, updateNodeInternals]);

  return (
    <>
      {supportsTool && (
        <Handle
          type="target"
          id="tools"
          position={Position.Top}
          className="!bg-secondary !w-3 !h-3"
          title="도구(Tool) 연결 포트"
        />
      )}
      <Handle
        type="target"
        id="left"
        position={Position.Left}
        className="!bg-primary"
      />
      <NodeWrapper
        id={id}
        selected={selected}
        title={data?.label || "LLM"}
        badge="Worker"
        icon="neurology"
        colorType="secondary"
        nodeType="llmNode"
      >
        <div className="flex flex-col gap-1 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-outline">모델:</span>
            <span className="font-mono font-medium text-secondary-fixed-dim">
              {modelName}
            </span>
          </div>
          {supportsTool ? (
            reactLoop ? (
              <div className="flex items-center gap-1 mt-1 text-[10px] text-tertiary bg-tertiary/10 px-1.5 py-0.5 rounded">
                <span className="material-symbols-outlined text-[12px]">sync</span>
                <span>ReAct 루프 활성 (최대 {maxToolIterations}회)</span>
              </div>
            ) : (
              <span className="text-[10px] text-outline mt-0.5">Tool 연결 시 1회만 사용 (반복 없음)</span>
            )
          ) : (
            <span className="text-[10px] text-outline/70 mt-0.5">도구(Tool) 미지원 모델</span>
          )}
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

export const PlannerNode = memo(({ id, data, selected }: any) => {
  return (
    <>
      <Handle
        type="target"
        id="left"
        position={Position.Left}
        className="!bg-primary"
      />
      <NodeWrapper
        id={id}
        selected={selected}
        title={data?.label || "Planner"}
        badge="Plan"
        icon="assignment"
        colorType="primary"
        nodeType="plannerNode"
      >
        <div className="flex flex-col gap-1 text-[11px]">
          <span className="text-outline">사용자 질문 분석 & 작업 계획 수립</span>
          <span className="text-[10px] text-primary font-medium mt-0.5">다단계 Task 목록 생성</span>
        </div>
      </NodeWrapper>
      <Handle
        type="source"
        id="right"
        position={Position.Right}
        className="!bg-primary"
      />
    </>
  );
});

export const RouterNode = memo(({ id, data, selected }: any) => {
  const maxLoops = data.config?.max_loops || 5;

  return (
    <>
      <Handle
        type="target"
        id="left"
        position={Position.Left}
        className="!bg-primary"
        title="기본 입력"
      />
      {/* 하단 루프 연결 포트: Worker 노드와 양방향 드래그 연결 지원 */}
      <Handle
        type="target"
        id="loop-return"
        position={Position.Bottom}
        className="!bg-secondary !w-3.5 !h-3.5 shadow-[0_0_8px_rgba(208,188,255,0.8)] cursor-pointer hover:scale-125 transition-transform"
        title="🔄 Worker 작업 루프 연결 포트 (Worker 노드로 드래그하여 루프 연결)"
      />
      <Handle
        type="source"
        id="loop-return"
        position={Position.Bottom}
        className="!bg-transparent !w-3.5 !h-3.5 pointer-events-auto cursor-pointer"
        title="🔄 Worker 작업 루프 연결 포트 (Worker 노드로 드래그하여 루프 연결)"
      />
      <NodeWrapper
        id={id}
        selected={selected}
        title={data?.label || "Router"}
        badge="Route"
        icon="alt_route"
        colorType="secondary"
        nodeType="routerNode"
      >
        <div className="flex flex-col gap-1 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-outline">최대 루프:</span>
            <span className="font-mono font-bold text-secondary">{maxLoops}회</span>
          </div>
          <span className="text-[10px] text-secondary-fixed-dim mt-0.5">시스템 지침 기반 작업 분기 / 제어 루프</span>
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

export const AggregatorNode = memo(({ id, data, selected }: any) => {
  return (
    <>
      <Handle
        type="target"
        id="left"
        position={Position.Left}
        className="!bg-primary"
      />
      <NodeWrapper
        id={id}
        selected={selected}
        title={data?.label || "Aggregator"}
        badge="Aggregate"
        icon="auto_awesome"
        colorType="tertiary"
        nodeType="aggregatorNode"
      >
        <div className="flex flex-col gap-1 text-[11px]">
          <span className="text-outline">중간 작업 결과 종합 & 보고서 생성</span>
          <span className="text-[10px] text-tertiary font-medium mt-0.5">최종 단일 답변으로 합성</span>
        </div>
      </NodeWrapper>
      <Handle
        type="source"
        id="right"
        position={Position.Right}
        className="!bg-tertiary"
      />
    </>
  );
});

export const SearchNode = memo(({ id, data, selected }: any) => {
  return (
    <>
      <NodeWrapper
        id={id}
        selected={selected}
        title={data?.label || "검색 Tool"}
        badge="Search"
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

export const WeatherNode = memo(({ id, data, selected }: any) => {
  return (
    <>
      <NodeWrapper
        id={id}
        selected={selected}
        title={data?.label || "날씨 Tool"}
        badge="Weather"
        icon="partly_cloudy_day"
        colorType="tertiary"
        nodeType="weatherNode"
      >
        <span className="text-[11px] text-outline">현재 날씨 및 일별 예보 조회</span>
      </NodeWrapper>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-tertiary"
      />
    </>
  );
});

export const YoutubeNode = memo(({ id, data, selected }: any) => {
  return (
    <>
      <NodeWrapper
        id={id}
        selected={selected}
        title={data?.label || "YouTube Tool"}
        badge="YouTube"
        icon="smart_display"
        colorType="secondary"
        nodeType="youtubeNode"
      >
        <span className="text-[11px] text-outline">YouTube 영상 및 채널 검색</span>
      </NodeWrapper>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-secondary"
      />
    </>
  );
});

export const OutputNode = memo(({ id, data, selected }: any) => {
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
        title={data?.label || "Output"}
        badge="Output"
        icon="output"
        colorType="error"
        nodeType="outputNode"
      >
        <span className="text-[11px] text-error font-medium">최종 결과 렌더링</span>
      </NodeWrapper>
    </>
  );
});
