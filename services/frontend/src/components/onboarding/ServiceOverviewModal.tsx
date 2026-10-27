import React, { useState } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';

import homeImg from '../../assets/home_page.png';
import studioImg from '../../assets/studio_page.png';
import nodesImg from '../../assets/nodes_page.png';
import templatesImg from '../../assets/templates_page.png';
import learnImg from '../../assets/learn_page.png';

interface SlideContent {
  title: string;
  badge: string;
  image: string;
  oneLiner: string;
}

const SLIDES: SlideContent[] = [
  {
    title: 'NOA-E 플랫폼에 오신 것을 환영합니다!',
    badge: 'HOME',
    image: homeImg,
    oneLiner: '코딩 없이 노드를 연결하여 강력한 나만의 AI 에이전트를 설계하고 관리하세요.',
  },
  {
    title: 'Studio: 시각적 워크플로우 제작기',
    badge: 'STUDIO',
    image: studioImg,
    oneLiner: '무한한 캔버스 위에서 노드를 자유롭게 배치하고 선을 이어 파이프라인을 완성합니다.',
  },
  {
    title: 'Nodes: 노드 라이브러리 및 명세서',
    badge: 'NODES',
    image: nodesImg,
    oneLiner: '에이전트에 탑재할 수 있는 다양한 AI 모델, 검색·계산 도구, 입출력 노드의 명세를 확인합니다.',
  },
  {
    title: 'Templates: 검증된 에이전트 템플릿',
    badge: 'TEMPLATES',
    image: templatesImg,
    oneLiner: '실전에 즉시 활용 가능한 다양한 추천 워크플로우를 클릭 한 번으로 불러와 바로 실행합니다.',
  },
  {
    title: 'Learn: 차세대 AI 에이전트 학습 센터',
    badge: 'LEARN',
    image: learnImg,
    oneLiner: '에이전트의 사고 흐름(ReAct)과 도구 활용법, 고성능 프롬프트 설계 기법을 체계적으로 학습합니다.',
  },
];

export const ServiceOverviewModal: React.FC = () => {
  const { activeGuide, endGuide, startPageTour } = useOnboarding();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  if (activeGuide !== 'overview') return null;

  const slide = SLIDES[currentSlideIndex];
  const isFirstSlide = currentSlideIndex === 0;
  const isLastSlide = currentSlideIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      endGuide();
      startPageTour('main');
    } else {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstSlide) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    endGuide();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="w-full max-w-5xl max-h-[92vh] h-[820px] rounded-3xl bg-surface-container-low/95 border border-outline-variant/50 shadow-2xl backdrop-blur-2xl flex flex-col justify-between overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-8 pt-6 pb-2 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono tracking-wider font-bold px-3.5 py-1 rounded-full bg-surface-container-high text-primary border border-primary/20 shadow-sm">
              {slide.badge}
            </span>
            <span className="text-sm text-on-surface-variant font-mono font-medium">
              ({currentSlideIndex + 1} / {SLIDES.length})
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            title="가이드 건너뛰기"
            type="button"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Slide Graphic/Image (대형 스크린샷 뷰어) */}
        <div className="px-8 py-2 flex-1 min-h-0 flex items-center justify-center">
          <div className="w-full h-full max-h-[520px] rounded-2xl overflow-hidden border border-outline-variant/40 bg-surface-container-lowest/90 shadow-xl flex items-center justify-center p-1.5">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-contain object-top rounded-xl transition-transform duration-300 hover:scale-[1.01]"
              loading="eager"
            />
          </div>
        </div>

        {/* Content Body: Title + 딱 한 줄 소개 (제목 위치 고정 & 텍스트 크기 확대) */}
        <div className="px-8 pt-3 pb-2 h-24 flex flex-col items-center justify-start text-center shrink-0">
          <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight h-9 leading-9 flex items-center justify-center shrink-0">
            {slide.title}
          </h2>
          <p className="mt-2 text-base md:text-lg text-on-surface-variant font-medium leading-relaxed max-w-2xl text-center">
            {slide.oneLiner}
          </p>
        </div>

        {/* Slide Dots Indicator */}
        <div className="flex items-center justify-center gap-2.5 py-1.5 shrink-0">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlideIndex
                  ? 'w-10 bg-primary shadow-sm shadow-primary/40'
                  : 'w-2.5 bg-outline-variant/40 hover:bg-outline-variant'
              }`}
              title={`슬라이드 ${idx + 1}`}
              type="button"
            />
          ))}
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 bg-surface-container/40 border-t border-outline-variant/30 flex items-center justify-between shrink-0">
          <div>
            {!isFirstSlide ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-5 py-2.5 rounded-xl text-base font-semibold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                이전
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSkip}
                className="px-5 py-2.5 rounded-xl text-base font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                건너뛰기
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="px-7 py-3 rounded-xl text-base font-bold bg-primary text-on-primary hover:brightness-110 shadow-lg shadow-primary/25 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span>{isLastSlide ? '홈페이지 둘러보기 시작' : '다음'}</span>
            <span className="material-symbols-outlined text-[20px]">
              {isLastSlide ? 'explore' : 'arrow_forward'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
