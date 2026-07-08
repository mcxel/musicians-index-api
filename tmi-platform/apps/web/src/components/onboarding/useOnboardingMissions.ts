'use client';

import { useState, useEffect, useCallback } from 'react';
import type { OnboardingMission } from './OnboardingMissionCard';

interface State {
  missions: OnboardingMission[];
  total: number;
  completedCount: number;
  loading: boolean;
}

const DISMISSED_KEY = 'tmi_dismissed_missions_v1';

function getDismissed(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveDismissed(ids: Set<string>): void {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]));
  } catch {
    /* storage unavailable */
  }
}

export function useOnboardingMissions() {
  const [state, setState] = useState<State>({ missions: [], total: 0, completedCount: 0, loading: true });

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/onboarding/missions', { cache: 'no-store', credentials: 'include' });
      if (!res.ok) { setState(s => ({ ...s, loading: false })); return; }
      const data = await res.json() as { pending: OnboardingMission[]; total: number; completedCount: number };
      const dismissed = getDismissed();
      setState({
        missions: data.pending.filter(m => !dismissed.has(m.id)),
        total: data.total,
        completedCount: data.completedCount,
        loading: false,
      });
    } catch {
      setState(s => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function dismiss(id: string) {
    const updated = getDismissed().add(id);
    saveDismissed(updated);
    setState(s => ({ ...s, missions: s.missions.filter(m => m.id !== id) }));
  }

  function dismissAll() {
    const ids = new Set(state.missions.map(m => m.id));
    const existing = getDismissed();
    for (const id of ids) existing.add(id);
    saveDismissed(existing);
    setState(s => ({ ...s, missions: [] }));
  }

  return { ...state, dismiss, dismissAll, reload: load };
}
