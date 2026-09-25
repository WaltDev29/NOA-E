import { useWorkflowStore } from '../../store/useWorkflowStore';
import { X, Info, LogIn, Bot, Flag } from 'lucide-react';
import { useEffect } from 'react';

const nodeInfoContent: Record<string, { title: string, icon: any, desc: string, guide: string }> = {
  inputNode: {
    title: 'Input Node',
    icon: LogIn,
    desc: '워크플로우의 시작점입니다. 에이전트에게 전달할 최초의 질문이나 데이터를 설정합니다.',
    guide: '오른쪽 설정 패널에서 "Initial Text Input"에 시작할 때 던질 질문(예: "안녕? 넌 누구야?")을 적어주세요.'
  },
  llmNode: {
    title: 'LLM Agent Node',
    icon: Bot,
    desc: '인공지능 모델(대규모 언어 모델)을 나타냅니다. 전달받은 텍스트를 읽고 스스로 판단하여 답변을 생성합니다.',
    guide: '오른쪽 설정 패널에서 인공지능의 역할(System Prompt)을 부여할 수 있습니다. "너는 수학 선생님이야" 라고 적으면 수학 선생님처럼 답변하게 됩니다.'
  },
  outputNode: {
    title: 'Output Node',
    icon: Flag,
    desc: '워크플로우의 종착점입니다. 에이전트가 생성한 최종 답변이나 결과를 출력합니다.',
    guide: '별도의 설정은 필요 없으며, 마지막 LLM 노드나 Tool 노드의 오른쪽 연결점을 이 노드의 왼쪽에 연결해주면 됩니다.'
  }
};

export const NodeInfoModal = () => {
  const { nodeInfoModal, closeNodeModal } = useWorkflowStore();
  
  // Close on Escape key
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
  
  const Icon = content.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card border shadow-2xl rounded-2xl p-6 animate-in zoom-in-95 duration-200">
        <button 
          onClick={closeNodeModal}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Icon size={24} />
          </div>
          <h2 className="text-2xl font-bold">{content.title}</h2>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg border">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-2 text-foreground">
              <Info size={16} className="text-blue-500" />
              무엇을 하는 노드인가요?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {content.desc}
            </p>
          </div>
          
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-2 text-primary">
              <span className="text-lg">💡</span> 사용 팁
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {content.guide}
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <button 
            onClick={closeNodeModal}
            className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
