'use client';
import { useCallback, useEffect, useState } from 'react';
import { getLevelForXP, getProgressToNextLevel, XP_VALUES } from '@/lib/xp/xpEngine';

const STORAGE_KEY = 'tmi_gam_v1';

interface GamificationState {
  totalXp: number;
  walletCredits: number;
  earnedRewards: string[];
}

const INITIAL: GamificationState = { totalXp: 0, walletCredits: 1000, earnedRewards: [] };

function load(): GamificationState {
  if (typeof window === 'undefined') return INITIAL;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GamificationState) : INITIAL;
  } catch {
    return INITIAL;
  }
}

function persist(s: GamificationState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* noop */ }
}

export type GamificationAction = 'READ_ARTICLE' | 'VOTE_BATTLE' | 'JOIN_STAGE' | 'SEND_MESSAGE' | 'LOGIN_DAILY';

// Variable XP ranges — [min, max] per action
const ACTION_XP_RANGE: Record<GamificationAction, [number, number]> = {
  READ_ARTICLE: [10, 40],
  VOTE_BATTLE:  [5,  25],
  JOIN_STAGE:   [30, 80],
  SEND_MESSAGE: [5,  15],
  LOGIN_DAILY:  [20, 35],
};

const ACTION_CREDITS: Record<GamificationAction, number> = {
  READ_ARTICLE: 5,
  VOTE_BATTLE:  3,
  JOIN_STAGE:   10,
  SEND_MESSAGE: 2,
  LOGIN_DAILY:  25,
};

// 5% chance of rare 3× XP multiplier per action
const RARE_MULTIPLIER_CHANCE = 0.05;

function rollXp(action: GamificationAction): { xp: number; rare: boolean } {
  const [min, max] = ACTION_XP_RANGE[action];
  const base = Math.floor(Math.random() * (max - min + 1)) + min;
  const rare = Math.random() < RARE_MULTIPLIER_CHANCE;
  return { xp: rare ? base * 3 : base, rare };
}

export function useGamificationEngine() {
  const [state, setState] = useState<GamificationState>(INITIAL);

  useEffect(() => { setState(load()); }, []);

  const trackAction = useCallback((action: GamificationAction) => {
    setState(prev => {
      const prevLevel = getLevelForXP(prev.totalXp).level;
      const { xp, rare } = rollXp(action);
      const credits = ACTION_CREDITS[action];
      const next: GamificationState = {
        ...prev,
        totalXp: prev.totalXp + xp,
        walletCredits: prev.walletCredits + credits,
      };
      const nextLevelObj = getLevelForXP(next.totalXp);
      if (nextLevelObj.level > prevLevel && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tmi:level-up', {
          detail: { level: nextLevelObj.level, xp: next.totalXp },
        }));
      }
      if (rare && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tmi:rare-drop', {
          detail: { xp, credits, action },
        }));
      }
      persist(next);
      return next;
    });
  }, []);

  const spendCredits = useCallback((amount: number) => {
    setState(prev => {
      if (prev.walletCredits < amount) return prev;
      const next = { ...prev, walletCredits: prev.walletCredits - amount };
      persist(next);
      return next;
    });
  }, []);

  const claimReward = useCallback((rewardId: string) => {
    setState(prev => {
      if (prev.earnedRewards.includes(rewardId)) return prev;
      const next = { ...prev, earnedRewards: [...prev.earnedRewards, rewardId] };
      persist(next);
      return next;
    });
  }, []);

  const currentLevel = getLevelForXP(state.totalXp);
  const progress = getProgressToNextLevel(state.totalXp);

  return {
    totalXp: state.totalXp,
    walletCredits: state.walletCredits,
    earnedRewards: state.earnedRewards,
    currentLevel,
    progress,
    trackAction,
    spendCredits,
    claimReward,
  };
}
