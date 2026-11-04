import React, { useState, useEffect } from 'react';

import { useWorkflowStore } from '../../store/useWorkflowStore';

import { workflowApi } from '../../services/workflowApi';
import ReactMarkdown from 'react-markdown';

export const PropertyPanel: React.FC = () => {

  const selectedNode = useWorkflowStore((state) => state.selectedNode);

  const updateNodeConfig = useWorkflowStore((state) => state.updateNodeConfig);

  const updateNodeLabel = useWorkflowStore((state) => state.updateNodeLabel);

  const deleteNode = useWorkflowStore((state) => state.deleteNode);

  const executionResult = useWorkflowStore((state) => state.executionResult);

  const isExecuting = useWorkflowStore((state) => state.isExecuting);

  const activeNodeId = useWorkflowStore((state) => state.activeNodeId);

  const nodeResults = useWorkflowStore((state) => state.nodeResults);

  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [tempLabel, setTempLabel] = useState('');
  const [serverModels, setServerModels] = useState<string[]>([]);
  const [isCustomModel, setIsCustomModel] = useState<boolean>(false);

  const currentNodeId = selectedNode?.id;
  const currentLabel = (selectedNode?.data as any)?.label || '';

  // 백엔드로부터 사용 가능한 모델 목록 조회
  useEffect(() => {
    let isMounted = true;
    workflowApi.getAvailableModels()
      .then((data) => {
        if (!isMounted) return;
        setServerModels(data.models || []);
      })
      .catch((err) => {
        console.error('사용 가능 모델 목록 조회 실패:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setIsEditingLabel(false);
    setTempLabel(currentLabel);

    // 선택된 노드의 모델이 서버 모델 목록에 없는 사용자 정의 모델인지 확인
    const currentModel = (selectedNode?.data as any)?.config?.model;
    if (currentModel) {
      if (serverModels.length > 0 && !serverModels.includes(currentModel)) {
        setIsCustomModel(true);
      } else {
        setIsCustomModel(false);
      }
    } else {
      setIsCustomModel(false);
    }
  }, [currentNodeId, currentLabel, serverModels]);

  if (!selectedNode) {

    return (

      <div className="w-full flex-1 flex flex-col p-space-md justify-center items-center text-center">

        <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-outline mb-3">

          <span className="material-symbols-outlined text-[24px]">tune</span>

        </div>

        <h3 className="font-display text-sm font-bold text-on-surface">노드 설정</h3>

        <p className="text-xs text-outline mt-1 max-w-[240px] leading-relaxed">

          캔버스에서 노드를 선택하여 상세 파라미터를 설정하세요.

        </p>

      </div>

    );

  }

  const { id, type, data } = selectedNode;

  const config = (data as any)?.config || {};

  const getNodeDefaultName = (nodeType?: string) => {

    const labels: Record<string, string> = {

      inputNode: 'Input',

      plannerNode: 'Planner',

      routerNode: 'Router',

      llmNode: 'LLM (Worker)',

      aggregatorNode: 'Aggregator',

      searchNode: '웹 검색',

      calculatorNode: '계산기',

      outputNode: 'Output',

    };

    return labels[nodeType || ''] || nodeType || '노드';

  };

  const getNodeIcon = (nodeType?: string) => {

    switch (nodeType) {

      case 'inputNode':

        return 'login';

      case 'llmNode':

        return 'neurology';

      case 'plannerNode':

        return 'assignment';

      case 'routerNode':

        return 'alt_route';

      case 'aggregatorNode':

        return 'auto_awesome';

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

  const handleChange = (key: string, value: any) => {

    updateNodeConfig(id, { [key]: value });

  };

  const handleStartEdit = () => {

    setTempLabel(currentLabel || getNodeDefaultName(type));

    setIsEditingLabel(true);

  };

  const handleFinishEdit = () => {

    setIsEditingLabel(false);

    const trimmed = tempLabel.trim();

    updateNodeLabel(id, trimmed || getNodeDefaultName(type));

  };

  const isCurrentRunning = isExecuting && activeNodeId === id;

  const hasResult = !!nodeResults[id];

  return (

    <div className="w-full flex-1 flex flex-col overflow-hidden">

      {/* Panel Header */}

      <div className="p-space-md flex items-center justify-between border-b border-outline-variant/20 shrink-0 gap-2">

        <div className="flex items-center gap-1.5 min-w-0 flex-1">

          <span className="material-symbols-outlined text-primary text-[20px] shrink-0">

            {getNodeIcon(type)}

          </span>

          {/* 노드 이름 인라인 편집 / 일반 텍스트 표시 */}

          {isEditingLabel ? (

            <input

              type="text"

              value={tempLabel}

              onChange={(e) => setTempLabel(e.target.value)}

              onBlur={handleFinishEdit}

              onKeyDown={(e) => {

                if (e.key === 'Enter') handleFinishEdit();

                if (e.key === 'Escape') setIsEditingLabel(false);

              }}

              autoFocus

              className="bg-surface-container border border-primary px-1.5 py-0.5 rounded text-xs text-on-surface font-bold focus:outline-none flex-1 min-w-0"

            />

          ) : (

            <div className="flex items-center gap-1 min-w-0 group cursor-pointer" onClick={handleStartEdit}>

              <span className="font-display text-sm font-bold text-on-surface truncate">

                {currentLabel || getNodeDefaultName(type)}

              </span>

              <button

                type="button"

                onClick={(e) => {

                  e.stopPropagation();

                  handleStartEdit();

                }}

                className="w-5 h-5 rounded flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container-high transition-colors shrink-0"

                title="노드 이름 수정"

              >

                <span className="material-symbols-outlined text-[15px]">edit</span>

              </button>

            </div>

          )}

          <span

            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${isCurrentRunning

              ? 'bg-tertiary-container/30 text-tertiary border-tertiary/40 animate-pulse'

              : hasResult

                ? 'bg-primary-container/20 text-primary border-primary/30'

                : 'bg-surface-container text-outline border-outline-variant/30'

              }`}

          >

            {isCurrentRunning ? '실행 중' : hasResult ? '완료' : '대기 중'}

          </span>

        </div>

        <button

          onClick={() => deleteNode(id)}

          className="w-7 h-7 rounded-lg hover:bg-error-container/30 text-error flex items-center justify-center transition-colors shrink-0"

          title="노드 삭제"

          type="button"

        >

          <span className="material-symbols-outlined text-[16px]">delete</span>

        </button>

      </div>

      <div className="px-space-md py-1.5 bg-surface-container-low/50 border-b border-outline-variant/20 flex items-center justify-between font-mono text-[11px] text-outline">

        <span>NODE ID / TYPE:</span>

        <span className="text-secondary">{id} ({type})</span>

      </div>

      {/* Panel Body */}

      <div className="p-space-md flex-1 overflow-y-auto flex flex-col gap-4">

        {type === 'inputNode' && (

          <div className="flex flex-col gap-2">

            <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">

              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>

              사용자 질문 / 입력 텍스트

            </label>

            <textarea

              className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-3 text-xs text-on-surface placeholder:text-outline/50 focus:border-tertiary focus:outline-none min-h-[120px] resize-y transition-colors leading-relaxed"

              placeholder="여기에 질문을 입력하세요..."

              value={config.input_text || ''}

              onChange={(e) => handleChange('input_text', e.target.value)}

            />

            <p className="text-[11px] text-outline">

              캔버스의 입력 노드 안에서도 동일하게 입력할 수 있습니다.

            </p>

          </div>

        )}

        {(type === 'llmNode' || type === 'plannerNode' || type === 'routerNode' || type === 'aggregatorNode') && (

          <>

            {/* 1. 모델명 (서버 제공 모델 선택 및 직접 입력) */}

            <div className="flex flex-col gap-2">

              <div className="flex items-center justify-between">

                <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">

                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>

                  Model

                </label>

                {isCustomModel && (

                  <span className="text-[10px] font-semibold text-secondary px-1.5 py-0.5 rounded bg-secondary/10 border border-secondary/20">

                    직접 입력

                  </span>

                )}

              </div>

              <select

                className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-3 py-2 text-xs text-on-surface focus:border-secondary focus:outline-none transition-colors font-mono cursor-pointer"

                value={isCustomModel ? '__custom__' : (config.model || '')}

                onChange={(e) => {

                  const val = e.target.value;

                  if (val === '__custom__') {

                    setIsCustomModel(true);

                  } else {

                    setIsCustomModel(false);

                    handleChange('model', val);

                  }

                }}

              >

                <option value="" disabled>

                  모델을 선택하세요

                </option>

                {serverModels.map((m) => (

                  <option key={m} value={m}>

                    {m}

                  </option>

                ))}

                <option value="__custom__">직접 입력 (사용자 지정)...</option>

              </select>

              {/* '직접 입력' 선택 시에만 텍스트 필드 노출 */}

              {isCustomModel && (

                <div className="flex flex-col gap-1 mt-1">

                  <input

                    type="text"

                    className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-3 py-2 text-xs text-on-surface focus:border-secondary focus:outline-none transition-colors font-mono"

                    placeholder="모델명을 입력하세요 (예: gpt-4o)"

                    value={config.model || ''}

                    onChange={(e) => handleChange('model', e.target.value)}

                    autoFocus

                  />

                </div>

              )}

            </div>

            {/* 2. Base URL */}

            <div className="flex flex-col gap-2">

              <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">

                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>

                Base URL <span className="text-outline font-normal">(선택)</span>

              </label>

              <input

                type="text"

                className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-3 py-2 text-xs text-on-surface focus:border-primary focus:outline-none transition-colors font-mono"

                placeholder="http://ollama:11434/v1"

                value={config.base_url || ''}

                onChange={(e) => handleChange('base_url', e.target.value)}

              />

            </div>

            {/* 3. API Key */}

            <div className="flex flex-col gap-2">

              <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">

                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>

                API Key <span className="text-outline font-normal">(선택)</span>

              </label>

              <input

                type="password"

                className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-3 py-2 text-xs text-on-surface focus:border-primary focus:outline-none transition-colors font-mono"

                placeholder="sk-..."

                value={config.api_key || ''}

                onChange={(e) => handleChange('api_key', e.target.value)}

              />

            </div>

            {/* Router 전용: 최대 루프 반복 횟수 */}

            {type === 'routerNode' && (

              <div className="flex flex-col gap-2 p-3 rounded-xl bg-surface-container/60 border border-secondary/30">

                <div className="flex justify-between items-center">

                  <label className="text-xs font-semibold text-secondary flex items-center gap-1">

                    <span className="material-symbols-outlined text-[16px]">sync</span>

                    최대 루프 횟수 (Max Loops)

                  </label>

                  <span className="text-xs font-mono font-bold text-secondary">

                    {config.max_loops ?? 5}회

                  </span>

                </div>

                <input

                  type="range"

                  min="1"

                  max="10"

                  value={config.max_loops ?? 5}

                  onChange={(e) => handleChange('max_loops', parseInt(e.target.value, 10))}

                  className="w-full accent-secondary cursor-pointer"

                />

                <p className="text-[11px] text-outline">

                  Worker 노드로부터 복귀하는 루프가 초과되면 안전하게 종료 경로로 탈출합니다.

                </p>

              </div>

            )}

            {/* LLM 전용: 도구 ReAct 루프 및 자율 재시도 설정 */}

            {type === 'llmNode' && (

              <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-surface-container/60 border border-outline-variant/40">

                <div className="flex items-center justify-between">

                  <label className="text-xs font-semibold text-on-surface flex items-center gap-1">

                    <span className="material-symbols-outlined text-tertiary text-[16px]">autorenew</span>

                    도구 자율 ReAct 루프

                  </label>

                  <input

                    type="checkbox"

                    checked={config.react_loop ?? true}

                    onChange={(e) => handleChange('react_loop', e.target.checked)}

                    className="w-4 h-4 accent-tertiary cursor-pointer"

                  />

                </div>

                {(config.react_loop ?? true) && (

                  <>

                    <div className="flex justify-between items-center pt-1">

                      <span className="text-[11px] text-outline">최대 도구 실행 횟수:</span>

                      <span className="text-xs font-mono font-bold text-tertiary">

                        {config.max_tool_iterations ?? 3}회

                      </span>

                    </div>

                    <input

                      type="range"

                      min="1"

                      max="5"

                      value={config.max_tool_iterations ?? 3}

                      onChange={(e) => handleChange('max_tool_iterations', parseInt(e.target.value, 10))}

                      className="w-full accent-tertiary cursor-pointer"

                    />

                    <div className="flex flex-col gap-1 pt-1">

                      <span className="text-[11px] text-outline font-medium">도구 평가 및 재시도 지침:</span>

                      <textarea

                        className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-2 text-[11px] text-on-surface focus:border-tertiary focus:outline-none min-h-[60px] resize-y"

                        placeholder="예: 검색 결과가 충분하지 않으면 키워드를 변경하여 재검색하세요."

                        value={config.tool_instruction || ''}

                        onChange={(e) => handleChange('tool_instruction', e.target.value)}

                      />

                    </div>

                  </>

                )}

              </div>

            )}

            {/* 4. 시스템 프롬프트 */}

            <div className="flex flex-col gap-2">

              <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">

                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>

                {type === 'routerNode'

                  ? '라우팅 규칙 지침 (Routing Instructions)'

                  : type === 'plannerNode'

                  ? '계획 수립 지침 (Planner Instructions)'

                  : type === 'aggregatorNode'

                  ? '결과 종합 지침 (Aggregator Instructions)'

                  : '시스템 프롬프트 (System Prompt)'}

              </label>

              <textarea

                className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-3 text-xs text-on-surface focus:border-primary focus:outline-none min-h-[120px] resize-y transition-colors leading-relaxed"

                placeholder="지침을 입력하세요..."

                value={config.system_prompt || ''}

                onChange={(e) => handleChange('system_prompt', e.target.value)}

              />

            </div>

          </>

        )}

                {type === 'outputNode' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                최종 산출물 미리보기
              </label>
              {executionResult && (
                <span className="text-[10px] font-mono text-outline">
                  Markdown
                </span>
              )}
            </div>

            <div className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-3 text-xs text-on-surface min-h-[180px] max-h-[400px] overflow-y-auto leading-relaxed select-text">
              {executionResult ? (
                <div className="prose prose-invert prose-xs max-w-none [&_h1]:text-sm [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-xs [&_h2]:font-bold [&_h2]:mb-1.5 [&_h3]:text-xs [&_h3]:font-semibold [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-1 [&_code]:bg-surface-container [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-surface-container-high [&_pre]:p-2 [&_pre]:rounded-lg [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-2 [&_strong]:text-primary">
                  <ReactMarkdown>{executionResult}</ReactMarkdown>
                </div>
              ) : (
                <span className="text-outline italic">실행 결과가 아직 없습니다.</span>
              )}
            </div>
          </div>
        )}

      </div>

    </div>

  );

};
