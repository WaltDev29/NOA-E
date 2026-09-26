import React, { useState } from 'react';
import { useWorkflowStore, type ExecutionStep } from '../../store/useWorkflowStore';
import ReactMarkdown from 'react-markdown';

export const NodeResultPanel: React.FC = () => {
  const {
    selectedNode,
    deleteNode,
    nodeResults,
    isExecuting,
    activeNodeId,
  } = useWorkflowStore();

  const [collapsedSteps, setCollapsedSteps] = useState<Record<number, boolean>>({});
  const [outputFormats, setOutputFormats] = useState<Record<number, 'markdown' | 'text' | 'json'>>({});
  const [copiedInputs, setCopiedInputs] = useState<Record<number, boolean>>({});
  const [copiedOutputs, setCopiedOutputs] = useState<Record<number, boolean>>({});

  if (!selectedNode) {
    return (
      <div className="w-full flex-1 flex flex-col p-space-md justify-center items-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-outline mb-3">
          <span className="material-symbols-outlined text-[24px]">terminal</span>
        </div>
        <h3 className="font-display text-sm font-bold text-on-surface">실행 결과</h3>
        <p className="text-xs text-outline mt-1 max-w-[240px] leading-relaxed">
          캔버스에서 노드를 선택하여 실행 결과(Input / Output)를 확인하세요.
        </p>
      </div>
    );
  }

  const { id, type } = selectedNode;
  const activeResult = nodeResults[id] || null;
  const steps: ExecutionStep[] = activeResult?.steps || [];

  const toggleStepCollapse = (stepIndex: number) => {
    setCollapsedSteps((prev) => ({
      ...prev,
      [stepIndex]: !prev[stepIndex],
    }));
  };

  const handleCopyInput = (stepIndex: number, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedInputs((prev) => ({ ...prev, [stepIndex]: true }));
    setTimeout(() => {
      setCopiedInputs((prev) => ({ ...prev, [stepIndex]: false }));
    }, 2000);
  };

  const handleCopyOutput = (stepIndex: number, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedOutputs((prev) => ({ ...prev, [stepIndex]: true }));
    setTimeout(() => {
      setCopiedOutputs((prev) => ({ ...prev, [stepIndex]: false }));
    }, 2000);
  };

  const getNodeLabel = (node: any) => {
    if (!node) return '노드';
    const labels: Record<string, string> = {
      inputNode: '사용자 입력',
      llmNode: 'LLM',
      agentNode: 'Autonomous Agent',
      searchNode: '웹 검색',
      calculatorNode: '계산기',
      outputNode: '결과 출력',
    };
    return node.data?.label || labels[node.type] || node.id;
  };

  const getNodeIcon = (nodeType?: string) => {
    switch (nodeType) {
      case 'inputNode':
        return 'login';
      case 'llmNode':
        return 'neurology';
      case 'agentNode':
        return 'smart_toy';
      case 'searchNode':
        return 'travel_explore';
      case 'calculatorNode':
        return 'calculate';
      case 'outputNode':
        return 'output';
      default:
        return 'tune';
    }
  };

  const isCurrentRunning = isExecuting && activeNodeId === id;
  const hasResult = steps.length > 0;

  return (
    <div className="w-full flex-1 flex flex-col overflow-hidden">
      {/* Panel Header - Identical to PropertyPanel */}
      <div className="p-space-md flex items-center justify-between border-b border-outline-variant/20 shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">
            {getNodeIcon(type)}
          </span>
          <span className="font-display text-sm font-bold text-on-surface">
            {getNodeLabel(selectedNode)}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              isCurrentRunning
                ? 'bg-tertiary-container/30 text-tertiary border-tertiary/40 animate-pulse'
                : hasResult
                ? 'bg-primary-container/20 text-primary border-primary/30'
                : 'bg-surface-container text-outline border-outline-variant/30'
            }`}
          >
            {isCurrentRunning
              ? '실행 중'
              : hasResult
              ? `${steps.length}회 실행 완료`
              : '대기 중'}
          </span>
        </div>
        <button
          onClick={() => deleteNode(id)}
          className="w-7 h-7 rounded-lg hover:bg-error-container/30 text-error flex items-center justify-center transition-colors"
          title="노드 삭제"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">delete</span>
        </button>
      </div>

      <div className="px-space-md py-1.5 bg-surface-container-low/50 border-b border-outline-variant/20 flex items-center justify-between font-mono text-[11px] text-outline shrink-0">
        <span>NODE ID:</span>
        <span className="text-secondary">{id}</span>
      </div>

      {/* Main Content Area: Dynamic History of Step Sets */}
      <div className="flex-1 overflow-y-auto p-space-md flex flex-col gap-4">
        {hasResult ? (
          steps.map((step) => {
            const isCollapsed = !!collapsedSteps[step.stepIndex];
            const format = outputFormats[step.stepIndex] || 'markdown';
            const isInputCopied = !!copiedInputs[step.stepIndex];
            const isOutputCopied = !!copiedOutputs[step.stepIndex];

            return (
              <div
                key={step.stepIndex}
                className="rounded-2xl border border-outline-variant/30 bg-surface-container-low/40 overflow-hidden shadow-sm flex flex-col transition-all"
              >
                {/* Step Set Toggle Header */}
                <button
                  type="button"
                  onClick={() => toggleStepCollapse(step.stepIndex)}
                  className="w-full px-3.5 py-2.5 bg-surface-container-high/60 hover:bg-surface-container-high border-b border-outline-variant/20 flex items-center justify-between transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary transition-transform">
                      {isCollapsed ? 'expand_more' : 'expand_less'}
                    </span>
                    <span className="text-xs font-bold text-on-surface">
                      실행 단계 #{step.stepIndex}
                    </span>
                    <span className="text-[10px] font-mono text-outline">{step.timestamp}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-tertiary-container/30 text-tertiary border border-tertiary/30">
                    Loop {step.stepIndex}
                  </span>
                </button>

                {/* Collapsible Step Body: Input & Output Sets */}
                {!isCollapsed && (
                  <div className="p-3.5 flex flex-col gap-3.5 animate-in fade-in duration-150">
                    {/* 1. Input 내용 표시부 */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-tertiary" />
                          <span className="material-symbols-outlined text-[16px] text-tertiary">
                            login
                          </span>
                          Input 내용
                        </label>
                        {step.input && (
                          <button
                            onClick={() => handleCopyInput(step.stepIndex, step.input)}
                            className="text-[11px] text-outline hover:text-primary flex items-center gap-1 transition-colors"
                            type="button"
                            title="Input 내용 복사"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {isInputCopied ? 'check' : 'content_copy'}
                            </span>
                            <span>{isInputCopied ? '복사됨' : '복사'}</span>
                          </button>
                        )}
                      </div>

                      <div className="min-h-[70px] max-h-[180px] p-3 rounded-xl bg-surface-container-high/90 border border-outline-variant/30 text-xs text-on-surface leading-relaxed overflow-y-auto font-mono whitespace-pre-wrap select-text">
                        {step.input ? (
                          step.input
                        ) : (
                          <span className="text-outline italic">전달된 입력 내용이 없습니다.</span>
                        )}
                      </div>
                    </div>

                    {/* 2. Output 내용 표시부 (그 밑에 배치) */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          <span className="material-symbols-outlined text-[16px] text-primary">
                            output
                          </span>
                          Output 내용
                        </label>

                        <div className="flex items-center gap-2">
                          <div className="relative inline-flex items-center">
                            <select
                              value={format}
                              onChange={(e) =>
                                setOutputFormats((prev) => ({
                                  ...prev,
                                  [step.stepIndex]: e.target.value as any,
                                }))
                              }
                              className="appearance-none bg-surface-container h-6 pl-2 pr-6 rounded-md text-[11px] text-on-surface font-body-sm focus:outline-none cursor-pointer border border-outline-variant/30"
                            >
                              <option value="markdown">마크다운</option>
                              <option value="text">텍스트</option>
                              <option value="json">JSON</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-1 text-outline text-[14px] pointer-events-none">
                              expand_more
                            </span>
                          </div>

                          {step.output && (
                            <button
                              onClick={() => handleCopyOutput(step.stepIndex, step.output)}
                              className="text-[11px] text-outline hover:text-primary flex items-center gap-1 transition-colors"
                              type="button"
                              title="Output 내용 복사"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {isOutputCopied ? 'check' : 'content_copy'}
                              </span>
                              <span>{isOutputCopied ? '복사됨' : '복사'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="min-h-[100px] p-3 rounded-xl bg-surface-container-high/90 border border-outline-variant/30 text-xs text-on-surface leading-relaxed overflow-y-auto select-text shadow-sm">
                        {step.output ? (
                          format === 'markdown' ? (
                            <div className="prose prose-invert prose-xs max-w-none space-y-1.5">
                              <ReactMarkdown>{step.output}</ReactMarkdown>
                            </div>
                          ) : (
                            <pre className="font-mono whitespace-pre-wrap">{step.output}</pre>
                          )
                        ) : (
                          <div className="text-outline italic py-3 text-center">
                            출력 결과가 비어있습니다.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          /* Default Empty/Waiting State (Initial Single Set) */
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low/40 overflow-hidden shadow-sm flex flex-col">
            <div className="px-3.5 py-2.5 bg-surface-container-high/60 border-b border-outline-variant/20 flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface">실행 대기 중</span>
              <span className="text-[10px] font-mono text-outline">Loop 0</span>
            </div>

            <div className="p-3.5 flex flex-col gap-3.5">
              {/* 1. Default Input View */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-tertiary" />
                  <span className="material-symbols-outlined text-[16px] text-tertiary">login</span>
                  Input 내용
                </label>
                <div className="min-h-[70px] p-3 rounded-xl bg-surface-container-high/90 border border-outline-variant/30 text-xs text-outline italic leading-relaxed flex items-center justify-center text-center">
                  {isCurrentRunning ? (
                    <span className="text-tertiary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] animate-spin">
                        progress_activity
                      </span>
                      입력 데이터를 수신하여 처리 중...
                    </span>
                  ) : (
                    '아직 전달된 Input 데이터가 없습니다.'
                  )}
                </div>
              </div>

              {/* 2. Default Output View */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="material-symbols-outlined text-[16px] text-primary">output</span>
                  Output 내용
                </label>
                <div className="min-h-[100px] p-3 rounded-xl bg-surface-container-high/90 border border-outline-variant/30 text-xs text-outline italic leading-relaxed flex items-center justify-center text-center">
                  {isCurrentRunning ? (
                    <span className="text-primary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] animate-spin">
                        progress_activity
                      </span>
                      노드가 실행되며 출력을 생성하는 중입니다...
                    </span>
                  ) : (
                    '에이전트를 실행하면 이 노드의 루프별 실행 결과가 여기에 기록됩니다.'
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
