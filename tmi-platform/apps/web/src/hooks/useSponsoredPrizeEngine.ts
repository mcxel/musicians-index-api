'use client';
import { useState, useCallback, useEffect } from 'react';
import type { EvolutionEvent, SponsoredPrize } from '@/types/evolution';
import type { AccountTier } from '@/types/security';

const PRIZE_POOL: SponsoredPrize[] = [
  {
    id: 'prz-01',
    category: 'INTERNAL_COSMETIC',
    title: 'Neon Chico Studio Shades',
    description: 'Glowing premium eyewear for your avatar profile.',
    probabilityWeight: 50,
    rewardValueCredits: 0,
    targetTier: 'ALL',
  },
  {
    id: 'prz-02',
    category: 'SPONSOR_FUNDED_PROMO',
    title: 'Lorenzo Apparel Gear Coupon',
    description: '20% off hard goods at the Lorenzo Gear pop-up.',
    probabilityWeight: 35,
    rewardValueCredits: 150,
    sponsorName: 'Lorenzo Gear',
    targetTier: 'ALL',
    claimCtaPath: '/rewards/claims',
  },
  {
    id: 'prz-03',
    category: 'CAREER_ACCELERATOR',
    title: 'Artist Live-Stage Promo Boost',
    description: 'Featured placement in the Live World lobby for 2 hours.',
    probabilityWeight: 15,
    rewardValueCredits: 500,
    targetTier: 'ADULT',
  },
];

function weightedPick(pool: SponsoredPrize[]): SponsoredPrize | null {
  const total = pool.reduce((s, p) => s + p.probabilityWeight, 0);
  let roll = Math.floor(Math.random() * total);
  for (const item of pool) {
    roll -= item.probabilityWeight;
    if (roll <= 0) return item;
  }
  return pool[0] ?? null;
}

export function useSponsoredPrizeEngine(userId: string, userTier: AccountTier | 'ALL') {
  const [activeReveal, setActiveReveal] = useState<SponsoredPrize | null>(null);
  const [claimHistory, setClaimHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`tmi_prizes_${userId}`);
      if (raw) setClaimHistory(JSON.parse(raw) as string[]);
    } catch { /* noop */ }
  }, [userId]);

  const dispatchEngagementEvent = useCallback((_event: EvolutionEvent, _context: string) => {
    const eligible = PRIZE_POOL.filter(p =>
      p.targetTier === 'ALL' || p.targetTier === userTier
    );
    const prize = weightedPick(eligible);
    if (prize) {
      setActiveReveal(prize);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tmi:guitar-pluck'));
      }
    }
  }, [userTier]);

  const clearRevealModal = useCallback(() => {
    if (!activeReveal) return;
    setActiveReveal(null);
    setClaimHistory(prev => {
      const next = [`${activeReveal.title} — ${new Date().toLocaleTimeString()}`, ...prev];
      try { localStorage.setItem(`tmi_prizes_${userId}`, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  }, [activeReveal, userId]);

  return { activeReveal, claimHistory, dispatchEngagementEvent, clearRevealModal };
}
