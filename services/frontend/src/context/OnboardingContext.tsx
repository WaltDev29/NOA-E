import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { PAGE_TOUR_STEPS, type TourPageKey, type TourStep } from '../components/onboarding/tourSteps';

export type ActiveGuideType = 'none' | 'overview' | 'page_tour' | 'studio_quest';

interface OnboardingContextType {
  activeGuide: ActiveGuideType;
  tourPage: TourPageKey;
  tourStepIndex: number;
  currentStep: TourStep | null;
  totalStepsForCurrentPage: number;
  isMockMode: boolean;
  studioQuestStep: number; // 1 ~ 9
  
  // Controls
  startOverviewGuide: () => void;
  startPageTour: (page?: TourPageKey) => void;
  checkAndTriggerPageTour: (page: TourPageKey) => void;
  startStudioQuest: () => void;
  resetPageTours: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  goToTourStep: (index: number) => void;
  setTourPage: (page: TourPageKey) => void;
  setStudioQuestStep: (step: number) => void;
  nextStudioQuestStep: () => void;
  endGuide: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY_SEEN_OVERVIEW = 'noa_e_seen_service_overview';
const STORAGE_KEY_TRIGGER_ONBOARDING = 'noa_e_trigger_onboarding';

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeGuide, setActiveGuide] = useState<ActiveGuideType>('none');
  const [tourPage, setTourPage] = useState<TourPageKey>('main');
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [studioQuestStep, setStudioQuestStep] = useState(1);

  // 회원가입 직후 또는 첫 방문 체크
  useEffect(() => {
    // 1. 회원가입 완료 직후 플래그 확인 (최우선)
    const shouldTriggerAfterRegister = localStorage.getItem(STORAGE_KEY_TRIGGER_ONBOARDING);
    if (shouldTriggerAfterRegister === 'true') {
      localStorage.removeItem(STORAGE_KEY_TRIGGER_ONBOARDING);
      setActiveGuide('overview');
      return;
    }

    // 2. 서비스 오버뷰를 본 적 없는 첫 방문자
    const hasSeenOverview = localStorage.getItem(STORAGE_KEY_SEEN_OVERVIEW);
    if (!hasSeenOverview) {
      setActiveGuide('overview');
    }
  }, []);

  // 현재 페이지의 투어 단계 목록
  const currentSteps = PAGE_TOUR_STEPS[tourPage] || [];
  const currentStep = activeGuide === 'page_tour' && currentSteps[tourStepIndex] ? currentSteps[tourStepIndex] : null;
  const totalStepsForCurrentPage = currentSteps.length;

  // 가이드 실행 중에는 내 에이전트 목록 등의 더미 데이터를 노출하는 Mock Mode 활성화
  const isMockMode = activeGuide !== 'none';

  const startOverviewGuide = useCallback(() => {
    setActiveGuide('overview');
  }, []);

  const startPageTour = useCallback((page: TourPageKey = 'main') => {
    setTourPage(page);
    setTourStepIndex(0);
    setActiveGuide('page_tour');
  }, []);

  // 각 페이지에 접속했을 때 아직 본 적이 없다면 개별적으로 투어 시작
  const checkAndTriggerPageTour = useCallback((page: TourPageKey) => {
    setActiveGuide((currentActive) => {
      if (currentActive !== 'none') return currentActive;
      const key = `noa_e_seen_tour_${page}`;
      const hasSeen = localStorage.getItem(key);
      if (!hasSeen) {
        setTourPage(page);
        setTourStepIndex(0);
        return 'page_tour';
      }
      return currentActive;
    });
  }, []);

  const startStudioQuest = useCallback(() => {
    setStudioQuestStep(1);
    setActiveGuide('studio_quest');
  }, []);

  const nextTourStep = useCallback(() => {
    if (tourStepIndex < currentSteps.length - 1) {
      setTourStepIndex((prev) => prev + 1);
    }
  }, [tourStepIndex, currentSteps.length]);

  const prevTourStep = useCallback(() => {
    if (tourStepIndex > 0) {
      setTourStepIndex((prev) => prev - 1);
    }
  }, [tourStepIndex]);

  const goToTourStep = useCallback((index: number) => {
    setTourStepIndex(index);
  }, []);

  const nextStudioQuestStep = useCallback(() => {
    setStudioQuestStep((prev) => Math.min(prev + 1, 9));
  }, []);

  const resetPageTours = useCallback(() => {
    localStorage.removeItem('noa_e_seen_tour_main');
    localStorage.removeItem('noa_e_seen_tour_nodes');
    localStorage.removeItem('noa_e_seen_tour_templates');
    localStorage.removeItem('noa_e_seen_tour_learn');
  }, []);

  const endGuide = useCallback(() => {
    if (activeGuide === 'page_tour') {
      localStorage.setItem(`noa_e_seen_tour_${tourPage}`, 'true');
    } else if (activeGuide === 'overview') {
      localStorage.setItem(STORAGE_KEY_SEEN_OVERVIEW, 'true');
    }
    setActiveGuide('none');
  }, [activeGuide, tourPage]);

  return (
    <OnboardingContext.Provider
      value={{
        activeGuide,
        tourPage,
        tourStepIndex,
        currentStep,
        totalStepsForCurrentPage,
        isMockMode,
        studioQuestStep,
        startOverviewGuide,
        startPageTour,
        checkAndTriggerPageTour,
        startStudioQuest,
        resetPageTours,
        nextTourStep,
        prevTourStep,
        goToTourStep,
        setTourPage,
        setStudioQuestStep,
        nextStudioQuestStep,
        endGuide,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
