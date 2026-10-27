import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Link } from '../router/Router';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useOnboarding } from '../context/OnboardingContext';
import { GuideSelectModal } from '../components/onboarding/GuideSelectModal';
import { DUMMY_ONBOARDING_WORKFLOWS } from '../components/onboarding/dummyOnboardingData';
import { workflowApi } from '../services/workflowApi';
import type { WorkflowDetail } from '../services/workflowApi';

export const MyPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { showAlert, showConfirm } = useModal();
  const { isMockMode } = useOnboarding();
  const [workflows, setWorkflows] = useState<WorkflowDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isGuideSelectOpen, setIsGuideSelectOpen] = useState(false);

  const displayedWorkflows = (isMockMode && workflows.length === 0) ? DUMMY_ONBOARDING_WORKFLOWS : workflows;

  const loadWorkflows = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const data = await workflowApi.getMyWorkflows(user.id);
      setWorkflows(data);
    } catch (e) {
      console.error('Failed to load my workflows:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, [user?.id]);

  useEffect(() => {
    const handleGlobalClick = () => setOpenMenuId(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleDuplicate = async (workflowId: string) => {
    setOpenMenuId(null);
    if (!user?.id) return;
    try {
      const duplicated = await workflowApi.duplicate(workflowId, user.id);
      setWorkflows((prev) => [duplicated, ...prev]);
    } catch (e) {
      console.error('Failed to duplicate workflow:', e);
      showAlert('에이전트 복제 중 오류가 발생했습니다.', { type: 'error' });
    }
  };

  const handleDelete = async (workflowId: string, title: string) => {
    setOpenMenuId(null);
    if (!user?.id) return;

    const confirmed = await showConfirm(`'${title}' 에이전트를 정말 삭제하시겠습니까?`, {
      title: '에이전트 삭제',
      type: 'warning',
      isDanger: true,
      confirmText: '삭제',
      cancelText: '취소',
    });
    if (!confirmed) {
      return;
    }

    try {
      await workflowApi.delete(workflowId, user.id);
      setWorkflows((prev) => prev.filter((w) => w.id !== workflowId));
    } catch (e) {
      console.error('Failed to delete workflow:', e);
      showAlert('에이전트 삭제 중 오류가 발생했습니다.', { type: 'error' });
    }
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      <Header />

      <main className="w-full pt-16 bg-background min-h-screen flex-1 flex flex-col">
        <div className="w-full max-w-6xl mx-auto px-6 lg:px-8 py-space-lg flex flex-col gap-6">
          {/* Top Header */}
          <div className="flex items-center justify-between">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">
              마이페이지
            </h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsGuideSelectOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-primary border border-primary/30 hover:border-primary/60 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">explore</span>
                <span>가이드 다시보기</span>
              </button>
              <button
                type="button"
                onClick={logout}
                className="px-4 py-2 rounded-xl bg-error-container/20 text-error hover:bg-error-container/40 border border-error/30 text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>로그아웃</span>
              </button>
            </div>
          </div>

          {/* 1. User Profile Card */}
          <div className="rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary-container to-secondary-container flex items-center justify-center text-white shadow-[0_0_16px_rgba(77,142,255,0.4)] shrink-0 font-bold text-2xl">
                {user?.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    {user?.name || '사용자'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold border border-primary/20">
                    {user?.role || 'USER'}
                  </span>
                </div>
                <span className="text-xs text-outline mt-0.5">{user?.email}</span>
                {user?.phone_number && (
                  <span className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">call</span>
                    <span>{user.phone_number}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs text-on-surface-variant text-right hidden md:block">
                <div>가입일: {user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '-'}</div>
                <div className="text-outline text-[11px]">인증 방식: {user?.auth_provider || 'LOCAL'}</div>
              </div>
            </div>
          </div>

          {/* 2. 환경 설정 (테마 모드 설정) */}
          <div className="rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 p-6 flex flex-col gap-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">palette</span>
                  <span>화면 테마 설정</span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  NOA-E 서비스의 인터페이스 테마(다크/화이트 모드)를 선택할 수 있습니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
              {/* Dark Theme Card */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-xl border text-left flex items-center gap-4 transition-all ${
                  theme === 'dark'
                    ? 'bg-surface-container-high border-primary ring-2 ring-primary/40 shadow-[0_0_14px_rgba(77,142,255,0.25)]'
                    : 'bg-surface-container-lowest/60 border-outline-variant/30 hover:border-outline-variant/60'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#0b1326] border border-[#2d3449] flex items-center justify-center text-[#adc6ff] shrink-0 shadow-inner">
                  <span className="material-symbols-outlined text-[24px]">dark_mode</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-on-surface">다크 테마 (Dark Mode)</span>
                    {theme === 'dark' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_6px_rgba(77,142,255,0.8)]" />
                    )}
                  </div>
                  <span className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                    어두운 배경과 편안한 시각적 몰입감
                  </span>
                </div>
              </button>

              {/* Light Theme Card */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 rounded-xl border text-left flex items-center gap-4 transition-all ${
                  theme === 'light'
                    ? 'bg-surface-container-high border-primary ring-2 ring-primary/40 shadow-[0_0_14px_rgba(37,99,235,0.25)]'
                    : 'bg-surface-container-lowest/60 border-outline-variant/30 hover:border-outline-variant/60'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#ffffff] border border-[#e2e8f0] flex items-center justify-center text-[#2563eb] shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">light_mode</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-on-surface">화이트 테마 (Light Mode)</span>
                    {theme === 'light' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_6px_rgba(37,99,235,0.8)]" />
                    )}
                  </div>
                  <span className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                    깔끔하고 화사한 밝은 배경 모드
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* 3. My Agent Projects Section */}
          <div className="rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 p-6 flex flex-col gap-5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
                <span>내 에이전트 프로젝트</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-xs text-primary font-mono font-bold">
                  {displayedWorkflows.length}
                </span>
              </h3>
              <Link
                to="/noa-e/studio"
                className="px-3.5 py-1.5 rounded-xl bg-primary-container hover:bg-primary text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>새 에이전트 만들기</span>
              </Link>
            </div>

            {/* List or Empty State */}
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-2 text-outline">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-xs">에이전트 목록을 불러오는 중...</span>
              </div>
            ) : displayedWorkflows.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-3 border border-dashed border-outline-variant/40 rounded-xl bg-surface-container-lowest/30">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline">
                  <span className="material-symbols-outlined text-[28px]">smart_toy</span>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-on-surface">아직 제작된 에이전트가 없습니다</p>
                  <p className="text-xs text-on-surface-variant">스튜디오에서 노드를 연결하여 첫 번째 AI Agent를 만들어보세요!</p>
                </div>
                <Link
                  to="/noa-e/studio"
                  className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-inverse-primary to-primary-container text-on-surface text-xs font-semibold shadow-md hover:brightness-110 active:scale-95 transition-all"
                >
                  에이전트 스튜디오로 이동
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayedWorkflows.map((agent) => (
                  <div
                    key={agent.id}
                    className="rounded-2xl border border-outline-variant/30 bg-surface-container-low/70 hover:border-primary/50 overflow-hidden flex flex-col group transition-all duration-200 hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm relative"
                  >
                    {/* More Menu (...) Button & Dropdown */}
                    <div className="absolute top-3 right-3 z-30">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenMenuId((prev) => (prev === agent.id ? null : agent.id));
                        }}
                        title="더보기"
                        className="w-8 h-8 rounded-lg bg-surface-container/80 hover:bg-surface-bright text-outline hover:text-on-surface border border-outline-variant/30 transition-all flex items-center justify-center opacity-80 group-hover:opacity-100 backdrop-blur-md active:scale-95 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === agent.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 mt-1.5 w-32 rounded-xl bg-surface-container-high/95 border border-outline-variant/40 shadow-xl backdrop-blur-xl p-1.5 z-40 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150"
                        >
                          <button
                            type="button"
                            onClick={() => handleDuplicate(agent.id)}
                            className="w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-on-surface hover:bg-surface-bright flex items-center gap-2 transition-colors text-left"
                          >
                            <span className="material-symbols-outlined text-[15px] text-primary">content_copy</span>
                            <span>복제하기</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(agent.id, agent.title)}
                            className="w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-error hover:bg-error-container/30 flex items-center gap-2 transition-colors text-left"
                          >
                            <span className="material-symbols-outlined text-[15px]">delete</span>
                            <span>삭제하기</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <Link
                      to={`/noa-e/studio?id=${agent.id}`}
                      className="flex flex-col flex-1"
                    >
                      {/* 1. 에이전트 구조 시각화 비주얼 (홈페이지와 동일 스타일) */}
                      <div className="w-full h-36 bg-[#060e20] relative flex items-center justify-center border-b border-outline-variant/20 overflow-hidden">
                        <div
                          className="absolute inset-0 opacity-20"
                          style={{
                            backgroundImage: `radial-gradient(#4d8eff 1px, transparent 1px)`,
                            backgroundSize: '14px 14px',
                          }}
                        />
                        <div className="flex items-center gap-3 relative z-10">
                          <span className="px-2.5 py-1 rounded-md bg-[#171f33] border border-primary/40 text-[10px] text-primary font-mono font-bold">
                            {agent.graph_data?.nodes?.length || 0} NODES
                          </span>
                          <span className="material-symbols-outlined text-outline text-[16px]">arrow_forward</span>
                          <span className="px-2.5 py-1 rounded-md bg-[#222a3d] border border-secondary/40 text-[10px] text-secondary font-mono font-bold">
                            {agent.graph_data?.edges?.length || 0} EDGES
                          </span>
                        </div>
                      </div>

                      {/* 2. 에이전트 정보 */}
                      <div className="p-4 flex flex-col justify-between flex-1">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_6px_rgba(77,142,255,0.8)]" />
                            <span className="text-[11px] text-outline">
                              최종 수정: {new Date(agent.updated_at).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm sm:text-base text-on-surface group-hover:text-primary transition-colors pr-6 truncate">
                            {agent.title}
                          </h4>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-outline-variant/15 flex items-center justify-between text-xs text-primary font-semibold">
                          <span>스튜디오에서 편집</span>
                          <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                            arrow_forward
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <GuideSelectModal isOpen={isGuideSelectOpen} onClose={() => setIsGuideSelectOpen(false)} />
    </div>
  );
};
