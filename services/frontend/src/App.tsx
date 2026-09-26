import React from 'react';
import { RouterProvider, useLocation } from './router/Router';
import { MainPage } from './pages/MainPage';
import { StudioPage } from './pages/StudioPage';
import { NodeInstructionPage } from './pages/NodeInstructionPage';

const AppRoutes: React.FC = () => {
  const { pathname } = useLocation();

  if (pathname.startsWith('/noa-e/studio')) {
    return <StudioPage />;
  }

  if (pathname.startsWith('/noa-e/nodes')) {
    return <NodeInstructionPage />;
  }

  // Default to Main Page for '/noa-e' or '/'
  return <MainPage />;
};

export default function App() {
  return (
    <RouterProvider>
      <AppRoutes />
    </RouterProvider>
  );
}
