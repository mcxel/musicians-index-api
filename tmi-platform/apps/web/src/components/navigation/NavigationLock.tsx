'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

export default function NavigationLock() {
  const router = useRouter();
  const pathname = usePathname();
  const [canGoBack, setCanGoBack] = useState(false);

  // Always ensure we know if history exists
  useEffect(() => {
    setCanGoBack(window.history.length > 2 || pathname !== '/home/1');
  }, [pathname]);

  const handleBack = () => {
    if (canGoBack) {
      router.back();
    } else {
      // DEAD-END PREVENTION RULE: Fallback to root hub
      router.push('/home/1');
    }
  };

  const handleForward = () => {
    // If forward fails natively, we handle it gracefully.
    try {
      router.forward();
    } catch (e) {
      console.warn('NavigationLock: Forward history boundary reached.');
    }
  };

  return (
    <div className="fixed top-6 left-6 z-[9999] flex items-center space-x-3 pointer-events-auto">
      <button
        onClick={handleBack}
        className="p-3 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 text-white shadow-[0_0_20px_rgba(0,0,0,0.8)] hover:bg-white hover:text-black hover:scale-110 transition-all duration-300"
        aria-label="Go Back (Safe)"
      >
        <ChevronLeftIcon className="w-6 h-6" />
      </button>

      <button
        onClick={handleForward}
        className="p-3 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 text-white shadow-[0_0_20px_rgba(0,0,0,0.8)] hover:bg-white hover:text-black hover:scale-110 transition-all duration-300"
        aria-label="Go Forward"
      >
        <ChevronRightIcon className="w-6 h-6" />
      </button>
      
      <div className="hidden md:block ml-4 px-3 py-1 rounded-full bg-black/50 border border-white/5 text-[10px] font-mono text-white/50 tracking-[0.2em] uppercase">
        SYS // {pathname}
      </div>
    </div>
  );
}