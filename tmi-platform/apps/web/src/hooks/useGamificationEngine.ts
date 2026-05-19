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

const ACTION_XP: Record<GamificationAction, number> = {
  READ_ARTICLE: XP_VALUES.article_read,
  VOTE_BATTLE:  XP_VALUES.vote_cast,
  JOIN_STAGE:   XP_VALUES.room_attend,
  SEND_MESSAGE: XP_VALUES.comment_posted,
  LOGIN_DAILY:  XP_VALUES.login_daily,
};

const ACTION_CREDITS: Record<GamificationAction, number> = {
  READ_ARTICLE: 5,
  VOTE_BATTLE:  3,
  JOIN_STAGE:   10,
  SEND_MESSAGE: 2,
  LOGIN_DAILY:  25,
};

export function useGamificationEngine() {
  const [state, setState] = useState<GamificationState>(INITIAL);

  useEffect(() => { setState(load()); }, []);

  const trackAction = useCallback((action: GamificationAction) => {
    setState(prev => {
      const prevLevel = getLevelForXP(prev.totalXp).level;
      const next: GamificationState = {
        ...prev,
        totalXp: prev.totalXp + ACTION_XP[action],
        walletCredits: prev.walletCredits + ACTION_CREDITS[action],
      };
      if (getLevelForXP(next.totalXp).level > prevLevel && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tmi:level-up', {
          detail: { level: getLevelForXP(next.totalXp).level, xp: next.totalXp },
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
