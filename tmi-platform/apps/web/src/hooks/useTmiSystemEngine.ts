'use client';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { SessionContext } from '@/hooks/SessionContext';

export type TmiSurface =
  | 'home1' | 'home2' | 'home3' | 'home4' | 'home5'
  | 'arena' | 'live-world' | 'magazine' | 'season-pass' | 'avatar-center';

export type CurtainState = 'closed' | 'opening' | 'open' | 'closing';

interface TmiSystemState {
  // User context
  userId: string | null;
  displayName: string | null;
  tier: 'free' | 'fan' | 'artist' | 'vip' | 'diamond';
  isFounder: boolean;

  // Surface navigation
  currentSurface: TmiSurface;
  jumpToSurface: (surface: TmiSurface) => void;

  // Curtain
  curtainState: CurtainState;
  openCurtain: () => void;
  closeCurtain: () => void;

  // Guitar pluck FX
  guitarPluck: (freq?: number) => void;
}

function playGuitarTone(freq = 392) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = freq * 4;
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio blocked by browser policy
  }
}

const SURFACE_ROUTES: Record<TmiSurface, string> = {
  'home1':       '/home/1',
  'home2':       '/home/2',
  'home3':       '/home/3',
  'home4':       '/home/4',
  'home5':       '/home/5',
  'arena':       '/arena',
  'live-world':  '/rooms/world-concert',
  'magazine':    '/home/magazine',
  'season-pass': '/season-pass',
  'avatar-center': '/avatar-center',
};

export function useTmiSystemEngine(initialSurface: TmiSurface = 'home1'): TmiSystemState {
  const session = useContext(SessionContext);
  const [currentSurface, setCurrentSurface] = useState<TmiSurface>(initialSurface);
  const [curtainState, setCurtainState] = useState<CurtainState>('open');
  const curtainTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derive user state from session context (graceful fallback for unauthenticated)
  const userId      = session?.userId ?? null;
  const displayName = session?.userName ?? null;
  const tier        = 'free' as TmiSystemState['tier'];
  const isFounder   = false;

  const jumpToSurface = useCallback((surface: TmiSurface) => {
    setCurtainState('closing');
    curtainTimerRef.current = setTimeout(() => {
      setCurrentSurface(surface);
      window.location.href = SURFACE_ROUTES[surface];
    }, 560);
  }, []);

  const openCurtain = useCallback(() => {
    setCurtainState('opening');
    curtainTimerRef.current = setTimeout(() => setCurtainState('open'), 560);
  }, []);

  const closeCurtain = useCallback(() => {
    setCurtainState('closing');
    curtainTimerRef.current = setTimeout(() => setCurtainState('closed'), 560);
  }, []);

  const guitarPluck = useCallback((freq = 392) => {
    playGuitarTone(freq);
  }, []);

  useEffect(() => {
    return () => {
      if (curtainTimerRef.current) clearTimeout(curtainTimerRef.current);
    };
  }, []);

  return {
    userId,
    displayName,
    tier,
    isFounder,
    currentSurface,
    jumpToSurface,
    curtainState,
    openCurtain,
    closeCurtain,
    guitarPluck,
  };
}
