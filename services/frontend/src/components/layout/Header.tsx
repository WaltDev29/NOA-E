import React from 'react';
import { Link, useLocation } from '../../router/Router';

export const Header: React.FC = () => {
  const { pathname } = useLocation();

  const isHome = pathname === '/noa-e' || pathname === '/';
  const isStudio = pathname.startsWith('/noa-e/studio');
  const isNodes = pathname.startsWith('/noa-e/nodes');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <div className="h-16 max-w-7xl mx-auto px-margin flex items-center justify-between gap-space-lg">
        {/* Logo & Brand */}
        <div className="flex items-center gap-space-xl">
          <Link to="/noa-e" className="flex items-center gap-space-sm group" data-path="home">
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center border border-primary/40 shadow-[0_0_12px_rgba(77,142,255,0.35)] group-hover:border-primary transition-colors">
              <span className="material-symbols-outlined text-primary text-[18px]">hub</span>
            </div>
            <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface flex items-center">
              NOA<span className="text-primary text-glow">-E</span>
            </span>
          </Link>

          {/* Navigation Items */}
          <nav className="hidden lg:flex items-center gap-space-xs">
            <Link
              to="/noa-e"
              data-path="home"
              className={`px-space-md py-space-sm rounded-lg font-body-md transition-all ${
                isHome
                  ? 'bg-surface-container-high text-primary border-b-2 border-primary shadow-[0_0_12px_rgba(77,142,255,0.25)]'
                  : 'text-on-surface-variant text-body-md hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              홈
            </Link>
            <Link
              to="/noa-e/studio"
              data-path="agent-builder"
              className={`px-space-md py-space-sm rounded-lg font-body-md transition-all ${
                isStudio
                  ? 'bg-surface-container-high text-primary border-b-2 border-primary shadow-[0_0_12px_rgba(77,142,255,0.25)]'
                  : 'text-on-surface-variant text-body-md hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              에이전트 만들기
            </Link>
            <Link
              to="/noa-e/nodes"
              data-path="node-explorer"
              className={`px-space-md py-space-sm rounded-lg font-body-md transition-all ${
                isNodes
                  ? 'bg-surface-container-high text-primary border-b-2 border-primary shadow-[0_0_12px_rgba(77,142,255,0.25)]'
                  : 'text-on-surface-variant text-body-md hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              노드 탐색
            </Link>
            <Link
              to="/noa-e/nodes"
              data-path="templates"
              className="px-space-md py-space-sm rounded-lg text-on-surface-variant font-body-md text-body-md hover:text-on-surface hover:bg-surface-container-low transition-all"
            >
              템플릿
            </Link>
            <Link
              to="/noa-e/nodes"
              data-path="learn"
              className="px-space-md py-space-sm rounded-lg text-on-surface-variant font-body-md text-body-md hover:text-on-surface hover:bg-surface-container-low transition-all"
            >
              학습하기
            </Link>
          </nav>
        </div>

        {/* Right Status Actions */}
        <div className="flex items-center gap-space-md">
          <button
            aria-label="Notifications"
            className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">notifications</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_10px_rgba(77,142,255,0.4)]">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
};
