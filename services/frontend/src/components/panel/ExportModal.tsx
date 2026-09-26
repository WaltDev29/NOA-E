import React, { useState } from 'react';
import { useWorkflowStore } from '../../store/useWorkflowStore';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, agentName }) => {
  const [activeTab, setActiveTab] = useState<'json' | 'runner'>('json');
  const [description, setDescription] = useState('NOA-E 시각적 빌더로 생성된 AI 에이전트');
  const [downloadedNotice, setDownloadedNotice] = useState(false);

  const nodes = useWorkflowStore((state) => state.nodes);
  const edges = useWorkflowStore((state) => state.edges);

  if (!isOpen) return null;

  // JSON 워크플로우 생성 (LLM 노드는 보안상 모델명만 저장)
  const generateWorkflowJSON = () => {
    const typeMap: Record<string, string> = {
      inputNode: 'input',
      llmNode: 'llm',
      outputNode: 'output',
      searchNode: 'search',
      calculatorNode: 'calculator',
      agentNode: 'agent',
    };

    const sanitizedNodes = nodes.map((node) => {
      const rawConfig = (node.data as any)?.config || {};
      const backendType = typeMap[node.type || ''] || node.type || 'unknown';

      // LLM/Agent 노드의 경우 민감 정보(api_key, base_url)를 제외하고 model 위주로 보존
      let sanitizedConfig: Record<string, any> = { ...rawConfig };
      if (backendType === 'llm' || backendType === 'agent') {
        sanitizedConfig = {
          model: rawConfig.model || 'gemma2:2b',
          system_prompt: rawConfig.system_prompt || 'You are a helpful assistant.',
          temperature: rawConfig.temperature !== undefined ? Number(rawConfig.temperature) : 0.7,
        };
      }

      return {
        id: node.id,
        type: backendType,
        position: node.position,
        data: {
          label: (node.data as any)?.label || node.id,
        },
        config: sanitizedConfig,
      };
    });

    const sanitizedEdges = edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
    }));

    return {
      schema_version: '1.0',
      metadata: {
        agent_id: `agent-${Date.now()}`,
        agent_name: agentName || 'My Agent',
        description: description,
        exported_at: new Date().toISOString(),
      },
      nodes: sanitizedNodes,
      edges: sanitizedEdges,
    };
  };

  const handleDownloadJSON = () => {
    const workflowData = generateWorkflowJSON();
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(workflowData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    const safeFileName = (agentName || 'agent_workflow')
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '_');
    downloadAnchor.setAttribute('download', `${safeFileName}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadedNotice(true);
    setTimeout(() => setDownloadedNotice(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-surface-container-high border border-outline-variant/50 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-lowest/50">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[22px]">save</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              에이전트 저장 및 실행기
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-outline-variant/30 px-6 bg-surface-container-lowest/20">
          <button
            onClick={() => setActiveTab('json')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'json'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">data_object</span>
            Workflow JSON 다운로드
          </button>
          <button
            onClick={() => setActiveTab('runner')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'runner'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">terminal</span>
            로컬 실행기 (Runtime) 안내
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {activeTab === 'json' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  에이전트 이름
                </label>
                <input
                  type="text"
                  value={agentName}
                  disabled
                  className="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-3.5 py-2 text-sm text-on-surface opacity-80"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  에이전트 설명
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="에이전트에 대한 간단한 설명을 입력하세요."
                  className="w-full bg-surface-container border border-outline-variant/40 rounded-lg px-3.5 py-2 text-sm text-on-surface focus:outline-none focus:border-primary transition-all resize-none"
                />
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-xl p-3.5 flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                  verified_user
                </span>
                <div className="text-xs text-on-surface-variant leading-relaxed">
                  <span className="font-bold text-primary">보안 안내:</span> 다운로드되는 JSON에는
                  API Key가 저장되지 않으며 모델명만 포함됩니다. Base URL과 API Key는 본인의 로컬
                  실행기에서 안전하게 설정할 수 있습니다.
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleDownloadJSON}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-inverse-primary via-primary-container to-secondary-container text-on-surface font-semibold text-sm shadow-[0_0_20px_rgba(77,142,255,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {downloadedNotice ? 'check' : 'download'}
                  </span>
                  <span>{downloadedNotice ? '다운로드 완료!' : '에이전트 JSON 다운로드'}</span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-surface-container border border-outline-variant/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
                  <span className="material-symbols-outlined text-tertiary text-[20px]">
                    desktop_windows
                  </span>
                  <span>NOA-E Agent Runtime 실행기</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  다운로드한 에이전트 JSON을 본인 PC에서 실행할 수 있는 독립 실행형 런타임입니다.
                  PC에 Ollama가 없어도 서버의 기본 AI 모델과 자동 연동되며, 본인의 외부 API Key도
                  설정 가능합니다.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-on-surface">실행 방법</h4>
                <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-xs font-mono text-[#e6edf3] space-y-2">
                  <div>
                    <span className="text-outline"># 1. 런타임 GUI 실행 (PySide6 데스크톱 앱)</span>
                    <div className="text-primary mt-0.5">python runtime/agent_runner.py</div>
                  </div>
                  <div>
                    <span className="text-outline"># 2. CLI 터미널 대화 모드</span>
                    <div className="text-tertiary mt-0.5">
                      python runtime/agent_runner.py --workflow {agentName || 'agent'}.json --cli
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-xl p-3 text-xs text-on-surface-variant space-y-1">
                <div className="font-semibold text-on-surface">💡 최초 로드 시 안내:</div>
                <div>
                  실행기를 띄운 후 좌측 하단의 <strong>[⚙️ 에이전트 설정]</strong>에서 다운로드한
                  JSON을 선택하고, 노드별 기본/커스텀 LLM을 설정하세요.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-outline-variant/30 bg-surface-container-lowest/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-highest text-on-surface text-xs font-semibold transition-all"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
