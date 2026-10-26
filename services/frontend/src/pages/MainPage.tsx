import React, { useRef, useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Link } from '../router/Router';
import { TEMPLATES_DATA } from './TemplatesPage';
import { useAuth } from '../context/AuthContext';
import { workflowApi } from '../services/workflowApi';
import type { WorkflowDetail } from '../services/workflowApi';

export const MainPage: React.FC = () => {
  const { user } = useAuth();
  const [myWorkflows, setMyWorkflows] = useState<WorkflowDetail[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const hasDragged = useRef(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const loadWorkflows = async () => {
    if (!user?.id) {
      setMyWorkflows([]);
      return;
    }
    try {
      setIsLoadingWorkflows(true);
      const data = await workflowApi.getMyWorkflows(user.id);
      setMyWorkflows(data);
    } catch (err) {
      console.error('Failed to load my workflows:', err);
    } finally {
      setIsLoadingWorkflows(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, [user?.id]);

  const handleDeleteWorkflow = async (e: React.MouseEvent, workflowId: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user?.id) return;
    if (!window.confirm(`'${title}' 에이전트를 정말 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await workflowApi.delete(workflowId, user.id);
      setMyWorkflows((prev) => prev.filter((w) => w.id !== workflowId));
    } catch (err) {
      console.error('Failed to delete workflow:', err);
      alert('에이전트 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    isMouseDown.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftStart.current = scrollContainerRef.current.scrollLeft;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Drag speed multiplier
    if (Math.abs(walk) > 6) {
      hasDragged.current = true;
    }
    scrollContainerRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isMouseDown.current = false;
    setIsDragging(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      <Header />

      <main className="w-full pt-16 bg-background min-h-screen flex-1 flex flex-col">
        <div className="flex flex-col w-full">
          <div className="w-full max-w-[1560px] mx-auto px-6 lg:px-12 py-space-lg">
            {/* 1. Hero Section */}
            <section className="relative pt-space-md pb-space-lg w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
                {/* Left: Text Content */}
                <div className="lg:col-span-5 xl:col-span-5 flex flex-col items-start z-10">
                  {/* Top Pill Badge */}
                  <div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container-high/70 backdrop-blur-md shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                    <span className="font-label-badge text-label-badge text-primary tracking-wide">
                      Node로 배우고, 직접 만들고, 경험하는
                    </span>
                  </div>

                  {/* Main Headline */}
                  <h1 className="mt-space-md font-display-hero text-display-hero text-on-surface tracking-tight">
                    나만의 AI Agent,<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-container to-secondary">
                      NOA-E
                    </span>
                  </h1>

                  {/* English Platform Subtitle */}
                  <p className="mt-space-xs font-headline-sm text-headline-sm text-on-surface-variant font-medium tracking-wide">
                    Node-Oriented Agent - Education
                  </p>

                  {/* Core Description */}
                  <p className="mt-space-md font-body-lg text-body-lg text-outline leading-relaxed max-w-xl">
                    다양한 Node들을 연결하여 AI Agent를 직접 설계하고 제작, 실행, 체험할 수 있는 노드 기반 차세대 교육 플랫폼입니다.
                  </p>

                  {/* Action Buttons */}
                  <div className="mt-space-xl flex flex-wrap items-center gap-space-md">
                    <Link
                      to="/noa-e/studio"
                      className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container hover:brightness-110 text-white font-headline-sm text-headline-sm font-semibold shadow-sm ring-1 ring-inset ring-white/15 overflow-hidden hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center leading-none"
                    >
                      시작하기
                    </Link>
                    <Link
                      to="/noa-e/learn"
                      className="px-space-lg py-2.5 rounded-lg bg-surface-container-high text-on-surface font-body-md text-body-md hover:bg-surface-variant shadow-sm transition-all flex items-center gap-space-xs"
                    >
                      <span className="material-symbols-outlined text-[18px] text-tertiary">school</span>
                      <span>기초 지식 학습하기</span>
                    </Link>
                  </div>
                </div>

                {/* Right: Isometric Visual Composition (4 Node Organic Layout) */}
                <div className="lg:col-span-7 xl:col-span-7 relative w-full h-[440px] flex items-center justify-center select-none">
                  {/* Background Radiant Grid Glow */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-surface-container-low/40 via-surface-container/60 to-primary-container/10 rounded-2xl pointer-events-none" />

                  {/* Dynamic SVG Network Diagram with 4 Nodes */}
                  <svg
                    className="relative z-10 w-full h-full max-w-[640px] drop-shadow-[0_16px_36px_rgba(0,0,0,0.65)]"
                    fill="none"
                    viewBox="0 0 660 420"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient gradientUnits="userSpaceOnUse" id="lineGrad1" x1="120" x2="270" y1="105" y2="210">
                        <stop stopColor="#4d8eff" />
                        <stop offset="1" stopColor="#acedff" />
                      </linearGradient>
                      <linearGradient gradientUnits="userSpaceOnUse" id="lineGrad2" x1="530" x2="390" y1="105" y2="210">
                        <stop stopColor="#571bc1" />
                        <stop offset="1" stopColor="#4d8eff" />
                      </linearGradient>
                      <linearGradient gradientUnits="userSpaceOnUse" id="lineGrad3" x1="530" x2="390" y1="295" y2="210">
                        <stop stopColor="#4cd7f6" />
                        <stop offset="1" stopColor="#4d8eff" />
                      </linearGradient>
                      <linearGradient gradientUnits="userSpaceOnUse" id="lineGrad4" x1="120" x2="270" y1="295" y2="210">
                        <stop stopColor="#4d8eff" />
                        <stop offset="1" stopColor="#c4abff" />
                      </linearGradient>
                      <radialGradient cx="50%" cy="50%" id="botAura" r="50%">
                        <stop offset="0%" stopColor="#4d8eff" stopOpacity="0.55" />
                        <stop offset="100%" stopColor="#0b1326" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Edge Connection Curves */}
                    <path d="M 120 105 C 190 105, 200 200, 270 210" stroke="url(#lineGrad1)" strokeDasharray="6 4" strokeOpacity="0.85" strokeWidth="2.5" />
                    <path d="M 530 105 C 460 105, 450 200, 390 210" stroke="url(#lineGrad2)" strokeDasharray="6 4" strokeOpacity="0.85" strokeWidth="2.5" />
                    <path d="M 530 295 C 460 295, 450 220, 390 210" stroke="url(#lineGrad3)" strokeDasharray="6 4" strokeOpacity="0.85" strokeWidth="2.5" />
                    <path d="M 120 295 C 190 295, 200 220, 270 210" stroke="url(#lineGrad4)" strokeDasharray="6 4" strokeOpacity="0.85" strokeWidth="2.5" />

                    {/* Center Aura */}
                    <circle cx="330" cy="210" fill="url(#botAura)" r="100" />

                    {/* Center AI Bot Node Capsule (Center: 330, 210) */}
                    <g
                      className="cursor-default transition-all duration-300 ease-out hover:scale-[1.1] hover:brightness-125 hover:drop-shadow-[0_0_20px_rgba(77,142,255,0.6)]"
                      style={{ transformOrigin: '330px 210px' }}
                    >
                      <rect fill="#171f33" height="100" rx="30" stroke="#4d8eff" strokeWidth="2" width="120" x="270" y="160" />
                      <rect fill="#060e20" height="50" rx="16" width="86" x="287" y="178" />
                      <circle cx="312" cy="203" fill="#4cd7f6" r="8" />
                      <circle cx="314" cy="201" fill="#ffffff" r="2.5" />
                      <circle cx="348" cy="203" fill="#4cd7f6" r="8" />
                      <circle cx="350" cy="201" fill="#ffffff" r="2.5" />
                      <path d="M 276 198 Q 270 198 270 206 Q 270 214 276 214" fill="#4d8eff" />
                      <path d="M 384 198 Q 390 198 390 206 Q 390 214 384 214" fill="#4d8eff" />
                      <path d="M 324 214 Q 330 220 336 214" fill="none" stroke="#acedff" strokeLinecap="round" strokeWidth="2" />
                      <rect fill="#222a3d" height="16" rx="8" width="64" x="298" y="234" />
                      <text fill="#adc6ff" fontFamily="'JetBrains Mono', monospace" fontSize="9.5" fontWeight="700" textAnchor="middle" x="330" y="246">
                        AI AGENT
                      </text>
                    </g>

                    {/* 1. Top-Left Node: Device/API (Center: 77.5, 105) */}
                    <g
                      className="cursor-default transition-all duration-300 ease-out hover:scale-[1.15] hover:brightness-125 hover:drop-shadow-[0_0_16px_rgba(77,142,255,0.6)]"
                      style={{ transformOrigin: '77.5px 105px' }}
                    >
                      <rect fill="#171f33" height="70" rx="20" stroke="#4d8eff" strokeWidth="1.5" width="85" x="35" y="70" />
                      <rect fill="#4d8eff" fillOpacity="0.25" height="34" rx="6" stroke="#adc6ff" strokeWidth="1.5" width="32" x="61.5" y="82" />
                      <circle cx="77.5" cy="108" fill="#ffffff" r="2" />
                      <text fill="#adc6ff" fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fontWeight="700" textAnchor="middle" x="77.5" y="130">
                        API / TOOL
                      </text>
                    </g>

                    {/* 2. Top-Right Node: LLM (Center: 577.5, 105) */}
                    <g
                      className="cursor-default transition-all duration-300 ease-out hover:scale-[1.15] hover:brightness-125 hover:drop-shadow-[0_0_16px_rgba(208,188,255,0.6)]"
                      style={{ transformOrigin: '577.5px 105px' }}
                    >
                      <rect fill="#222a3d" height="70" rx="20" stroke="#c4abff" strokeWidth="1.5" width="95" x="530" y="70" />
                      <text fill="#d0bcff" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="16" fontWeight="800" textAnchor="middle" x="577.5" y="109">
                        LLM
                      </text>
                      <text fill="#8c909f" fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fontWeight="600" textAnchor="middle" x="577.5" y="128">
                        GEN-AI
                      </text>
                    </g>

                    {/* 3. Bottom-Left Node: Prompt Set (Center: 77.5, 295) */}
                    <g
                      className="cursor-default transition-all duration-300 ease-out hover:scale-[1.15] hover:brightness-125 hover:drop-shadow-[0_0_16px_rgba(77,142,255,0.6)]"
                      style={{ transformOrigin: '77.5px 295px' }}
                    >
                      <rect fill="#171f33" height="70" rx="20" stroke="#4d8eff" strokeWidth="1.5" width="85" x="35" y="260" />
                      <rect fill="#4d8eff" fillOpacity="0.2" height="26" rx="5" stroke="#adc6ff" strokeWidth="1.2" width="50" x="52.5" y="272" />
                      <line stroke="#adc6ff" strokeLinecap="round" strokeWidth="1.5" x1="58" x2="72" y1="281" y2="281" />
                      <line stroke="#4cd7f6" strokeLinecap="round" strokeWidth="1.5" x1="58" x2="90" y1="289" y2="289" />
                      <text fill="#adc6ff" fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fontWeight="700" textAnchor="middle" x="77.5" y="320">
                        PROMPT SET
                      </text>
                    </g>

                    {/* 4. Bottom-Right Node: Code Execution (Center: 577.5, 295) */}
                    <g
                      className="cursor-default transition-all duration-300 ease-out hover:scale-[1.15] hover:brightness-125 hover:drop-shadow-[0_0_16px_rgba(76,215,246,0.6)]"
                      style={{ transformOrigin: '577.5px 295px' }}
                    >
                      <rect fill="#171f33" height="70" rx="20" stroke="#4cd7f6" strokeWidth="1.5" width="95" x="530" y="260" />
                      <text fill="#4cd7f6" fontFamily="'JetBrains Mono', monospace" fontSize="18" fontWeight="700" textAnchor="middle" x="577.5" y="299">
                        &lt; / &gt;
                      </text>
                      <text fill="#8c909f" fontFamily="'JetBrains Mono', monospace" fontSize="8.5" fontWeight="600" textAnchor="middle" x="577.5" y="320">
                        EXECUTION
                      </text>
                    </g>

                    {/* Floating Data Packets Along Curves */}
                    <circle cx="205" cy="145" fill="#acedff" r="4">
                      <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="0.3;1;0.3" />
                    </circle>
                    <circle cx="455" cy="145" fill="#c4abff" r="4">
                      <animate attributeName="opacity" dur="2.4s" repeatCount="indefinite" values="1;0.3;1" />
                    </circle>
                    <circle cx="455" cy="265" fill="#4cd7f6" r="4">
                      <animate attributeName="opacity" dur="1.8s" repeatCount="indefinite" values="0.2;0.9;0.2" />
                    </circle>
                    <circle cx="205" cy="265" fill="#acedff" r="4">
                      <animate attributeName="opacity" dur="2.2s" repeatCount="indefinite" values="0.8;0.2;0.8" />
                    </circle>
                  </svg>
                </div>
              </div>
            </section>

            {/* 2. 3-Step Process Feature Mini Cards */}
            <section className="mt-10 w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1: 배우기 */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/25 hover:border-primary/40 hover:bg-surface-container-low transition-all">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                    <span className="material-symbols-outlined text-[20px]">school</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-on-surface">배우기</span>
                    <span className="text-xs text-outline mt-0.5 leading-snug">
                      AI와 Agent에 대한 기본 개념 학습
                    </span>
                  </div>
                </div>

                {/* 2: 만들기 */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/25 hover:border-secondary/40 hover:bg-surface-container-low transition-all">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0 border border-secondary/20">
                    <span className="material-symbols-outlined text-[20px]">build</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-on-surface">만들기</span>
                    <span className="text-xs text-outline mt-0.5 leading-snug">
                      Node를 연결하여 나만의 Agent 제작
                    </span>
                  </div>
                </div>

                {/* 3: 사용하기 */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low/60 border border-outline-variant/25 hover:border-tertiary/40 hover:bg-surface-container-low transition-all">
                  <div className="w-10 h-10 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0 border border-tertiary/20">
                    <span className="material-symbols-outlined text-[20px]">play_circle</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-on-surface">사용하기</span>
                    <span className="text-xs text-outline mt-0.5 leading-snug">
                      완성된 Agent를 다운받아 PC에서 실행
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. My Agent Projects Section */}
            <section className="mt-20 w-full">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold flex items-center gap-2">
                    <span>내 에이전트 프로젝트</span>
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-xs text-primary font-mono font-bold">
                    {myWorkflows.length}
                  </span>
                </div>

                {/* 전체 목록 보기 버튼 (마이페이지 이동) */}
                <Link
                  to="/noa-e/mypage"
                  className="px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface border border-outline-variant/30 hover:border-primary/40 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 group"
                >
                  <span>전체 목록 보기</span>
                  <span className="material-symbols-outlined text-[16px] text-primary group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </Link>
              </div>

              {/* Workflows List or Empty State */}
              {isLoadingWorkflows ? (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-2 text-outline">
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                  <span className="text-xs">에이전트 목록을 불러오는 중...</span>
                </div>
              ) : myWorkflows.length === 0 ? (
                <div className="py-12 px-6 flex flex-col items-center justify-center text-center gap-3 border border-dashed border-outline-variant/40 rounded-2xl bg-surface-container-low/40 backdrop-blur-sm">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[28px]">smart_toy</span>
                  </div>
                  <div className="flex flex-col gap-1 max-w-sm">
                    <p className="text-sm font-bold text-on-surface">아직 제작한 에이전트가 없습니다</p>
                    <p className="text-xs text-outline leading-relaxed">
                      시각적 노드 에디터에서 직관적으로 나만의 AI Agent를 설계하고 직접 실행해보세요!
                    </p>
                  </div>
                  <Link
                    to="/noa-e/studio"
                    className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-inverse-primary via-primary-container to-secondary-container text-on-surface text-xs font-semibold shadow-[0_0_16px_rgba(77,142,255,0.35)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>에이전트 스튜디오로 이동</span>
                  </Link>
                </div>
              ) : (
                <div
                  ref={scrollContainerRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUpOrLeave}
                  onMouseLeave={handleMouseUpOrLeave}
                  className={`flex gap-5 overflow-x-auto pb-4 pt-1 select-none no-scrollbar transition-all duration-75 ${
                    isDragging ? 'cursor-grabbing' : 'cursor-grab'
                  }`}
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {myWorkflows.slice(0, 10).map((agent) => (
                    <div
                      key={agent.id}
                      className="w-[290px] sm:w-[320px] shrink-0 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 hover:border-primary/50 overflow-hidden flex flex-col group transition-all duration-200 hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm select-none relative"
                    >
                      {/* Top Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteWorkflow(e, agent.id, agent.title)}
                        title="에이전트 삭제"
                        className="absolute top-3 right-3 z-20 w-8 h-8 rounded-lg bg-surface-container/80 hover:bg-error-container text-outline hover:text-error border border-outline-variant/30 transition-all flex items-center justify-center opacity-70 group-hover:opacity-100 backdrop-blur-md active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[17px]">delete</span>
                      </button>

                      <Link
                        to="/noa-e/studio"
                        onClick={handleCardClick}
                        draggable={false}
                        className="flex flex-col flex-1"
                      >
                        {/* 1. 에이전트 그래프 스냅샷 대용 비주얼 */}
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
                          <h4 className="font-bold text-sm sm:text-base text-on-surface group-hover:text-primary transition-colors truncate">
                            {agent.title}
                          </h4>
                          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-outline-variant/15 text-xs text-outline">
                            <span>최종 수정</span>
                            <span className="font-mono text-on-surface-variant font-medium text-[11px]">
                              {new Date(agent.updated_at).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 4. Templates (템플릿) Section (Displaying 4 actual templates) */}
            <section className="mt-20 mb-space-xl w-full">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-space-xs font-bold">
                    템플릿
                  </h2>
                  <p className="text-xs text-outline mt-0.5">미리 준비된 다양한 에이전트 템플릿으로 빠르게 시작해보세요.</p>
                </div>
                <Link
                  to="/noa-e/templates"
                  className="px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface border border-outline-variant/30 hover:border-primary/40 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 group"
                >
                  <span>템플릿 더보기</span>
                  <span className="material-symbols-outlined text-[16px] text-primary group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </Link>
              </div>

              {/* 4 Template Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
                {TEMPLATES_DATA.slice(0, 4).map((template) => (
                  <Link
                    key={template.id}
                    to={`/noa-e/studio?template=${template.id}`}
                    className={`rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 hover:${template.themeColor} overflow-hidden flex flex-col justify-between group transition-all duration-200 hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm select-none cursor-pointer`}
                  >
                    <div>
                      {/* 1. 에이전트 그래프 (스크린샷 스냅샷 뷰) */}
                      <div className="w-full h-32 bg-[#060e20] relative flex items-center justify-center border-b border-outline-variant/20 overflow-hidden pointer-events-none">
                        <div
                          className="absolute inset-0 opacity-20"
                          style={{
                            backgroundImage: `radial-gradient(${template.dotColor} 1px, transparent 1px)`,
                            backgroundSize: '14px 14px',
                          }}
                        />
                        {template.graphSvg}

                        {/* Top Badges Overlay */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                          <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant/30 text-[10px] text-on-surface font-medium">
                            {template.categoryLabel}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${template.difficultyColor}`}
                          >
                            {template.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* 2. 에이전트 이름 & 설명 */}
                      <div className="p-4 flex flex-col gap-1.5 pointer-events-none">
                        <h4 className="font-bold text-sm sm:text-base text-on-surface group-hover:text-primary transition-colors truncate">
                          {template.name}
                        </h4>
                        <p className="text-xs text-outline leading-snug line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </div>

                    {/* 3. 하단 노드 개수 & 열기 액션 */}
                    <div className="px-4 pb-3.5 pt-2 border-t border-outline-variant/15 flex items-center justify-between text-xs pointer-events-none">
                      <span className="text-[11px] text-outline font-mono flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-primary">hub</span>
                        <span>노드 {template.nodeCount}개</span>
                      </span>
                      <span className="text-primary font-bold text-xs flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        <span>열기</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
