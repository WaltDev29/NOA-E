import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Link } from '../router/Router';
import { useTheme } from '../context/ThemeContext';

interface AgentProject {
  id: string;
  name: string;
  updatedAt: string;
  themeColor: string;
  dotColor: string;
  graphSvg: React.ReactNode;
}

const AGENT_PROJECTS: AgentProject[] = [
  {
    id: '1',
    name: '스마트 영어 튜터',
    updatedAt: '2026. 09. 26 16:20',
    themeColor: 'border-primary/40 hover:border-primary',
    dotColor: '#4d8eff',
    graphSvg: (
      <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 260 120" fill="none">
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
      <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 260 120" fill="none">
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
      <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 260 120" fill="none">
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
      <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 260 120" fill="none">
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
      <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 260 120" fill="none">
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
      <svg className="w-full h-full p-4 relative z-10" viewBox="0 0 260 120" fill="none">
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
];

export const MyPage: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      <Header />

      <main className="w-full pt-16 bg-background min-h-screen flex-1 flex flex-col">
        <div className="w-full max-w-6xl mx-auto px-6 lg:px-8 py-space-lg flex flex-col gap-6">
          {/* Top Header */}
          <div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">
              마이페이지
            </h1>
          </div>

          {/* 1. User Profile Card */}
          <div className="rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary-container to-secondary-container flex items-center justify-center text-white shadow-[0_0_16px_rgba(77,142,255,0.4)] shrink-0">
                <span className="material-symbols-outlined text-[32px]">person</span>
              </div>
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  학생 개발자
                </h2>
                <span className="text-xs text-outline mt-0.5">student@noa-e.edu</span>
              </div>
            </div>

            {/* 정보 수정 버튼 (상하 중앙 정렬) */}
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface border border-outline-variant/30 text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 hover:border-primary/40 active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>정보 수정</span>
            </button>
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

          {/* 2. My Agent Projects Section (3-Column Grid) */}
          <div className="rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 p-6 flex flex-col gap-5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
                <span>내 에이전트 프로젝트</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-xs text-primary font-mono font-bold">
                  {AGENT_PROJECTS.length}
                </span>
              </h3>
            </div>

            {/* 3-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {AGENT_PROJECTS.map((agent) => (
                <Link
                  key={agent.id}
                  to="/noa-e/studio"
                  className={`rounded-2xl bg-surface-container-lowest/70 border border-outline-variant/30 hover:${agent.themeColor} overflow-hidden flex flex-col group transition-all duration-200 hover:shadow-xl hover:-translate-y-1`}
                >
                  {/* 1. 에이전트 그래프 (스크린샷 스냅샷 뷰) */}
                  <div className="w-full h-40 bg-[#060e20] relative flex items-center justify-center border-b border-outline-variant/20 overflow-hidden">
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
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <h4 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors truncate">
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
