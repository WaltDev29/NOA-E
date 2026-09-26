import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { WorkflowEditor } from '../components/editor/WorkflowEditor';
import { NodePalette } from '../components/panel/NodePalette';
import { PropertyPanel } from '../components/panel/PropertyPanel';
import { ExecutionPanel } from '../components/execution/ExecutionPanel';
import { NodeInfoModal } from '../components/editor/NodeInfoModal';
import { OutputResultModal } from '../components/editor/OutputResultModal';
import { useWorkflowStore } from '../store/useWorkflowStore';
import ReactMarkdown from 'react-markdown';

export const StudioPage: React.FC = () => {
  const [agentName, setAgentName] = useState('새로운 에이전트 만들기');
  const [isEditingName, setIsEditingName] = useState(false);
  const [showPalette, setShowPalette] = useState(true);
  const [isLogCollapsed, setIsLogCollapsed] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'properties' | 'results'>('properties');
  const [outputFormat, setOutputFormat] = useState<'text' | 'json' | 'markdown'>('markdown');
  const [copied, setCopied] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const { isExecuting, executionResult, selectedNode, logs } = useWorkflowStore();

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleCopy = () => {
    if (!executionResult) return;
    navigator.clipboard.writeText(executionResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <div className="flex items-center gap-space-md">
              <button
                onClick={() => setShowPalette(!showPalette)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  showPalette
                    ? 'bg-primary-container/20 text-primary border border-primary/30'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
                title="노드 라이브러리 토글"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">account_tree</span>
              </button>

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
              <span className="hidden sm:inline-block text-outline-variant font-body-sm text-body-sm">|</span>
              <p className="hidden sm:inline-block font-body-sm text-body-sm text-on-surface-variant">
                노드를 연결하여 나만의 AI Agent를 설계해보세요.
              </p>
            </div>

            <div className="flex items-center gap-space-sm">
              <button
                onClick={handleSave}
                className="px-space-md py-space-xs h-9 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-body-sm text-body-sm flex items-center gap-space-xs transition-colors shadow-sm"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {savedNotice ? 'check' : 'save'}
                </span>
                <span>{savedNotice ? '저장됨' : '저장하기'}</span>
              </button>

              <button
                onClick={triggerRun}
                disabled={isExecuting}
                className="px-space-lg py-space-xs h-9 rounded-lg bg-gradient-to-r from-inverse-primary via-primary-container to-secondary-container hover:brightness-110 text-on-surface font-body-sm text-body-sm font-semibold flex items-center gap-space-xs shadow-[0_0_20px_rgba(77,142,255,0.4)] transition-all transform active:scale-95 disabled:opacity-50"
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
              <WorkflowEditor />

              {/* Bottom Execution Shelf */}
              <ExecutionPanel
                isCollapsed={isLogCollapsed}
                onToggleCollapse={() => setIsLogCollapsed(!isLogCollapsed)}
              />
            </div>

            {/* Right Aside: Property Panel or Execution Results */}
            <aside className="w-80 shrink-0 bg-surface-container-lowest/95 backdrop-blur-xl border-l border-outline-variant/30 flex flex-col z-20 shadow-xl overflow-hidden">
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
                  <button
                    onClick={() => setActiveRightTab('results')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      activeRightTab === 'results'
                        ? 'bg-surface-container-high text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    type="button"
                  >
                    실행 결과
                  </button>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-container/20 text-primary border border-primary/30">
                  {isExecuting ? '실행 중' : executionResult ? '완료' : '대기 중'}
                </span>
              </div>

              {/* View 1: Properties */}
              {activeRightTab === 'properties' && <PropertyPanel />}

              {/* View 2: Results */}
              {activeRightTab === 'results' && (
                <>
                  <div className="px-space-md py-space-sm bg-surface-container-low/50 flex items-center justify-between border-b border-outline-variant/20 shrink-0">
                    <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-[12px]">
                      <span>출력 형식</span>
                      <div className="relative inline-flex items-center">
                        <select
                          value={outputFormat}
                          onChange={(e) => setOutputFormat(e.target.value as any)}
                          className="appearance-none bg-surface-container h-7 pl-2.5 pr-7 rounded-lg text-[12px] text-on-surface font-body-sm focus:outline-none cursor-pointer border border-outline-variant/30"
                        >
                          <option value="text">텍스트</option>
                          <option value="json">JSON</option>
                          <option value="markdown">마크다운</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-1.5 text-outline text-[16px] pointer-events-none">
                          expand_more
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleCopy}
                        className="w-7 h-7 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
                        title="결과 복사"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {copied ? 'check' : 'content_copy'}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-space-md flex flex-col gap-space-md">
                    {/* Metrics Box */}
                    <div className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low/70 border border-outline-variant/20">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-outline uppercase font-mono">Status</span>
                        <span className="font-mono text-tertiary text-[13px] font-semibold">
                          {isExecuting ? 'Running' : executionResult ? '200 OK' : 'IDLE'}
                        </span>
                      </div>
                      <div className="w-[1px] h-6 bg-outline-variant/30" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-outline uppercase font-mono">Logs</span>
                        <span className="font-mono text-secondary text-[13px] font-semibold">
                          {logs.length} Lines
                        </span>
                      </div>
                      <div className="w-[1px] h-6 bg-outline-variant/30" />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-outline uppercase font-mono">Output</span>
                        <span className="font-mono text-primary text-[13px] font-semibold">
                          {executionResult ? 'Ready' : 'Empty'}
                        </span>
                      </div>
                    </div>

                    {/* Result Content */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          최종 산출물 (응답 본문)
                        </span>
                        <span className="text-[10px] font-mono text-outline uppercase">{outputFormat}</span>
                      </div>
                      <div className="flex-1 p-space-md rounded-xl bg-surface-container-high/90 border border-outline-variant/30 text-[13px] text-on-surface leading-relaxed select-text space-y-2 overflow-y-auto shadow-sm">
                        {executionResult ? (
                          outputFormat === 'markdown' ? (
                            <ReactMarkdown>{executionResult}</ReactMarkdown>
                          ) : (
                            <pre className="font-mono text-xs whitespace-pre-wrap">{executionResult}</pre>
                          )
                        ) : (
                          <div className="text-outline italic text-xs py-8 text-center">
                            실행 결과가 여기에 표시됩니다. 상단의 '실행하기' 버튼을 눌러보세요.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
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
  const { isExecuting, setIsExecuting, clearLogs, addLog, setActiveNodeId, setExecutionResult, setMessages } =
    useWorkflowStore();

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
