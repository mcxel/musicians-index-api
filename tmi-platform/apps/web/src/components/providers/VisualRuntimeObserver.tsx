'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function VisualRuntimeObserver() {
  const pathname = usePathname();
  const observedRoutes = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!pathname || observedRoutes.current.has(pathname)) return;
    
    observedRoutes.current.add(pathname);
    console.log(`[VISUAL_OBSERVER] Client mounted ${pathname}. Triggering AI observation grid and identity locks.`);
    
    // Fires a lightweight fire-and-forget request to the server.
    // This allows VisualQueueHydrationEngine.ensureWired() and IdentityLockEngine.enforce() 
    // to execute safely in the background WITHOUT blocking React render or causing hydration errors.
    fetch('/api/visuals/observe', { 
      method: 'POST', 
      body: JSON.stringify({ route: pathname }),
      headers: { 'Content-Type': 'application/json' },
      keepalive: true 
    }).catch(err => console.warn('[VISUAL_OBSERVER] Telemetry drop safely bypassed:', err));

  }, [pathname]);

  return null;
}