import React, { useEffect, useState, useRef } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const SpotlightTour: React.FC = () => {
  const {
    activeGuide,
    currentStep,
    tourPage,
    tourStepIndex,
    totalStepsForCurrentPage,
    nextTourStep,
    prevTourStep,
    endGuide,
  } = useOnboarding();

  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const targetElementRef = useRef<HTMLElement | null>(null);

  // 1. 각 페이지 설명 시 스크롤 할 수 없게 막기 (overflow hidden + wheel/touchmove 차단)
  useEffect(() => {
    if (activeGuide !== 'page_tour') return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const preventScroll = (e: Event) => {
      // 툴팁 내부 스크롤이 아니라면 기본 스크롤 차단
      const target = e.target as HTMLElement | null;
      if (target && target.closest('.onboarding-tooltip-card')) {
        return;
      }
      e.preventDefault();
    };

    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
    };
  }, [activeGuide]);

  // 2. 현재 스텝의 타겟 DOM 요소 위치 추적
  useEffect(() => {
    if (activeGuide !== 'page_tour' || !currentStep || currentStep.isIntro || !currentStep.targetSelector) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
      if (el) {
        targetElementRef.current = el;
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });

        // templates, learn, nodes 페이지 설명 및 상단 헤더 설명 시 스크롤을 무조건 최상단(top: 0)으로 고정
        const shouldScrollToTop =
          tourPage === 'templates' ||
          tourPage === 'learn' ||
          tourPage === 'nodes' ||
          currentStep.id === 'gnb-header' ||
          currentStep.targetSelector.includes('gnb-header');

        if (shouldScrollToTop) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const timer = setTimeout(updateRect, 150);
    const interval = setInterval(updateRect, 500);

    window.addEventListener('resize', updateRect);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener('resize', updateRect);
    };
  }, [activeGuide, currentStep]);

  if (activeGuide !== 'page_tour' || !currentStep) {
    return null;
  }

  const isIntro = Boolean(currentStep.isIntro || !currentStep.targetSelector);
  const isFirst = tourStepIndex === 0;
  const isLast = tourStepIndex === totalStepsForCurrentPage - 1;

  // 3. 툴팁 위치 스마트 계산 (하이라이트 타겟과 절대 겹치지 않는 비중첩 배치 보장)
  const getTooltipStyle = (): React.CSSProperties => {
    if (isIntro || !targetRect) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '420px',
        maxWidth: '90vw',
      };
    }

    const PADDING = 18;
    const tooltipWidth = 360;
    const tooltipHeight = 210;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const screenTop = targetRect.top - window.scrollY;
    const screenBottom = screenTop + targetRect.height;
    const screenLeft = targetRect.left - window.scrollX;
    const screenRight = screenLeft + targetRect.width;

    // A. [Nodes, Templates, Learn] 좌측 네비게이션 바 설명 시 ➔ 툴팁은 타겟 바깥인 우측 본문 상단에 고정
    if (
      currentStep.id === 'templates-categories' ||
      currentStep.id === 'learn-topics' ||
      currentStep.id === 'nodes-categories'
    ) {
      const pinLeft = Math.min(screenRight + PADDING, viewportWidth - tooltipWidth - 24);
      return {
        position: 'fixed',
        top: '88px',
        left: `${pinLeft}px`,
        width: `${tooltipWidth}px`,
      };
    }

    // B. [Nodes, Templates, Learn] 우측 본문 전체 설명 시 ➔ 툴팁은 타겟 바깥인 좌측 사이드바 상단에 고정
    if (
      currentStep.id === 'templates-grid' ||
      currentStep.id === 'learn-content' ||
      currentStep.id === 'nodes-detail'
    ) {
      return {
        position: 'fixed',
        top: '88px',
        left: '24px',
        width: `${tooltipWidth}px`,
      };
    }

    // C. 상단 전체 헤더 설명 시 ➔ 툴팁은 헤더 바깥인 하단 중앙에 고정
    if (currentStep.id === 'gnb-header' || currentStep.targetSelector.includes('gnb-header')) {
      const pinLeft = Math.max(24, Math.min(viewportWidth / 2 - tooltipWidth / 2, viewportWidth - tooltipWidth - 24));
      return {
        position: 'fixed',
        top: `${screenBottom + PADDING}px`,
        left: `${pinLeft}px`,
        width: `${tooltipWidth}px`,
      };
    }

    // D. 일반 타겟: 4방향(상/하/좌/우) 가용 공간 분석하여 타겟과 절대 겹치지 않는 방향 선택
    const spaceBelow = viewportHeight - screenBottom;
    const spaceAbove = screenTop;
    const spaceRight = viewportWidth - screenRight;
    const spaceLeft = screenLeft;

    let placement: 'top' | 'bottom' | 'left' | 'right' = currentStep.position || 'bottom';

    // 해당 방향에 공간이 부족하면 겹치지 않도록 충분한 공간이 있는 방향으로 자동 전환
    if (placement === 'bottom' && spaceBelow < tooltipHeight + PADDING + 10) {
      if (spaceAbove >= tooltipHeight + PADDING + 10) {
        placement = 'top';
      } else if (spaceLeft >= tooltipWidth + PADDING + 10) {
        placement = 'left';
      } else if (spaceRight >= tooltipWidth + PADDING + 10) {
        placement = 'right';
      }
    } else if (placement === 'top' && spaceAbove < tooltipHeight + PADDING + 10) {
      if (spaceBelow >= tooltipHeight + PADDING + 10) {
        placement = 'bottom';
      } else if (spaceLeft >= tooltipWidth + PADDING + 10) {
        placement = 'left';
      } else if (spaceRight >= tooltipWidth + PADDING + 10) {
        placement = 'right';
      }
    } else if (placement === 'right' && spaceRight < tooltipWidth + PADDING + 10) {
      if (spaceLeft >= tooltipWidth + PADDING + 10) {
        placement = 'left';
      } else if (spaceAbove >= tooltipHeight + PADDING + 10) {
        placement = 'top';
      } else {
        placement = 'bottom';
      }
    } else if (placement === 'left' && spaceLeft < tooltipWidth + PADDING + 10) {
      if (spaceRight >= tooltipWidth + PADDING + 10) {
        placement = 'right';
      } else if (spaceAbove >= tooltipHeight + PADDING + 10) {
        placement = 'top';
      } else {
        placement = 'bottom';
      }
    }

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'bottom':
        top = screenBottom + PADDING;
        left = screenLeft + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'top':
        top = screenTop - tooltipHeight - PADDING;
        left = screenLeft + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'right':
        top = screenTop + targetRect.height / 2 - tooltipHeight / 2;
        left = screenRight + PADDING;
        break;
      case 'left':
        top = screenTop + targetRect.height / 2 - tooltipHeight / 2;
        left = screenLeft - tooltipWidth - PADDING;
        break;
    }

    // 화면 경계 안전 보정
    top = Math.max(76, Math.min(top, viewportHeight - tooltipHeight - 16));
    left = Math.max(16, Math.min(left, viewportWidth - tooltipWidth - 16));

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
    };
  };

  return (
    <div className="fixed inset-0 z-[9980] pointer-events-none select-none">
      {/* 하이라이트 바깥 영역 투명도가 리드미컬하게 깜빡이는 커스텀 키프레임 (1.8초 주기) */}
      <style>{`
        @keyframes overlayBreathe {
          0%, 100% {
            opacity: 0.70;
          }
          50% {
            opacity: 0.25;
          }
        }
        .animate-overlay-breathe {
          animation: overlayBreathe 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* Dimmed Overlay with Rounded SVG Mask (브라이트 모드에서도 네모난 모서리가 새어나오지 않음) */}
      {targetRect && !isIntro ? (
        <svg
          className="fixed inset-0 w-full h-full pointer-events-auto transition-all duration-300 ease-out animate-overlay-breathe"
          style={{ zIndex: 9980 }}
          onClick={(e) => e.stopPropagation()}
        >
          <defs>
            <mask id="spotlight-rounded-mask">
              {/* 전체 영역을 흰색으로 채워 오버레이 표시 */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {/* 타겟 영역을 둥근 직사각형(rx=16, ry=16) 검은색으로 파내어 완벽한 라운딩 구멍 생성 */}
              <rect
                x={targetRect.left - window.scrollX - 6}
                y={targetRect.top - window.scrollY - 6}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx="16"
                ry="16"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.65)"
            mask="url(#spotlight-rounded-mask)"
          />
        </svg>
      ) : (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-[2px] pointer-events-auto" />
      )}

      {/* Target Focus Ring (깜빡이지 않고 선명하며 안정적인 둥근 포커스 테두리) */}
      {targetRect && !isIntro && (
        <div
          className="fixed rounded-2xl border-2 border-primary shadow-[0_0_20px_rgba(77,142,255,0.65)] pointer-events-none transition-all duration-300 ease-out"
          style={{
            top: `${targetRect.top - window.scrollY - 6}px`,
            left: `${targetRect.left - window.scrollX - 6}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
          }}
        />
      )}

      {/* Non-Clickable Shield Over Target: 가이드 중 임의 링크 클릭 방지 */}
      {targetRect && !isIntro && (
        <div
          className="fixed pointer-events-auto cursor-default z-[9985]"
          style={{
            top: `${targetRect.top - window.scrollY - 6}px`,
            left: `${targetRect.left - window.scrollX - 6}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        />
      )}

      {/* Tooltip Card (Intro일 경우 화면 중앙에 간략한 소개 모달, 그 외에는 타겟 주변 고정 툴팁) */}
      <div
        style={getTooltipStyle()}
        className={`onboarding-tooltip-card pointer-events-auto rounded-3xl bg-surface-container-low/95 border border-outline-variant/50 shadow-2xl backdrop-blur-xl z-[9990] flex flex-col gap-3.5 animate-in fade-in zoom-in-95 duration-200 ${
          isIntro ? 'p-6' : 'p-5'
        }`}
      >
        {/* Tooltip Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {isIntro ? 'PAGE GUIDE' : `STEP ${tourStepIndex} / ${totalStepsForCurrentPage - 1}`}
            </span>
            <span className="text-xs text-on-surface-variant font-mono uppercase">
              {tourPage}
            </span>
          </div>
          <button
            type="button"
            onClick={endGuide}
            className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
            title="가이드 종료"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Intro Visual Icon if isIntro */}
        {isIntro && (
          <div className="flex items-center justify-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 via-primary-container/30 to-secondary/20 border border-primary/30 flex items-center justify-center text-primary shadow-lg shadow-primary/15 animate-bounce">
              <span className="material-symbols-outlined text-[30px]">explore</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className={`flex flex-col gap-1.5 ${isIntro ? 'text-center' : ''}`}>
          <h3 className={`font-bold text-on-surface leading-tight ${isIntro ? 'text-lg' : 'text-sm'}`}>
            {currentStep.title}
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-2.5 border-t border-outline-variant/20 mt-1">
          <div>
            {!isIntro && !isFirst && (
              <button
                type="button"
                onClick={prevTourStep}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
              >
                이전
              </button>
            )}
            {isIntro && (
              <button
                type="button"
                onClick={endGuide}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
              >
                건너뛰기
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (isLast) {
                  endGuide();
                } else {
                  nextTourStep();
                }
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-on-primary hover:brightness-110 shadow-md shadow-primary/20 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>{isIntro ? '가이드 시작하기' : isLast ? '완료' : '다음'}</span>
              <span className="material-symbols-outlined text-[14px]">
                {isLast ? 'check' : 'arrow_forward'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
