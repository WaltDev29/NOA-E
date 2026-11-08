import React from 'react';
import { Link } from '../../router/Router';
import logoImg from '../../assets/logo.png';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/20 py-space-lg">
      <div className="w-full px-6 flex flex-col md:flex-row items-center justify-between gap-space-md text-on-surface-variant font-sans text-xs">
        <div className="flex items-center gap-space-md">
          <Link to="/noa-e">
            <img src={logoImg} alt="NOA-E" className="h-6 w-auto object-contain" />
          </Link>
          <span className="text-outline">Node-Oriented Agent Education Platform</span>
        </div>
        <div className="flex flex-wrap items-center gap-space-lg text-outline">
          <Link to="/noa-e/nodes" className="hover:text-on-surface transition-colors">
            커리큘럼 안내
          </Link>
          <Link to="/noa-e/nodes" className="hover:text-on-surface transition-colors">
            노드 도감
          </Link>
          <Link to="/noa-e/studio" className="hover:text-on-surface transition-colors">
            에이전트 스튜디오
          </Link>
          <span>© 2025 NOA-E. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};
