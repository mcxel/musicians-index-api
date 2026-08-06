'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UnifiedRewardEngine, RewardEvent } from '@/lib/rewards/UnifiedRewardEngine';
import { SoundSystemEngine } from '@/lib/sound/SoundSystemEngine';
import { useSoundSettingsStore } from '@/lib/sound/SoundSettingsStore';

interface FlyingParticle {
  id: string;
  type: 'xp' | 'coins' | 'gems' | 'promotionPoints' | 'badge';
  icon: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  color: string;
  label: string;
}

export const RewardFlightOverlay: React.FC = () => {
  const [activeEvent, setActiveEvent] = useState<RewardEvent | null>(null);
  const [particles, setParticles] = useState<FlyingParticle[]>([]);
  const { reducedMotion, instantCounters } = useSoundSettingsStore();

  useEffect(() => {
    const unsubscribe = UnifiedRewardEngine.subscribe((event) => {
      if (instantCounters || reducedMotion) {
        SoundSystemEngine.play('reward_deposit');
        return;
      }

      setActiveEvent(event);

      setTimeout(() => {
        SoundSystemEngine.play('reward_whoosh');
        spawnParticles(event);
        setActiveEvent(null);
      }, 800);
    });

    return unsubscribe;
  }, [reducedMotion, instantCounters]);

  const spawnParticles = (event: RewardEvent) => {
    const newParticles: FlyingParticle[] = [];
    const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 500;
    const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 400;

    const coinTarget = { x: typeof window !== 'undefined' ? window.innerWidth - 180 : 800, y: 30 };
    const gemTarget = { x: typeof window !== 'undefined' ? window.innerWidth - 100 : 900, y: 30 };
    const promoTarget = { x: typeof window !== 'undefined' ? window.innerWidth - 240 : 700, y: 30 };
    const xpTarget = { x: 120, y: typeof window !== 'undefined' ? window.innerHeight - 80 : 700 };
    const badgeTarget = { x: 120, y: 120 };

    if (event.coins) {
      newParticles.push({
        id: 'coin_' + Date.now(),
        type: 'coins',
        icon: '🪙',
        startX: centerX,
        startY: centerY,
        targetX: coinTarget.x,
        targetY: coinTarget.y,
        color: '#FFD700',
        label: '+' + event.coins + ' Coins',
      });
    }

    if (event.gems) {
      newParticles.push({
        id: 'gem_' + Date.now(),
        type: 'gems',
        icon: '💎',
        startX: centerX,
        startY: centerY,
        targetX: gemTarget.x,
        targetY: gemTarget.y,
        color: '#00FFFF',
        label: '+' + event.gems + ' Gems',
      });
    }

    if (event.xp) {
      newParticles.push({
        id: 'xp_' + Date.now(),
        type: 'xp',
        icon: '⚡',
        startX: centerX,
        startY: centerY,
        targetX: xpTarget.x,
        targetY: xpTarget.y,
        color: '#3B82F6',
        label: '+' + event.xp + ' XP',
      });
    }

    if (event.promotionPoints) {
      newParticles.push({
        id: 'promo_' + Date.now(),
        type: 'promotionPoints',
        icon: '📢',
        startX: centerX,
        startY: centerY,
        targetX: promoTarget.x,
        targetY: promoTarget.y,
        color: '#AA2DFF',
        label: '+' + event.promotionPoints + ' Promo',
      });
    }

    if (event.badges && event.badges.length > 0) {
      newParticles.push({
        id: 'badge_' + Date.now(),
        type: 'badge',
        icon: event.badges[0].icon || '🏆',
        startX: centerX,
        startY: centerY,
        targetX: badgeTarget.x,
        targetY: badgeTarget.y,
        color: '#FFD700',
        label: event.badges[0].name,
      });
    }

    setParticles(newParticles);
    setTimeout(() => {
      SoundSystemEngine.play('reward_deposit');
      setParticles([]);
    }, 900);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99999 }}>
      <AnimatePresence>
        {activeEvent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 50 }}
            animate={{ opacity: 1, scale: 1.05, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -40 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(10, 14, 35, 0.95)',
              border: '2px solid rgba(0, 255, 255, 0.5)',
              boxShadow: '0 0 40px rgba(0, 255, 255, 0.3), 0 20px 60px rgba(0,0,0,0.9)',
              borderRadius: 16,
              padding: '20px 32px',
              textAlign: 'center',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.15em', color: '#00FFFF', marginBottom: 6 }}>
              REWARD EARNED • {activeEvent.source.toUpperCase()}
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
              {activeEvent.xp ? <div style={{ color: '#3B82F6', fontWeight: 900, fontSize: 16 }}>⚡ +{activeEvent.xp} XP</div> : null}
              {activeEvent.coins ? <div style={{ color: '#FFD700', fontWeight: 900, fontSize: 16 }}>🪙 +{activeEvent.coins} Coins</div> : null}
              {activeEvent.gems ? <div style={{ color: '#00FFFF', fontWeight: 900, fontSize: 16 }}>💎 +{activeEvent.gems} Gems</div> : null}
              {activeEvent.promotionPoints ? <div style={{ color: '#AA2DFF', fontWeight: 900, fontSize: 16 }}>📢 +{activeEvent.promotionPoints} Promo</div> : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: p.startX, y: p.startY, scale: 1.2, opacity: 1 }}
          animate={{ x: p.targetX, y: p.targetY, scale: 0.4, opacity: 0.9 }}
          transition={{ duration: 0.85, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(0,0,0,0.8)',
            border: '1px solid ' + p.color,
            boxShadow: '0 0 20px ' + p.color,
            borderRadius: 20,
            padding: '6px 12px',
            color: '#fff',
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          <span>{p.icon}</span>
          <span>{p.label}</span>
        </motion.div>
      ))}
    </div>
  );
};

export default RewardFlightOverlay;