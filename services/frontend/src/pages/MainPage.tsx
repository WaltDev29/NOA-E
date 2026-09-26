import React, { useRef } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Link } from '../router/Router';
import { TEMPLATES_DATA } from './TemplatesPage';

interface AgentProject {
  id: string;
  name: string;
  updatedAt: string;
  themeColor: string;
  dotColor: string;
  graphSvg: React.ReactNode;
}

const MY_AGENT_PROJECTS: AgentProject[] = [
  {
    id: '1',
    name: '스마트 영어 튜터',
    updatedAt: '2026. 09. 26 16:20',
    themeColor: 'border-primary/40 hover:border-primary',
    dotColor: '#4d8eff',
    graphSvg: (
      <svg className="w-full h-full p-3.5 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 50 60 C 90 60, 100 40, 130 40" stroke="#4d8eff" strokeWidth="2" strokeDasharray="3 3" />
        <path d="M 130 40 C 160 40, 170 60, 210 60" stroke="#4d8eff" strokeWidth="2" />
        <rect x="20" y="44" width="36" height="32" rx="8" fill="#171f33" stroke="#4d8eff" strokeWidth="1.5" />
        <text x="38" y="64" fill="#adc6ff" fontSize="10" textAnchor="middle" fontFamily="monospace">IN</text>
        <rect x="110" y="24" width="48" height="32" rx="8" fill="#222a3d" stroke="#c4abff" strokeWidth="1.5" />
        <text x="134" y="44" fill="#d0bcff" fontSize="10" fontWeight="bold" textAnchor="middle">LLM</text>
        <rect x="200" y="44" width="42" height="32" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="221" y="64" fill="#4cd7f6" fontSize="10" textAnchor="middle" fontFamily="monospace">OUT</text>
      </svg>
    ),
  },
  {
    id: '2',
    name: '보고서 요약 봇',
    updatedAt: '2026. 09. 25 18:45',
    themeColor: 'border-secondary/40 hover:border-secondary',
    dotColor: '#d0bcff',
    graphSvg: (
      <svg className="w-full h-full p-3.5 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 45 60 L 95 60" stroke="#4d8eff" strokeWidth="2" />
        <path d="M 135 60 L 175 60" stroke="#c4abff" strokeWidth="2" strokeDasharray="3 3" />
        <path d="M 215 60 L 235 60" stroke="#4cd7f6" strokeWidth="2" />
        <rect x="15" y="44" width="34" height="32" rx="8" fill="#171f33" stroke="#4d8eff" strokeWidth="1.5" />
        <rect x="90" y="44" width="46" height="32" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="113" y="64" fill="#4cd7f6" fontSize="9" textAnchor="middle">DOC</text>
        <rect x="170" y="44" width="46" height="32" rx="8" fill="#222a3d" stroke="#c4abff" strokeWidth="1.5" />
        <text x="193" y="64" fill="#d0bcff" fontSize="9" fontWeight="bold" textAnchor="middle">LLM</text>
      </svg>
    ),
  },
  {
    id: '3',
    name: '파이썬 연산기',
    updatedAt: '2026. 09. 23 11:10',
    themeColor: 'border-tertiary/40 hover:border-tertiary',
    dotColor: '#4cd7f6',
    graphSvg: (
      <svg className="w-full h-full p-3.5 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 45 45 C 80 45, 90 75, 125 75" stroke="#4d8eff" strokeWidth="2" />
        <path d="M 165 75 C 185 75, 195 45, 220 45" stroke="#4cd7f6" strokeWidth="2" strokeDasharray="3 3" />
        <rect x="15" y="30" width="34" height="30" rx="8" fill="#171f33" stroke="#4d8eff" strokeWidth="1.5" />
        <rect x="120" y="60" width="48" height="30" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="144" y="79" fill="#4cd7f6" fontSize="10" textAnchor="middle" fontFamily="monospace">&lt;/&gt;</text>
        <rect x="215" y="30" width="34" height="30" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: '4',
    name: '실시간 뉴스 요약기',
    updatedAt: '2026. 09. 21 09:30',
    themeColor: 'border-primary/40 hover:border-primary',
    dotColor: '#4d8eff',
    graphSvg: (
      <svg className="w-full h-full p-3.5 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 45 60 L 95 60" stroke="#4d8eff" strokeWidth="2" />
        <path d="M 140 60 L 180 60" stroke="#acedff" strokeWidth="2" />
        <rect x="15" y="44" width="34" height="32" rx="8" fill="#171f33" stroke="#4d8eff" strokeWidth="1.5" />
        <rect x="95" y="44" width="46" height="32" rx="8" fill="#171f33" stroke="#4d8eff" strokeWidth="1.5" />
        <text x="118" y="64" fill="#adc6ff" fontSize="9" textAnchor="middle">SEARCH</text>
        <rect x="180" y="44" width="46" height="32" rx="8" fill="#222a3d" stroke="#c4abff" strokeWidth="1.5" />
        <text x="203" y="64" fill="#d0bcff" fontSize="9" fontWeight="bold" textAnchor="middle">LLM</text>
      </svg>
    ),
  },
  {
    id: '5',
    name: '이미지 크리에이터',
    updatedAt: '2026. 09. 19 14:15',
    themeColor: 'border-secondary/40 hover:border-secondary',
    dotColor: '#c4abff',
    graphSvg: (
      <svg className="w-full h-full p-3.5 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 45 60 L 95 60" stroke="#4d8eff" strokeWidth="2" />
        <path d="M 140 60 L 180 60" stroke="#d0bcff" strokeWidth="2" strokeDasharray="3 3" />
        <rect x="15" y="44" width="34" height="32" rx="8" fill="#171f33" stroke="#4d8eff" strokeWidth="1.5" />
        <rect x="95" y="44" width="46" height="32" rx="8" fill="#222a3d" stroke="#adc6ff" strokeWidth="1.5" />
        <text x="118" y="64" fill="#adc6ff" fontSize="9" textAnchor="middle">PROMPT</text>
        <rect x="180" y="44" width="46" height="32" rx="8" fill="#171f33" stroke="#d0bcff" strokeWidth="1.5" />
        <text x="203" y="64" fill="#d0bcff" fontSize="9" fontWeight="bold" textAnchor="middle">IMAGE</text>
      </svg>
    ),
  },
  {
    id: '6',
    name: '고객 상담 자동 분류기',
    updatedAt: '2026. 09. 15 17:00',
    themeColor: 'border-tertiary/40 hover:border-tertiary',
    dotColor: '#4cd7f6',
    graphSvg: (
      <svg className="w-full h-full p-3.5 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 45 60 C 80 60, 85 40, 115 40" stroke="#4d8eff" strokeWidth="2" />
        <path d="M 45 60 C 80 60, 85 80, 115 80" stroke="#4d8eff" strokeWidth="2" />
        <path d="M 160 40 L 195 40" stroke="#4cd7f6" strokeWidth="2" />
        <path d="M 160 80 L 195 80" stroke="#c4abff" strokeWidth="2" />
        <rect x="15" y="44" width="32" height="32" rx="8" fill="#171f33" stroke="#4d8eff" strokeWidth="1.5" />
        <rect x="115" y="24" width="46" height="32" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="138" y="44" fill="#4cd7f6" fontSize="9" textAnchor="middle">CASE A</text>
        <rect x="115" y="64" width="46" height="32" rx="8" fill="#171f33" stroke="#c4abff" strokeWidth="1.5" />
        <text x="138" y="84" fill="#c4abff" fontSize="9" textAnchor="middle">CASE B</text>
      </svg>
    ),
  },
  {
    id: '7',
    name: 'SQL 쿼리 자동 생성기',
    updatedAt: '2026. 09. 12 14:00',
    themeColor: 'border-primary/40 hover:border-primary',
    dotColor: '#4d8eff',
    graphSvg: (
      <svg className="w-full h-full p-3.5 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 45 60 L 95 60" stroke="#4d8eff" strokeWidth="2" />
        <path d="M 140 60 L 185 60" stroke="#4d8eff" strokeWidth="2" />
        <rect x="15" y="44" width="34" height="32" rx="8" fill="#171f33" stroke="#4d8eff" strokeWidth="1.5" />
        <text x="32" y="64" fill="#adc6ff" fontSize="9" textAnchor="middle">KOR</text>
        <rect x="95" y="44" width="46" height="32" rx="8" fill="#222a3d" stroke="#c4abff" strokeWidth="1.5" />
        <text x="118" y="64" fill="#d0bcff" fontSize="9" fontWeight="bold" textAnchor="middle">SQL</text>
        <rect x="185" y="44" width="44" height="32" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="207" y="64" fill="#4cd7f6" fontSize="9" fontFamily="monospace" textAnchor="middle">QUERY</text>
      </svg>
    ),
  },
  {
    id: '8',
    name: 'PDF 교재 Q&A 봇 (RAG)',
    updatedAt: '2026. 09. 10 11:30',
    themeColor: 'border-secondary/40 hover:border-secondary',
    dotColor: '#c4abff',
    graphSvg: (
      <svg className="w-full h-full p-3.5 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 40 40 L 90 40" stroke="#4d8eff" strokeWidth="2" />
        <path d="M 40 80 L 90 80" stroke="#c4abff" strokeWidth="2" />
        <path d="M 140 40 C 160 40, 160 60, 180 60" stroke="#4cd7f6" strokeWidth="2" />
        <path d="M 140 80 C 160 80, 160 60, 180 60" stroke="#4cd7f6" strokeWidth="2" />
        <rect x="10" y="24" width="34" height="32" rx="8" fill="#171f33" stroke="#4d8eff" strokeWidth="1.5" />
        <text x="27" y="44" fill="#adc6ff" fontSize="8" textAnchor="middle">ASK</text>
        <rect x="10" y="64" width="34" height="32" rx="8" fill="#171f33" stroke="#c4abff" strokeWidth="1.5" />
        <text x="27" y="84" fill="#d0bcff" fontSize="8" textAnchor="middle">PDF</text>
        <rect x="90" y="24" width="50" height="32" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="115" y="44" fill="#4cd7f6" fontSize="8" fontWeight="bold" textAnchor="middle">VECTOR</text>
        <rect x="180" y="44" width="46" height="32" rx="8" fill="#222a3d" stroke="#c4abff" strokeWidth="1.5" />
        <text x="203" y="64" fill="#d0bcff" fontSize="9" fontWeight="bold" textAnchor="middle">RAG</text>
      </svg>
    ),
  },
  {
    id: '9',
    name: '이메일 자동 답장 초안 봇',
    updatedAt: '2026. 09. 08 09:20',
    themeColor: 'border-tertiary/40 hover:border-tertiary',
    dotColor: '#4cd7f6',
    graphSvg: (
      <svg className="w-full h-full p-3.5 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 40 60 L 85 60" stroke="#4d8eff" strokeWidth="2" />
        <path d="M 125 45 L 170 30" stroke="#4cd7f6" strokeWidth="2" />
        <path d="M 125 75 L 170 90" stroke="#c4abff" strokeWidth="2" />
        <rect x="10" y="44" width="34" height="32" rx="8" fill="#171f33" stroke="#4d8eff" strokeWidth="1.5" />
        <text x="27" y="64" fill="#adc6ff" fontSize="8" textAnchor="middle">MAIL</text>
        <rect x="85" y="44" width="42" height="32" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="106" y="64" fill="#4cd7f6" fontSize="8" textAnchor="middle">ROUTE</text>
        <rect x="170" y="14" width="50" height="30" rx="8" fill="#222a3d" stroke="#c4abff" strokeWidth="1.5" />
        <text x="195" y="33" fill="#d0bcff" fontSize="8" fontWeight="bold" textAnchor="middle">DRAFT</text>
        <rect x="170" y="76" width="50" height="30" rx="8" fill="#171f33" stroke="#adc6ff" strokeWidth="1.5" />
        <text x="195" y="95" fill="#adc6ff" fontSize="8" textAnchor="middle">LOG</text>
      </svg>
    ),
  },
  {
    id: '10',
    name: '일일 날씨 & 일정 브리핑 봇',
    updatedAt: '2026. 09. 05 18:10',
    themeColor: 'border-tertiary/40 hover:border-tertiary',
    dotColor: '#4cd7f6',
    graphSvg: (
      <svg className="w-full h-full p-3.5 relative z-10" viewBox="0 0 260 120" fill="none">
        <path d="M 40 40 L 90 60" stroke="#4d8eff" strokeWidth="2" />
        <path d="M 40 80 L 90 60" stroke="#4cd7f6" strokeWidth="2" />
        <path d="M 140 60 L 180 60" stroke="#c4abff" strokeWidth="2" />
        <rect x="10" y="24" width="34" height="32" rx="8" fill="#171f33" stroke="#4d8eff" strokeWidth="1.5" />
        <text x="27" y="44" fill="#adc6ff" fontSize="8" textAnchor="middle">TIME</text>
        <rect x="10" y="64" width="34" height="32" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="27" y="84" fill="#4cd7f6" fontSize="8" textAnchor="middle">API</text>
        <rect x="90" y="44" width="50" height="32" rx="8" fill="#222a3d" stroke="#c4abff" strokeWidth="1.5" />
        <text x="115" y="64" fill="#d0bcff" fontSize="9" fontWeight="bold" textAnchor="middle">SUMMARY</text>
        <rect x="180" y="44" width="46" height="32" rx="8" fill="#171f33" stroke="#4cd7f6" strokeWidth="1.5" />
        <text x="203" y="64" fill="#4cd7f6" fontSize="9" textAnchor="middle">MSG</text>
      </svg>
    ),
  },
];

export const MainPage: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const hasDragged = useRef(false);
  const [isDragging, setIsDragging] = React.useState(false);

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

            {/* 3. My Agent Projects Section (Mouse Drag-to-Scroll Horizontal List, Max 10) */}
            <section className="mt-20 w-full">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold flex items-center gap-2">
                    <span>내 에이전트 프로젝트</span>
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-xs text-primary font-mono font-bold">
                    {Math.min(MY_AGENT_PROJECTS.length, 10)}
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

              {/* Horizontal Drag-to-Scroll List (Max 10 Items) */}
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
                {MY_AGENT_PROJECTS.slice(0, 10).map((agent) => (
                  <Link
                    key={agent.id}
                    to="/noa-e/studio"
                    onClick={handleCardClick}
                    draggable={false}
                    className={`w-[290px] sm:w-[320px] shrink-0 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 hover:${agent.themeColor} overflow-hidden flex flex-col group transition-all duration-200 hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm select-none pointer-events-auto`}
                  >
                    {/* 1. 에이전트 그래프 (스크린샷 스냅샷 뷰) */}
                    <div className="w-full h-36 bg-[#060e20] relative flex items-center justify-center border-b border-outline-variant/20 overflow-hidden pointer-events-none">
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `radial-gradient(${agent.dotColor} 1px, transparent 1px)`,
                          backgroundSize: '14px 14px',
                        }}
                      />
                      {agent.graphSvg}
                    </div>

                    {/* 2. 에이전트 이름 & 3. 최종 수정 날짜 */}
                    <div className="p-4 flex flex-col justify-between flex-1 pointer-events-none">
                      <h4 className="font-bold text-sm sm:text-base text-on-surface group-hover:text-primary transition-colors truncate">
                        {agent.name}
                      </h4>
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-outline-variant/15 text-xs text-outline">
                        <span>최종 수정 날짜</span>
                        <span className="font-mono text-on-surface-variant font-medium">
                          {agent.updatedAt}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
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
