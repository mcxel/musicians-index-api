"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface TelemetryContextType {
  currentRoute: string;
  previousRoute: string | null;
  roomHistory: string[];
  recentVenues: string[];
}

const TelemetryContext = createContext<TelemetryContextType | null>(null);

export const NavigationTelemetryEngine: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [currentRoute, setCurrentRoute] = useState<string>('');
  const [previousRoute, setPreviousRoute] = useState<string | null>(null);
  const [roomHistory, setRoomHistory] = useState<string[]>([]);
  const [recentVenues, setRecentVenues] = useState<string[]>([]);

  useEffect(() => {
    const storedHistory = sessionStorage.getItem('tmi:roomHistory');
    const storedVenues = sessionStorage.getItem('tmi:recentVenues');
    if (storedHistory) setRoomHistory(JSON.parse(storedHistory));
    if (storedVenues) setRecentVenues(JSON.parse(storedVenues));
  }, []);

  useEffect(() => {
    const url = `${pathname}${searchParams ? `?${searchParams.toString()}` : ''}`;
    
    setCurrentRoute((prev) => {
      if (prev !== url) {
        setPreviousRoute(prev);
        
        // Track specific movement without fighting Next.js routing
        if (url.includes('/venues/') || url.includes('/live/')) {
           setRoomHistory(curr => {
             const newHistory = [...curr, url].slice(-10);
             sessionStorage.setItem('tmi:roomHistory', JSON.stringify(newHistory));
             return newHistory;
           }); // Keep last 10
           
           const venueName = url.split('/').pop()?.split('?')[0];
           if (venueName) {
               setRecentVenues(curr => {
                 const newVenues = Array.from(new Set([venueName, ...curr])).slice(-5);
                 sessionStorage.setItem('tmi:recentVenues', JSON.stringify(newVenues));
                 return newVenues;
               });
           }
        }
      }
      return url;
    });
  }, [pathname, searchParams]);

  return (
    <TelemetryContext.Provider value={{ currentRoute, previousRoute, roomHistory, recentVenues }}>
      {children}
    </TelemetryContext.Provider>
  );
};

export const useNavigationTelemetry = () => {
  const context = useContext(TelemetryContext);
  if (!context) throw new Error('useNavigationTelemetry must be wrapped within NavigationTelemetryEngine');
  return context;
};