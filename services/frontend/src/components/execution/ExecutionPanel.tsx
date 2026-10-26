import React, { useState, useCallback, useEffect } from 'react';
import { useWorkflowStore } from '../../store/useWorkflowStore';

interface ExecutionPanelProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { logs, isExecuting } = useWorkflowStore();

  const [panelHeight, setPanelHeight] = useState(180);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight > 80 && newHeight < window.innerHeight - 150) {
        setPanelHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  if (isCollapsed) {
    return (
      <div className="h-10 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant/30 flex items-center justify-between px-space-md z-20 shrink-0">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-primary text-[18px]">terminal</span>
          <span className="text-xs font-semibold text-on-surface">실행 콘솔 (접힘)</span>
        </div>
        <button
          onClick={onToggleCollapse}
          className="w-7 h-7 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
          title="펼치기"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">keyboard_arrow_up</span>
        </button>
      </div>
    );
  }

  return (
    <section
      className="shrink-0 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant/30 flex flex-col z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] relative"
      style={{ height: `${panelHeight}px` }}
    >
      {/* Resizer Handle */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 cursor-row-resize bg-transparent hover:bg-primary/40 z-30 transition-colors"
        onMouseDown={startResizing}
      />

      {/* Drawer Header with Tabs & Controls */}
      <div className="px-space-md py-1.5 bg-surface-container-low/50 flex items-center justify-between border-b border-outline-variant/20 shrink-0">
        <div className="flex items-center gap-space-sm">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-high text-primary font-display text-xs font-semibold shadow-sm">
            <span className="material-symbols-outlined text-[15px]">terminal</span>
            <span>실행 로그</span>
          </div>
          <span className="text-[11px] font-mono text-outline">
            STATUS: {isExecuting ? <span className="text-tertiary animate-pulse font-bold">RUNNING...</span> : 'IDLE'}
          </span>
        </div>

        <div className="flex items-center gap-space-xs">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="w-7 h-7 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer"
              title="접기"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
            </button>
          )}
        </div>
      </div>

      {/* Drawer Content Display */}
      <div className="flex-1 p-space-md flex flex-col relative overflow-y-auto font-mono text-xs leading-relaxed space-y-1 select-text bg-[#060e20]">
        {logs.length === 0 && !isExecuting && (
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-tertiary">[SYSTEM]</span>
            <span className="text-white">파이프라인 환경 구성 완료. 상단 '실행하기' 버튼을 누르면 에이전트 워크플로우가 시작됩니다.</span>
          </div>
        )}
        {logs.map((log, i) => (
          <div key={i} className="flex items-start gap-2 text-slate-300">
            <span className="text-tertiary shrink-0">➜</span>
            <span className="text-white font-mono">{log}</span>
          </div>
        ))}
        {isExecuting && (
          <div className="flex items-center gap-2 text-tertiary animate-pulse mt-1">
            <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
            <span className="text-white">노드 파이프라인 처리 중...</span>
          </div>
        )}
      </div>
    </section>
  );
};
