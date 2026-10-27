import React from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import { useNavigate } from '../../router/Router';

interface GuideSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideSelectModal: React.FC<GuideSelectModalProps> = ({ isOpen, onClose }) => {
  const { startOverviewGuide, startPageTour, startStudioQuest, resetPageTours } = useOnboarding();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSelectOverview = () => {
    onClose();
    navigate('/noa-e');
    startOverviewGuide();
  };

  const handleSelectPageTour = () => {
    onClose();
    resetPageTours(); // 홈페이지, Nodes, Templates, Learn 페이지의 방문 기록을 모두 리셋하여 다 처음 접속하는 상태로 전환
    navigate('/noa-e');
    startPageTour('main');
  };

  const handleSelectStudioQuest = () => {
    onClose();
    navigate('/noa-e/studio');
    startStudioQuest();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="w-full max-w-lg rounded-3xl bg-surface-container-low/95 border border-outline-variant/40 shadow-2xl backdrop-blur-2xl p-6 sm:p-7 flex flex-col gap-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">explore</span>
            </div>
            <div>
              <h2 className="font-bold text-lg text-on-surface leading-tight">
                온보딩 가이드 다시보기
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                다시 살펴보고 싶은 안내 가이드를 선택해주세요.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            title="닫기"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 3 Guide Option Cards */}
        <div className="flex flex-col gap-3">
          {/* 1. 전체 서비스 소개 */}
          <button
            type="button"
            onClick={handleSelectOverview}
            className="w-full text-left p-4 rounded-2xl bg-surface-container-high/60 hover:bg-surface-container-high border border-outline-variant/30 hover:border-primary/50 transition-all flex items-start gap-3.5 group active:scale-[0.99] shadow-sm"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                  1. 전체 서비스 소개
                </h3>
                <span className="text-[11px] font-mono text-primary font-semibold">6단계 슬라이드</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                NOA-E 플랫폼의 핵심 가치와 Studio, Nodes, Templates, Learn 각 페이지의 역할을 간략히 소개합니다.
              </p>
            </div>
          </button>

          {/* 2. 페이지별 설명 투어 */}
          <button
            type="button"
            onClick={handleSelectPageTour}
            className="w-full text-left p-4 rounded-2xl bg-surface-container-high/60 hover:bg-surface-container-high border border-outline-variant/30 hover:border-secondary/50 transition-all flex items-start gap-3.5 group active:scale-[0.99] shadow-sm"
          >
            <div className="w-11 h-11 rounded-xl bg-secondary/15 text-secondary border border-secondary/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">map</span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-on-surface group-hover:text-secondary transition-colors">
                  2. 페이지별 설명 투어
                </h3>
                <span className="text-[11px] font-mono text-secondary font-semibold">전체 페이지 리셋</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                홈페이지, Nodes, Templates, Learn 페이지의 방문 기록을 초기화하여 처음 접속했을 때처럼 각 페이지별 가이드를 다시 체험합니다.
              </p>
            </div>
          </button>

          {/* 3. 에이전트 제작 가이드 */}
          <button
            type="button"
            onClick={handleSelectStudioQuest}
            className="w-full text-left p-4 rounded-2xl bg-surface-container-high/60 hover:bg-surface-container-high border border-outline-variant/30 hover:border-tertiary/50 transition-all flex items-start gap-3.5 group active:scale-[0.99] shadow-sm"
          >
            <div className="w-11 h-11 rounded-xl bg-tertiary/15 text-tertiary border border-tertiary/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">construction</span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-on-surface group-hover:text-tertiary transition-colors">
                  3. 에이전트 제작 가이드
                </h3>
                <span className="text-[11px] font-mono text-tertiary font-semibold">스튜디오 12단계 실습</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                스튜디오 캔버스에서 Input ➔ LLM ➔ Output 노드를 직접 배치하고 연결하여 첫 에이전트를 완성합니다.
              </p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 transition-all active:scale-95"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
