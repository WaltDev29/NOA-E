import { useWorkflowStore } from '../../store/useWorkflowStore';
import { X, Copy, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

export const OutputResultModal = () => {
  const { outputResultModal, closeOutputModal, executionResult } = useWorkflowStore();
  const [copied, setCopied] = useState(false);
  
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeOutputModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeOutputModal]);

  const handleCopy = () => {
    navigator.clipboard.writeText(executionResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!outputResultModal.isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[80vh] flex flex-col bg-card border shadow-2xl rounded-2xl p-6 animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">🎉</span> 실행 결과
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopy}
              className="p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors flex items-center gap-1 text-sm"
              title="결과 복사"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button 
              onClick={closeOutputModal}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 min-h-[200px] bg-muted/20 p-4 rounded-xl border prose prose-sm dark:prose-invert max-w-none">
          {executionResult ? (
            <ReactMarkdown>{executionResult}</ReactMarkdown>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground italic">
              아직 실행 결과가 없습니다. 에이전트를 먼저 실행해주세요.
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};
