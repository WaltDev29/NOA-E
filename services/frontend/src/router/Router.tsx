import React, { createContext, useContext, useEffect, useState } from 'react';

interface RouterContextType {
  path: string;
  search: string;
  navigate: (to: string) => void;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterContextType>({
  path: window.location.pathname || '/noa-e',
  search: window.location.search || '',
  navigate: () => {},
  params: {},
});

export const useRouter = () => useContext(RouterContext);

export const useNavigate = () => {
  const { navigate } = useRouter();
  return navigate;
};

export const useLocation = () => {
  const { path, search } = useRouter();
  return { pathname: path, search };
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
  const [path, setPath] = useState<string>(window.location.pathname || '/');
  const [search, setSearch] = useState<string>(window.location.search || '');

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname || '/');
      setSearch(window.location.search || '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    const currentFull = window.location.pathname + window.location.search;
    if (currentFull !== to) {
      window.history.pushState({}, '', to);
      const [newPath, newQuery] = to.split('?');
      setPath(newPath || '/');
      setSearch(newQuery ? `?${newQuery}` : '');
      window.scrollTo(0, 0);
    }
  };

  // Compute dynamic params (e.g. /noa-e/nodes/:nodeId, /noa-e/learn/:topicId)
  let params: Record<string, string> = {};
  if (path.startsWith('/noa-e/nodes/')) {
    const sub = path.replace('/noa-e/nodes/', '').split('/')[0];
    if (sub) {
      params.nodeId = sub;
    }
  }
  if (path.startsWith('/noa-e/learn/')) {
    const sub = path.replace('/noa-e/learn/', '').split('/')[0].split('#')[0];
    if (sub) {
      params.topicId = sub;
    }
  }
  if (path.startsWith('/noa-e/templates/')) {
    const sub = path.replace('/noa-e/templates/', '').split('/')[0].split('?')[0].split('#')[0];
    if (sub) {
      params.categoryId = sub;
    }
  }

  return (
    <RouterContext.Provider value={{ path, search, navigate, params }}>
      {children}
    </RouterContext.Provider>
  );
};
