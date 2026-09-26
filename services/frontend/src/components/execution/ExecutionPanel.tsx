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
  const {
    logs,
    isExecuting,
    setIsExecuting,
    clearLogs,
    clearMessages,
    addLog,
    setExecutionResult,
    setMessages,
    setActiveNodeId,
  } = useWorkflowStore();

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

  const handleRun = async () => {
    const { nodes, edges, messages } = useWorkflowStore.getState();

    // --- Frontend Validation ---
    const inputNodes = nodes.filter((n) => n.type === 'inputNode');
    const outputNodes = nodes.filter((n) => n.type === 'outputNode');

    if (inputNodes.length === 0 || outputNodes.length === 0) {
      addLog('Validation Error: Missing Input or Output node.');
      alert('경고: 워크플로우에는 반드시 최소 1개의 Input 노드와 Output 노드가 있어야 합니다.');
      return;
    }

    if (outputNodes.length > 1) {
      addLog('Validation Error: Multiple Output nodes detected.');
      alert('경고: Output 노드는 반드시 하나만 있어야 합니다.');
      return;
    }

    // 1. 모든 Input 노드는 밖으로 나가는 선(outgoing edge)이 있어야 함
    for (const input of inputNodes) {
      const hasOutgoing = edges.some((e) => e.source === input.id);
      if (!hasOutgoing) {
        addLog(`Validation Error: Input Node (${input.id}) is disconnected.`);
        alert('경고: 목적지가 연결되지 않은 Input 노드가 있습니다. 밖으로 나가는 선을 연결해주세요.');
        return;
      }
    }

    // 2. 모든 Output 노드는 들어오는 선(incoming edge)이 있어야 함
    for (const output of outputNodes) {
      const hasIncoming = edges.some((e) => e.target === output.id);
      if (!hasIncoming) {
        addLog(`Validation Error: Output Node (${output.id}) is disconnected.`);
        alert('경고: 아무것도 연결되지 않은 Output 노드가 있습니다. 결과를 받을 수 있게 선을 연결해주세요.');
        return;
      }
    }

    const llmNodes = nodes.filter((n) => n.type === 'llmNode' || n.type === 'agentNode');
    for (const llm of llmNodes) {
      const hasIncoming = edges.some((e) => e.target === llm.id);
      const hasOutgoing = edges.some((e) => e.source === llm.id);

      if (!hasIncoming || !hasOutgoing) {
        addLog(`Validation Error: LLM Node (${llm.id}) must have both incoming and outgoing connections.`);
        alert('경고: LLM 노드는 질문을 받을 입력선과 결과를 내보낼 출력선이 모두 연결되어 있어야 합니다.');
        return;
      }
    }
    // ---------------------------

    setIsExecuting(true);
    clearLogs();
    setActiveNodeId(inputNodes[0].id);

    addLog('파이프라인 실행 시작...');

    try {
      const response = await fetch('/api/workflow/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges, messages }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      if (!response.body) throw new Error('ReadableStream not supported in this browser.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6);
            if (dataStr.trim() === '[DONE]') {
              setIsExecuting(false);
              setActiveNodeId(null);
              addLog('파이프라인 실행 완료.');
              return;
            }

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                addLog(`에러 발생: ${parsed.error}`);
              } else {
                const nodeName = Object.keys(parsed)[0];
                const stateUpdates = parsed[nodeName];

                addLog(`[${nodeName}] 노드 처리 완료`);

                if (stateUpdates.logs && Array.isArray(stateUpdates.logs)) {
                  addLog(`  -> ${stateUpdates.logs[stateUpdates.logs.length - 1]}`);
                }

                if (stateUpdates.current_output) {
                  const nodeType = nodes.find((n) => n.id === nodeName)?.type;
                  if (nodeType === 'outputNode') {
                    setExecutionResult(stateUpdates.current_output);
                  }
                }

                if (stateUpdates.messages) {
                  setMessages([...useWorkflowStore.getState().messages, ...stateUpdates.messages]);
                }

                // Next active node
                const nextEdge = edges.find((e) => e.source === nodeName);
                if (nextEdge) {
                  setActiveNodeId(nextEdge.target);
                } else {
                  setActiveNodeId(null);
                }
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e, dataStr);
            }
          }
        }
      }
    } catch (error: any) {
      addLog(`요청 실패: ${error.message}`);
      setActiveNodeId(null);
    } finally {
      setIsExecuting(false);
      setActiveNodeId(null);
    }
  };

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
          <button
            onClick={() => {
              clearMessages();
              clearLogs();
              addLog('메모리 및 로그 초기화 완료.');
            }}
            disabled={isExecuting}
            className="px-2.5 py-1 rounded-lg bg-surface-container-high/80 hover:bg-surface-bright text-outline hover:text-on-surface text-[11px] font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
            type="button"
            title="로그 및 세션 초기화"
          >
            <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
            <span>초기화</span>
          </button>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="w-7 h-7 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
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
          <div className="flex items-center gap-2 text-outline">
            <span className="text-tertiary">[SYSTEM]</span>
            <span>파이프라인 환경 구성 완료. 상단 '실행하기' 버튼을 누르면 에이전트 워크플로우가 시작됩니다.</span>
          </div>
        )}
        {logs.map((log, i) => (
          <div key={i} className="flex items-start gap-2 text-on-surface-variant">
            <span className="text-tertiary shrink-0">➜</span>
            <span className="text-on-surface">{log}</span>
          </div>
        ))}
        {isExecuting && (
          <div className="flex items-center gap-2 text-tertiary animate-pulse mt-1">
            <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
            <span>노드 파이프라인 처리 중...</span>
          </div>
        )}
      </div>
    </section>
  );
};
