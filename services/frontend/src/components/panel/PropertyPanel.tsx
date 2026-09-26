import React from 'react';
import { useWorkflowStore } from '../../store/useWorkflowStore';

export const PropertyPanel: React.FC = () => {
  const selectedNode = useWorkflowStore((state) => state.selectedNode);
  const updateNodeConfig = useWorkflowStore((state) => state.updateNodeConfig);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const executionResult = useWorkflowStore((state) => state.executionResult);

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
  const config = data.config || {};

  const handleChange = (key: string, value: any) => {
    updateNodeConfig(id, { [key]: value });
  };

  return (
    <div className="w-full flex-1 flex flex-col overflow-hidden">
      {/* Panel Header */}
      <div className="p-space-md flex items-center justify-between border-b border-outline-variant/20 shrink-0">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
          <span className="font-display text-sm font-bold text-on-surface">
            {data.label || type} 설정
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

      <div className="px-space-md py-1.5 bg-surface-container-low/50 border-b border-outline-variant/20 flex items-center justify-between font-mono text-[11px] text-outline">
        <span>NODE ID:</span>
        <span className="text-secondary">{id}</span>
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

        {(type === 'llmNode' || type === 'agentNode') && (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                LLM 모델명
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-3 py-2 text-xs text-on-surface focus:border-secondary focus:outline-none transition-colors"
                placeholder="gemma2:2b, gpt-4o-mini..."
                value={config.model || ''}
                onChange={(e) => handleChange('model', e.target.value)}
              />
            </div>

            {type === 'llmNode' && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  시스템 프롬프트 (System Prompt)
                </label>
                <textarea
                  className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-3 text-xs text-on-surface focus:border-primary focus:outline-none min-h-[120px] resize-y transition-colors leading-relaxed"
                  placeholder="You are a helpful assistant..."
                  value={config.system_prompt || ''}
                  onChange={(e) => handleChange('system_prompt', e.target.value)}
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-on-surface-variant">
                Custom API Key <span className="text-outline font-normal">(선택)</span>
              </label>
              <input
                type="password"
                className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-3 py-2 text-xs text-on-surface focus:border-primary focus:outline-none transition-colors font-mono"
                placeholder="sk-..."
                value={config.api_key || ''}
                onChange={(e) => handleChange('api_key', e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-on-surface-variant">
                Custom Base URL <span className="text-outline font-normal">(선택)</span>
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-3 py-2 text-xs text-on-surface focus:border-primary focus:outline-none transition-colors font-mono"
                placeholder="http://ollama:11434/v1"
                value={config.base_url || ''}
                onChange={(e) => handleChange('base_url', e.target.value)}
              />
            </div>
          </>
        )}

        {type === 'outputNode' && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
              최종 산출물 미리보기
            </label>
            <div className="w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-3 text-xs text-on-surface min-h-[180px] whitespace-pre-wrap overflow-y-auto leading-relaxed">
              {executionResult ? (
                executionResult
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
