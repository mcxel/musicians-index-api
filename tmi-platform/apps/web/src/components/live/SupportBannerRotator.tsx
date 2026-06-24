'use client';

/**
 * SupportBannerRotator — rotating support/monetization banner for performers.
 *
 * Every performer gets:
 * - Tip Me
 * - Join Fan Club
 * - Buy Merch
 * - Book Me
 * - VIP Access
 *
 * Rotates every 30s automatically, or can be manually triggered.
 * Does NOT interrupt the performance.
 * Lives as a persistent corner element.
 */

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

export type SupportActionType = 'tip' | 'fan-club' | 'merch' | 'booking' | 'vip-access' | 'custom';

export interface SupportAction {
  id: string;
  type: SupportActionType;
  label: string;
  icon: string;
  color: string;
  href?: string;
  onClick?: () => void;
  description?: string;
}

interface Props {
  performerId: string;
  performerName: string;
  actions?: SupportAction[];
  autoRotateMs?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

// ─── Default support actions ──────────────────────────────────────────────────

const DEFAULT_ACTIONS: Record<SupportActionType, SupportAction> = {
  'tip': {
    id: 'support-tip',
    type: 'tip',
    label: 'Tip Me',
    icon: '💸',
    color: '#FF2DAA',
    description: 'Support this performance',
  },
  'fan-club': {
    id: 'support-fan-club',
    type: 'fan-club',
    label: 'Fan Club',
    icon: '⭐',
    color: '#FFD700',
    description: 'Exclusive access',
  },
  'merch': {
    id: 'support-merch',
    type: 'merch',
    label: 'Merch',
    icon: '👕',
    color: '#00E5FF',
    description: 'Limited edition gear',
  },
  'booking': {
    id: 'support-booking',
    type: 'booking',
    label: 'Book Me',
    icon: '🎤',
    color: '#00FF88',
    description: 'Hire for your event',
  },
  'vip-access': {
    id: 'support-vip',
    type: 'vip-access',
    label: 'VIP Access',
    icon: '🎟',
    color: '#AA2DFF',
    description: 'VIP passes & perks',
  },
  'custom': {
    id: 'support-custom',
    type: 'custom',
    label: 'Support',
    icon: '❤️',
    color: '#fff',
  },
};

export default function SupportBannerRotator({
  performerId,
  performerName,
  actions,
  autoRotateMs = 30000,
  position = 'bottom-right',
  className,
}: Props) {
  const actionList = actions || Object.values(DEFAULT_ACTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const currentAction = actionList[currentIndex]!;

  // Auto-rotate
  useEffect(() => {
    if (isHovered || actionList.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % actionList.length);
    }, autoRotateMs);

    return () => clearInterval(timer);
  }, [actionList.length, autoRotateMs, isHovered]);

  const nextAction = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % actionList.length);
  }, [actionList.length]);

  const prevAction = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + actionList.length) % actionList.length);
  }, [actionList.length]);

  const positionMap = {
    'top-left':     { top: 20, left: 20, right: 'auto', bottom: 'auto' },
    'top-right':    { top: 20, right: 20, left: 'auto', bottom: 'auto' },
    'bottom-left':  { bottom: 20, left: 20, right: 'auto', top: 'auto' },
    'bottom-right': { bottom: 20, right: 20, left: 'auto', top: 'auto' },
  };

  const posStyle = positionMap[position];

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      style={{
        position: 'fixed',
        ...posStyle,
        zIndex: 30,
        width: 'fit-content',
        maxWidth: 280,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        style={{
          background: `linear-gradient(135deg,${currentAction.color}08,${currentAction.color}04)`,
          border: `1.5px solid ${currentAction.color}44`,
          borderRadius: 14,
          padding: 12,
          boxShadow: `0 0 40px ${currentAction.color}22, 0 12px 40px rgba(0,0,0,0.6)`,
          backdropFilter: 'blur(8px)',
        }}
        layout
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 10,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 20 }}>{currentAction.icon}</span>
            <div>
              <div style={{
                fontSize: 11, fontWeight: 900, color: currentAction.color,
                letterSpacing: '.08em', lineHeight: 1,
              }}>
                {currentAction.label}
              </div>
              <div style={{
                fontSize: 8, color: 'rgba(255,255,255,0.3)', marginTop: 2,
              }}>
                {performerName}
              </div>
            </div>
          </div>
          {actionList.length > 1 && (
            <div style={{
              display: 'flex', gap: 4,
            }}>
              {actionList.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: i === currentIndex ? currentAction.color : 'rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                  }}
                  onClick={() => setCurrentIndex(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        {currentAction.description && (
          <div style={{
            fontSize: 10, color: 'rgba(255,255,255,0.5)',
            marginBottom: 12, lineHeight: 1.4,
          }}>
            {currentAction.description}
          </div>
        )}

        {/* CTA */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAction.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {currentAction.href ? (
              <Link
                href={currentAction.href}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '10px 16px', borderRadius: 10,
                  background: currentAction.color,
                  color: '#050310',
                  fontSize: 11, fontWeight: 900, letterSpacing: '.08em',
                  textDecoration: 'none',
                  boxShadow: `0 0 24px ${currentAction.color}44`,
                  transition: 'transform 0.15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {currentAction.label.toUpperCase()}
              </Link>
            ) : currentAction.onClick ? (
              <button
                onClick={currentAction.onClick}
                style={{
                  width: '100%', padding: '10px 16px', borderRadius: 10,
                  background: currentAction.color,
                  border: 'none',
                  color: '#050310',
                  fontSize: 11, fontWeight: 900, letterSpacing: '.08em',
                  cursor: 'pointer',
                  boxShadow: `0 0 24px ${currentAction.color}44`,
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {currentAction.label.toUpperCase()}
              </button>
            ) : (
              <div
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '10px 16px', borderRadius: 10,
                  background: currentAction.color,
                  color: '#050310',
                  fontSize: 11, fontWeight: 900, letterSpacing: '.08em',
                }}
              >
                {currentAction.label.toUpperCase()}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation (shown on hover or if only one action) */}
        {(isHovered || actionList.length === 1) && actionList.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: 'flex', gap: 6, marginTop: 10,
            }}
          >
            <button
              onClick={prevAction}
              style={{
                flex: 1, padding: '6px', borderRadius: 6,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)', fontSize: 9, cursor: 'pointer',
              }}
            >
              ← PREV
            </button>
            <button
              onClick={nextAction}
              style={{
                flex: 1, padding: '6px', borderRadius: 6,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)', fontSize: 9, cursor: 'pointer',
              }}
            >
              NEXT →
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
