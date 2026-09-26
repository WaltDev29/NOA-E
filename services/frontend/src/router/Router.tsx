import React, { createContext, useContext, useEffect, useState } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterContextType>({
  path: window.location.pathname || '/noa-e',
  navigate: () => {},
  params: {},
});

export const useRouter = () => useContext(RouterContext);

export const useNavigate = () => {
  const { navigate } = useRouter();
  return navigate;
};

export const useLocation = () => {
  const { path } = useRouter();
  return { pathname: path };
};

export const useParams = () => {
  const { params } = useRouter();
  return params;
};

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({ to, children, className, onClick, ...props }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      navigate(to);
    }
  };

  return (
    <a href={to} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
};

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Normalize initial path: fallback '/' to '/noa-e'
  const getInitialPath = () => {
    const raw = window.location.pathname || '/noa-e';
    if (raw === '' || raw === '/') return '/noa-e';
    return raw;
  };

  const [path, setPath] = useState<string>(getInitialPath());

  useEffect(() => {
    const handlePopState = () => {
      const current = window.location.pathname || '/noa-e';
      setPath(current === '/' ? '/noa-e' : current);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    let target = to;
    if (target === '' || target === '/') target = '/noa-e';
    
    if (window.location.pathname !== target) {
      window.history.pushState({}, '', target);
      setPath(target);
      window.scrollTo(0, 0);
    }
  };

  // Compute dynamic params (e.g. /noa-e/nodes/:nodeId)
  let params: Record<string, string> = {};
  if (path.startsWith('/noa-e/nodes/')) {
    const sub = path.replace('/noa-e/nodes/', '').split('/')[0];
    if (sub) {
      params.nodeId = sub;
    }
  }

  return (
    <RouterContext.Provider value={{ path, navigate, params }}>
      {children}
    </RouterContext.Provider>
  );
};
