import React from 'react';
import { RouterProvider, useLocation } from './router/Router';
import { MainPage } from './pages/MainPage';
import { StudioPage } from './pages/StudioPage';
import { NodeInstructionPage } from './pages/NodeInstructionPage';
import logoImg from './assets/logo.png';

const NotFoundPage: React.FC = () => {
  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <img src={logoImg} alt="NOA-E" className="h-10 w-auto object-contain mb-6" />
      <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2">
        404 - 페이지를 찾을 수 없습니다
      </h1>
      <p className="text-on-surface-variant font-body-md text-body-md max-w-md mb-6">
        요청하신 경로가 올바르지 않습니다. NOA-E 서비스는{' '}
        <code className="text-primary font-mono bg-surface-container px-2 py-0.5 rounded">/noa-e</code>{' '}
        경로에서 제공됩니다.
      </p>
      <a
        href="/noa-e"
        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-inverse-primary via-primary-container to-secondary-container text-on-surface font-semibold text-sm shadow-[0_0_20px_rgba(77,142,255,0.4)] hover:brightness-110 transition-all active:scale-95"
      >
        NOA-E 메인 페이지로 이동 (/noa-e)
      </a>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { pathname } = useLocation();

  if (pathname.startsWith('/noa-e/studio')) {
    return <StudioPage />;
  }

  if (
    pathname.startsWith('/noa-e/nodes') ||
    pathname.startsWith('/noa-e/learn') ||
    pathname.startsWith('/noa-e/templates')
  ) {
    return <NodeInstructionPage />;
  }

  // Only render MainPage for '/noa-e' or '/noa-e/'
  if (pathname === '/noa-e' || pathname === '/noa-e/') {
    return <MainPage />;
  }

  // Fallback 404 for '/' or any other undefined paths
  return <NotFoundPage />;
};

export default function App() {
  return (
    <RouterProvider>
      <AppRoutes />
    </RouterProvider>
  );
}
