import React, { useEffect } from 'react';
import { useWorkflowStore } from '../../store/useWorkflowStore';

const nodeInfoContent: Record<
  string,
  { title: string; icon: string; desc: string; guide: string; color: string }
> = {
  inputNode: {
    title: '사용자 입력 노드 (Input)',
    icon: 'login',
    color: 'tertiary',
    desc: '워크플로우의 시작점입니다. 에이전트에게 전달할 최초의 질문이나 데이터를 설정합니다.',
    guide: '오른쪽 설정 패널에서 "사용자 질문"에 시작할 때 던질 질문(예: "안녕? 넌 누구야?")을 적어주세요.',
  },
  llmNode: {
    title: 'LLM 지능 노드 (LLM Agent)',
    icon: 'neurology',
    color: 'secondary',
    desc: '대규모 언어 모델을 나타냅니다. 전달받은 텍스트를 읽고 스스로 판단하여 답변을 생성합니다.',
    guide: '오른쪽 설정 패널에서 인공지능의 역할(System Prompt)을 부여할 수 있습니다. "너는 친절한 과학 선생님이야" 라고 적으면 선생님처럼 답변하게 됩니다.',
  },
  searchNode: {
    title: '웹 검색 도구 (Web Search)',
    icon: 'travel_explore',
    color: 'primary',
    desc: 'LLM이 최신 인터넷 정보를 실시간으로 검색하여 답변에 활용할 수 있도록 지원하는 도구입니다.',
    guide: 'LLM 노드의 상단 핸들(Tools)에 연결하면, LLM이 필요하다고 판단할 때 자동으로 검색을 실행합니다.',
  },
  calculatorNode: {
    title: '계산기 도구 (Calculator)',
    icon: 'calculate',
    color: 'tertiary',
    desc: '수학 수식과 정밀한 산술 연산을 빠르고 정확하게 계산하는 도구입니다.',
    guide: 'LLM 노드의 상단 핸들(Tools)에 연결하면 복잡한 수식 연산 시 자동으로 계산기가 호출됩니다.',
  },
  agentNode: {
    title: '자율 에이전트 (Autonomous Agent)',
    icon: 'smart_toy',
    color: 'secondary',
    desc: '독립적인 목표를 가지고 판단과 도구 호출을 수행하는 고도화된 에이전트 노드입니다.',
    guide: '입력과 출력을 연결하고 필요한 시스템 지침을 설정하여 자율 워크플로우를 구성하세요.',
  },
  outputNode: {
    title: '결과 출력 노드 (Output)',
    icon: 'output',
    color: 'error',
    desc: '워크플로우의 종착점입니다. 에이전트가 생성한 최종 답변이나 결과를 포맷팅하여 출력합니다.',
    guide: '별도의 설정은 필요 없으며, 마지막 LLM 노드의 오른쪽 연결점을 이 노드의 왼쪽에 연결해주면 됩니다.',
  },
};

export const NodeInfoModal: React.FC = () => {
  const { nodeInfoModal, closeNodeModal } = useWorkflowStore();

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-md animate-in fade-in duration-200 p-4">
      <div className="relative w-full max-w-md bg-surface-container-high/95 backdrop-blur-xl border border-outline-variant/40 shadow-[0_16px_40px_rgba(0,0,0,0.6)] rounded-2xl p-6">
        <button
          onClick={closeNodeModal}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
          type="button"
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
          <div className="p-4 bg-surface-container-lowest/80 rounded-xl border border-outline-variant/30">
            <h3 className="font-display font-semibold text-xs flex items-center gap-1.5 mb-1.5 text-primary">
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span>무엇을 하는 노드인가요?</span>
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">{content.desc}</p>
          </div>

          <div className="p-4 bg-surface-container-lowest/80 rounded-xl border border-secondary/30">
            <h3 className="font-display font-semibold text-xs flex items-center gap-1.5 mb-1.5 text-secondary">
              <span className="material-symbols-outlined text-[16px]">lightbulb</span>
              <span>사용 팁</span>
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">{content.guide}</p>
          </div>
        </div>

        <div className="mt-5">
          <button
            onClick={closeNodeModal}
            className="w-full py-2.5 bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-display text-xs font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary-container/20"
            type="button"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
};
