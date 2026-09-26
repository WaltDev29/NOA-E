import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { WorkflowEditor } from '../components/editor/WorkflowEditor';
import { NodePalette } from '../components/panel/NodePalette';
import { PropertyPanel } from '../components/panel/PropertyPanel';
import { NodeResultPanel } from '../components/panel/NodeResultPanel';
import { ExecutionPanel } from '../components/execution/ExecutionPanel';
import { NodeInfoModal } from '../components/editor/NodeInfoModal';
import { OutputResultModal } from '../components/editor/OutputResultModal';
import { useWorkflowStore } from '../store/useWorkflowStore';

export const StudioPage: React.FC = () => {
  const [agentName, setAgentName] = useState('새로운 에이전트 만들기');
  const [isEditingName, setIsEditingName] = useState(false);
  const [showPalette, setShowPalette] = useState(true);
  const [isLogCollapsed, setIsLogCollapsed] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'properties' | 'results'>('properties');
  const [savedNotice, setSavedNotice] = useState(false);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);

  const selectedNode = useWorkflowStore((state) => state.selectedNode);
  const isExecuting = useWorkflowStore((state) => state.isExecuting);
  const nodeResults = useWorkflowStore((state) => state.nodeResults);
  const clearMessages = useWorkflowStore((state) => state.clearMessages);
  const clearLogs = useWorkflowStore((state) => state.clearLogs);
  const clearNodeResults = useWorkflowStore((state) => state.clearNodeResults);
  const addLog = useWorkflowStore((state) => state.addLog);
  const [resetNotice, setResetNotice] = useState(false);

  const canShowResultsTab =
    selectedNode && selectedNode.type !== 'inputNode' && selectedNode.type !== 'outputNode';

  useEffect(() => {
    if (!canShowResultsTab && activeRightTab === 'results') {
      setActiveRightTab('properties');
    }
  }, [canShowResultsTab, activeRightTab]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      const minWidth = 280;
      const maxWidth = Math.max(minWidth, Math.min(800, window.innerWidth - 320));
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setRightSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleResetMemory = () => {
    clearMessages();
    clearLogs();
    clearNodeResults();
    addLog('에이전트 메모리 및 대화 세션이 초기화되었습니다.');
    setResetNotice(true);
    setTimeout(() => setResetNotice(false), 2000);
  };

  const triggerRun = () => {
    const runBtn = document.getElementById('studio-hidden-run-btn');
    if (runBtn) {
      runBtn.click();
    }
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased w-screen h-screen flex flex-col overflow-hidden">
      {/* Top Global Header */}
      <Header />

      {/* Main Workspace Area (under fixed header) */}
      <main className="w-full pt-16 bg-background flex-1 flex flex-col overflow-hidden">
        <div className="w-full flex flex-col h-[calc(100vh-4rem)] max-w-full overflow-hidden bg-background">
          {/* Top Action Toolbar */}
          <section className="w-full px-margin py-space-sm bg-surface-container-lowest/90 backdrop-blur-md flex items-center justify-between shadow-sm z-20 shrink-0 border-b border-outline-variant/30">
            <div className="flex items-center gap-space-sm">
              <div className="flex items-center gap-space-xs group cursor-pointer">
                {isEditingName ? (
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                    autoFocus
                    className="bg-surface-container border border-primary px-2 py-0.5 rounded font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight focus:outline-none"
                  />
                ) : (
                  <div
                    onClick={() => setIsEditingName(true)}
                    className="flex items-center gap-space-xs"
                  >
                    <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                      {agentName}
                    </h1>
                    <span className="material-symbols-outlined text-outline group-hover:text-primary text-[18px] transition-colors">
                      edit
                    </span>
                  </div>
                )}
              </div>

              {/* Icon-only Save Button next to Agent Title */}
              <button
                onClick={handleSave}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  savedNotice
                    ? 'bg-tertiary-container/30 text-tertiary shadow-[0_0_10px_rgba(76,215,246,0.3)]'
                    : 'bg-transparent hover:bg-surface-container-high text-outline hover:text-primary active:scale-95'
                }`}
                title={savedNotice ? '저장됨' : '에이전트 저장하기'}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {savedNotice ? 'check' : 'save'}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-space-sm">
              {/* 에이전트 메모리 초기화 버튼 (붉은색) */}
              <button
                onClick={handleResetMemory}
                disabled={isExecuting}
                className={`px-3.5 py-space-xs h-9 rounded-lg border font-body-sm text-body-sm font-semibold flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  resetNotice
                    ? 'bg-[#ba1a1a] text-white border-[#ff5449] shadow-[0_0_16px_rgba(255,84,73,0.5)]'
                    : 'bg-[#ba1a1a]/15 hover:bg-[#ba1a1a]/30 text-[#ffb4ab] hover:text-white border-[#ff5449]/40 hover:border-[#ff5449]/80 shadow-[0_0_12px_rgba(255,84,73,0.15)]'
                }`}
                title="에이전트 대화 기억 및 실행 메모리 초기화"
                type="button"
              >
                <span className="material-symbols-outlined text-[17px] text-[#ff897d]">
                  {resetNotice ? 'check' : 'restart_alt'}
                </span>
                <span>{resetNotice ? '초기화됨' : '메모리 초기화'}</span>
              </button>

              {/* 실행하기 버튼 */}
              <button
                onClick={triggerRun}
                disabled={isExecuting}
                className="px-space-lg py-space-xs h-9 rounded-lg bg-gradient-to-r from-inverse-primary via-primary-container to-secondary-container hover:brightness-110 text-on-surface font-body-sm text-body-sm font-semibold flex items-center gap-space-xs shadow-[0_0_20px_rgba(77,142,255,0.4)] transition-all transform active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                id="run-pipeline-btn"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface">
                  {isExecuting ? 'progress_activity' : 'play_arrow'}
                </span>
                <span>{isExecuting ? '실행 중...' : '실행하기'}</span>
              </button>
            </div>
          </section>

          {/* Workspace: Sidebar + Canvas + Right Aside */}
          <div className="flex-1 flex flex-row overflow-hidden relative">
            {/* Left Node Library Palette */}
            {showPalette && <NodePalette onClose={() => setShowPalette(false)} />}

            {/* Center Flow Editor Canvas Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-background">
              {/* Floating Node Palette Toggle Button at Top-Left */}
              {!showPalette && (
                <button
                  onClick={() => setShowPalette(true)}
                  className="absolute top-4 left-4 z-20 px-3.5 py-2 rounded-xl bg-surface-container-lowest/90 hover:bg-surface-container border border-outline-variant/40 text-on-surface text-xs font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.4)] backdrop-blur-md flex items-center gap-2 hover:border-primary/50 transition-all active:scale-95 group"
                  title="노드 목록 열기"
                  type="button"
                >
                  <span className="material-symbols-outlined text-primary text-[18px] group-hover:scale-110 transition-transform">
                    account_tree
                  </span>
                  <span>노드 목록</span>
                </button>
              )}

              <WorkflowEditor />

              {/* Bottom Execution Shelf */}
              <ExecutionPanel
                isCollapsed={isLogCollapsed}
                onToggleCollapse={() => setIsLogCollapsed(!isLogCollapsed)}
              />
            </div>

            {/* Right Aside: Property Panel or Execution Results */}
            <aside
              style={{ width: `${rightSidebarWidth}px` }}
              className="shrink-0 bg-surface-container-lowest/95 backdrop-blur-xl border-l border-outline-variant/30 flex flex-col z-20 shadow-xl overflow-hidden relative"
            >
              {/* Drag Resize Handle */}
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsResizing(true);
                }}
                className={`absolute left-0 top-0 bottom-0 w-2 -ml-1 cursor-col-resize z-30 group flex items-center justify-center transition-colors ${
                  isResizing ? 'bg-primary/40' : 'hover:bg-primary/30'
                }`}
                title="드래그하여 너비 조절"
              >
                <div
                  className={`w-[2px] h-10 rounded-full transition-colors ${
                    isResizing ? 'bg-primary' : 'bg-outline-variant/40 group-hover:bg-primary'
                  }`}
                />
              </div>

              {/* Right Panel Tab Switcher */}
              <div className="p-space-md flex items-center justify-between border-b border-outline-variant/20 shrink-0">
                <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
                  <button
                    onClick={() => setActiveRightTab('properties')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      activeRightTab === 'properties'
                        ? 'bg-surface-container-high text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    type="button"
                  >
                    노드 속성
                  </button>
                  {canShowResultsTab && (
                    <button
                      onClick={() => setActiveRightTab('results')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        activeRightTab === 'results'
                          ? 'bg-surface-container-high text-primary shadow-sm'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                      type="button"
                    >
                      <span>실행 결과</span>
                      {selectedNode && nodeResults[selectedNode.id] && (
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* View 1: Properties */}
              {activeRightTab === 'properties' && <PropertyPanel />}

              {/* View 2: Node Execution Results */}
              {activeRightTab === 'results' && canShowResultsTab && <NodeResultPanel />}
            </aside>
          </div>
        </div>
      </main>

      {/* Hidden button to bridge Toolbar run trigger */}
      <div className="hidden">
        <HiddenRunTrigger />
      </div>

      {/* Modals */}
      <NodeInfoModal />
      <OutputResultModal />
    </div>
  );
};

const HiddenRunTrigger: React.FC = () => {
  const {
    isExecuting,
    setIsExecuting,
    clearLogs,
    addLog,
    setActiveNodeId,
    setExecutionResult,
    setMessages,
    appendNodeStep,
  } = useWorkflowStore();

  const handleRun = async () => {
    const { nodes, edges, messages } = useWorkflowStore.getState();

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

    for (const input of inputNodes) {
      const hasOutgoing = edges.some((e) => e.source === input.id);
      if (!hasOutgoing) {
        addLog(`Validation Error: Input Node (${input.id}) is disconnected.`);
        alert('경고: 목적지가 연결되지 않은 Input 노드가 있습니다. 밖으로 나가는 선을 연결해주세요.');
        return;
      }
    }

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

    setIsExecuting(true);
    clearLogs();
    setActiveNodeId(inputNodes[0].id);
    addLog('파이프라인 실행 시작...');

    let previousOutput = inputNodes[0]?.data?.config?.input_text || '';

    try {
      const response = await fetch('/api/workflow/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges, messages }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      if (!response.body) throw new Error('ReadableStream not supported.');

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

                const targetNode = nodes.find((n) => n.id === nodeName);
                const nodeInput =
                  targetNode?.type === 'inputNode'
                    ? targetNode.data?.config?.input_text || stateUpdates.input_text || ''
                    : previousOutput;
                const nodeOutput = stateUpdates.current_output || '';

                appendNodeStep(
                  nodeName,
                  {
                    input: nodeInput,
                    output: nodeOutput,
                    logs: stateUpdates.logs,
                  },
                  {
                    nodeType: targetNode?.type,
                    nodeLabel: targetNode?.data?.label,
                    status: 'completed',
                  }
                );

                previousOutput = nodeOutput || previousOutput;

                if (stateUpdates.logs && Array.isArray(stateUpdates.logs)) {
                  addLog(`  -> ${stateUpdates.logs[stateUpdates.logs.length - 1]}`);
                }

                if (stateUpdates.current_output) {
                  const nodeType = targetNode?.type;
                  if (nodeType === 'outputNode') {
                    setExecutionResult(stateUpdates.current_output);
                  }
                }

                if (stateUpdates.messages) {
                  setMessages([...useWorkflowStore.getState().messages, ...stateUpdates.messages]);
                }

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

  return <button id="studio-hidden-run-btn" onClick={handleRun} disabled={isExecuting} />;
};
