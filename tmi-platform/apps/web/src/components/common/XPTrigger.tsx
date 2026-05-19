'use client';
import { useEffect } from 'react';
import { useGamificationEngine, type GamificationAction } from '@/hooks/useGamificationEngine';

export default function XPTrigger({ action, delayMs = 0 }: { action: GamificationAction; delayMs?: number }) {
  const { trackAction } = useGamificationEngine();
  useEffect(() => {
    if (delayMs === 0) { trackAction(action); return; }
    const t = setTimeout(() => trackAction(action), delayMs);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
