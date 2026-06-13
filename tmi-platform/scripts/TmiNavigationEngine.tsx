import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface NavigationContextType {
  currentRoute: string;
  history: string[];
  forwardStack: string[];
  navigate: (route: string) => void;
  goBack: () => void;
  goForward: () => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const TmiNavigationEngine: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<string[]>(['/']);
  const [forwardStack, setForwardStack] = useState<string[]>([]);

  const currentRoute = history[history.length - 1];

  const navigate = useCallback((route: string) => {
    setHistory((prev) => [...prev, route]);
    setForwardStack([]); // Clear forward states upon initiating a new path
  }, []);

  const goBack = useCallback(() => {
    if (history.length > 1) {
      const newHistory = [...history];
      const popped = newHistory.pop()!;
      setForwardStack((prev) => [popped, ...prev]);
      setHistory(newHistory);
    }
  }, [history]);

  const goForward = useCallback(() => {
    if (forwardStack.length > 0) {
      const newForward = [...forwardStack];
      const nextRoute = newForward.shift()!;
      setHistory((prev) => [...prev, nextRoute]);
      setForwardStack(newForward);
    }
  }, [forwardStack]);

  return (
    <NavigationContext.Provider value={{ currentRoute, history, forwardStack, navigate, goBack, goForward }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useTmiNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useTmiNavigation must be wrapped within TmiNavigationEngine');
  return context;
};