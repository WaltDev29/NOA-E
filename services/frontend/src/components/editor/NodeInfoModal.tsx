import React, { useEffect } from 'react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { useNavigate } from '../../router/Router';

interface NodeModalInfo {
  title: string;
  icon: string;
  color: string;
  desc: string;
  inputGuide: string;
  outputGuide: string;
  nodeSlug: string;
}

const nodeInfoContent: Record<string, NodeModalInfo> = {
  inputNode: {
    title: '사용자 입력 노드 (Input)',
    icon: 'login',
    color: 'tertiary',
    desc: '워크플로우의 시작점입니다. 에이전트에게 전달할 최초의 질문이나 데이터를 설정합니다.',
    inputGuide: '최초 시작 노드이므로 이전 노드와의 입력 연결이 필요하지 않습니다.',
    outputGuide: '오른쪽 출력 연결점을 다음 처리 노드(LLM 지능 노드, 자율 에이전트 등)의 왼쪽 입력 연결점에 연결해주세요.',
    nodeSlug: 'input',
  },
  llmNode: {
    title: 'LLM 지능 노드 (LLM Agent)',
    icon: 'neurology',
    color: 'secondary',
    desc: '대규모 언어 모델을 나타냅니다. 전달받은 텍스트를 읽고 스스로 판단하여 지능형 답변을 생성합니다.',
    inputGuide: '왼쪽 입력 연결점에 이전 노드(사용자 입력, 문서 처리 등)의 출력 연결점을 연결해주세요.',
    outputGuide: '오른쪽 출력 연결점을 다음 노드(결과 출력, 코드 실행, DB 등)에 연결해주세요. (웹 검색, 계산기 등 도구 노드는 상단 연결점에 연결)',
    nodeSlug: 'llm',
  },
  searchNode: {
    title: '웹 검색 도구 (Web Search)',
    icon: 'travel_explore',
    color: 'primary',
    desc: 'LLM이 최신 인터넷 정보를 실시간으로 검색하여 답변에 활용할 수 있도록 지원하는 도구 노드입니다.',
    inputGuide: 'LLM 노드 또는 자율 에이전트 노드의 상단 도구(Tools) 연결점에 연결해주세요.',
    outputGuide: '검색된 최신 웹 정보 결과가 연결된 LLM 노드로 자동 반환됩니다.',
    nodeSlug: 'web-search',
  },
  calculatorNode: {
    title: '계산기 도구 (Calculator)',
    icon: 'calculate',
    color: 'tertiary',
    desc: '수학 수식과 정밀한 산술 연산을 빠르고 정확하게 계산하는 도구 노드입니다.',
    inputGuide: 'LLM 노드 또는 자율 에이전트 노드의 상단 도구(Tools) 연결점에 연결해주세요.',
    outputGuide: '정밀 연산된 수식 계산 결과값이 연결된 LLM 노드로 자동 전달됩니다.',
    nodeSlug: 'calculator',
  },
  agentNode: {
    title: '자율 에이전트 (Autonomous Agent)',
    icon: 'smart_toy',
    color: 'secondary',
    desc: '독립적인 목표를 가지고 판단과 도구 호출, 자체 피드백을 수행하는 고도화된 에이전트 노드입니다.',
    inputGuide: '왼쪽 입력 연결점에 사용자 질문이나 시작 트리거 노드의 출력을 연결해주세요.',
    outputGuide: '오른쪽 출력 연결점을 결과 출력 노드 또는 후속 처리 노드에 연결해주세요.',
    nodeSlug: 'agent',
  },
  outputNode: {
    title: '결과 출력 노드 (Output)',
    icon: 'output',
    color: 'error',
    desc: '워크플로우의 종착점입니다. 에이전트가 생성한 최종 답변이나 결과를 포맷팅하여 화면에 출력합니다.',
    inputGuide: '왼쪽 입력 연결점에 마지막 처리 노드(LLM, 자율 에이전트, 코드 실행 등)의 오른쪽 출력을 연결해주세요.',
    outputGuide: '최종 종착 노드이므로 다음 노드로의 출력 연결이 필요하지 않습니다.',
    nodeSlug: 'output',
  },
};

export const NodeInfoModal: React.FC = () => {
  const { nodeInfoModal, closeNodeModal } = useWorkflowStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeNodeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeNodeModal]);

  if (!nodeInfoModal.isOpen || !nodeInfoModal.nodeType) return null;

  const content = nodeInfoContent[nodeInfoModal.nodeType];
  if (!content) return null;

  const handleLearnMore = () => {
    closeNodeModal();
    navigate(`/noa-e/nodes/${content.nodeSlug}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-md animate-in fade-in duration-200 p-4">
      <div className="relative w-full max-w-lg bg-surface-container-high/95 backdrop-blur-xl border border-outline-variant/40 shadow-[0_16px_40px_rgba(0,0,0,0.6)] rounded-2xl p-6">
        <button
          onClick={closeNodeModal}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer"
          type="button"
          title="닫기"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[24px]">{content.icon}</span>
          </div>
          <h2 className="font-display text-lg font-bold text-on-surface">{content.title}</h2>
        </div>

        <div className="space-y-3">
          {/* 무엇을 하는 노드인가요? */}
          <div className="p-4 bg-surface-container-lowest/80 rounded-xl border border-outline-variant/30">
            <h3 className="font-display font-semibold text-xs flex items-center gap-1.5 mb-1.5 text-primary">
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span>무엇을 하는 노드인가요?</span>
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">{content.desc}</p>
          </div>

          {/* 사용 방법 (Input & Output 연결 가이드) */}
          <div className="p-4 bg-surface-container-lowest/80 rounded-xl border border-secondary/30">
            <h3 className="font-display font-semibold text-xs flex items-center gap-1.5 mb-2.5 text-secondary">
              <span className="material-symbols-outlined text-[16px]">hub</span>
              <span>사용 방법</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 bg-surface-container-low/70 p-2.5 rounded-lg border border-outline-variant/20">
                <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  Input
                </span>
                <p className="text-on-surface-variant leading-relaxed">{content.inputGuide}</p>
              </div>

              <div className="flex items-start gap-2 bg-surface-container-low/70 p-2.5 rounded-lg border border-outline-variant/20">
                <span className="px-1.5 py-0.5 rounded bg-tertiary/20 text-tertiary font-mono text-[10px] font-bold shrink-0 mt-0.5">
                  Output
                </span>
                <p className="text-on-surface-variant leading-relaxed">{content.outputGuide}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 더 알아보기 버튼 */}
        <div className="mt-5">
          <button
            onClick={handleLearnMore}
            className="w-full py-2.5 bg-gradient-to-r from-primary-container to-secondary-container text-white font-display text-xs font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary-container/20 flex items-center justify-center gap-1.5 cursor-pointer group"
            type="button"
          >
            <span>더 알아보기</span>
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
