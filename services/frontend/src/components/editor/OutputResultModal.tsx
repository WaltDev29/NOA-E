import React, { useEffect, useState } from 'react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import ReactMarkdown from 'react-markdown';

export const OutputResultModal: React.FC = () => {
  const { outputResultModal, closeOutputModal, executionResult } = useWorkflowStore();
  const [copied, setCopied] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-md animate-in fade-in duration-200 p-4">
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-surface-container-high/95 backdrop-blur-xl border border-outline-variant/40 shadow-[0_16px_40px_rgba(0,0,0,0.6)] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">output</span>
            </div>
            <h2 className="font-display text-lg font-bold text-on-surface">실행 결과 산출물</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface text-xs font-medium transition-colors flex items-center gap-1.5 border border-outline-variant/30"
              title="결과 복사"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? '복사됨' : '복사하기'}</span>
            </button>
            <button
              onClick={closeOutputModal}
              className="w-8 h-8 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-[220px] bg-surface-container-lowest/90 p-5 rounded-xl border border-outline-variant/30 text-sm text-on-surface leading-relaxed select-text font-sans">
          {executionResult ? (
            <ReactMarkdown>{executionResult}</ReactMarkdown>
          ) : (
            <div className="h-full flex items-center justify-center text-outline italic text-xs">
              아직 실행 결과가 없습니다. 상단의 '실행하기'를 먼저 눌러주세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
