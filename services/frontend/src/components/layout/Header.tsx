import React from 'react';
import { Link, useLocation } from '../../router/Router';
import logoImg from '../../assets/logo.png';

export const Header: React.FC = () => {
  const { pathname } = useLocation();

  const isStudio = pathname.startsWith('/noa-e/studio');
  const isNodes = pathname.startsWith('/noa-e/nodes');
  const isTemplates = pathname.startsWith('/noa-e/templates');
  const isLearn = pathname.startsWith('/noa-e/learn');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <div className="h-16 w-full px-6 flex items-center justify-between gap-space-lg">
        {/* Logo & Brand - Left aligned */}
        <div className="flex items-center gap-space-xl">
          <Link to="/noa-e" className="flex items-center group py-1" data-path="home">
            <img
              src={logoImg}
              alt="NOA-E"
              className="h-8 w-auto object-contain hover:brightness-110 transition-all"
            />
          </Link>

          {/* Navigation Items */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              to="/noa-e/studio"
              data-path="agent-builder"
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isStudio
                  ? 'bg-surface-container-high text-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              Studio
            </Link>
            <Link
              to="/noa-e/nodes"
              data-path="node-explorer"
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isNodes
                  ? 'bg-surface-container-high text-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              Nodes
            </Link>
            <Link
              to="/noa-e/templates"
              data-path="templates"
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isTemplates
                  ? 'bg-surface-container-high text-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              Templates
            </Link>
            <Link
              to="/noa-e/learn"
              data-path="learn"
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isLearn
                  ? 'bg-surface-container-high text-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              Learn
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
