'use client';

/**
 * TMI Countdown Card
 *
 * Event card with live countdown timer.
 * Timer intensifies (glow + pulse) as the event approaches.
 *
 * Structure:
 * ════════════════════════════════════════
 * 🏆 RAP BATTLE
 * 02:41
 * [JOIN NOW]
 * ════════════════════════════════════════
 *
 * Features:
 * - Neon top/bottom borders animated
 * - Feature color glow
 * - Bold countdown timer
 * - CTA button with matching color
 * - Glow intensifies every 5 seconds
 * - Final 60s: faster pulse
 * - Final 10s: even faster pulse
 *
 * @example
 * <TmiCountdownCard
 *   feature="battles"
 *   title="RAP BATTLE"
 *   secondsRemaining={161}
 *   onJoin={handleJoin}
 * />
 */

import React, { useState, useEffect } from 'react';
import { getFeatureToken } from '../featureTokens';
import { TMI_MOTION } from '../motion';
import { TmiFeatureButton } from './TmiFeatureButton';

interface TmiCountdownCardProps {
  /** Feature ID (battles, cyphers, challenges, etc.) */
  feature: string;

  /** Event title */
  title: string;

  /** Seconds remaining until event starts */
  secondsRemaining: number;

  /** Called when user clicks [JOIN NOW] */
  onJoin?: () => void;

  /** Optional: custom content below title */
  subtitle?: string;

  /** Custom styling */
  style?: React.CSSProperties;

  /** Show as disabled/ended */
  disabled?: boolean;
}

export function TmiCountdownCard({
  feature,
  title,
  secondsRemaining,
  onJoin,
  subtitle,
  style,
  disabled = false,
}: TmiCountdownCardProps) {
  const token = getFeatureToken(feature);
  if (!token) return null;

  const [timeLeft, setTimeLeft] = useState(secondsRemaining);
  const [glowIntensity, setGlowIntensity] = useState<'normal' | 'intense' | 'critical'>('normal');

  // Update countdown timer and glow intensity
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = Math.max(prev - 1, 0);

        // Determine glow intensity
        if (newTime <= 10) {
          setGlowIntensity('critical');
        } else if (newTime <= 60) {
          setGlowIntensity('intense');
        } else {
          setGlowIntensity('normal');
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format time as MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Compute animation based on time remaining
  let pulseAnimation = 'none';
  if (glowIntensity === 'critical') {
    pulseAnimation = `countdownPulse 0.5s ease-in-out infinite`;
  } else if (glowIntensity === 'intense') {
    pulseAnimation = `countdownPulse 1s ease-in-out infinite`;
  }

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    borderRadius: '8px',
    background: `rgba(${token.color.rgb}, 0.08)`,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${token.color.primary}`,
    boxShadow: `0 0 ${glowIntensity === 'critical' ? 30 : glowIntensity === 'intense' ? 20 : 15}px ${token.color.primary}${glowIntensity === 'critical' ? 'cc' : glowIntensity === 'intense' ? '88' : '44'}`,
    transition: `all ${TMI_MOTION.durations.normal}ms ${TMI_MOTION.easing.smooth}`,
    opacity: disabled ? 0.6 : 1,
    ...style,
  };

  // Top border animation (neon line)
  const topBorderStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: `linear-gradient(90deg, transparent, ${token.color.primary}, transparent)`,
    borderRadius: '8px 8px 0 0',
    boxShadow: `0 0 10px ${token.color.primary}`,
    animation: `slideLeft 3s ease-in-out infinite`,
  };

  // Bottom border animation (neon line)
  const bottomBorderStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: `linear-gradient(90deg, transparent, ${token.color.primary}, transparent)`,
    borderRadius: '0 0 8px 8px',
    boxShadow: `0 0 10px ${token.color.primary}`,
    animation: `slideRight 3s ease-in-out infinite`,
  };

  return (
    <div style={containerStyle}>
      {/* Top border */}
      <div style={topBorderStyle} />

      {/* Feature icon + title */}
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div
          style={{
            fontSize: '2em',
            marginBottom: '4px',
          }}
        >
          {token.icon}
        </div>
        <div
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: token.color.primary,
            textShadow: token.glow.textGlowNormal,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: '0.875rem',
              color: '#aaaaaa',
              marginTop: '4px',
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* Countdown timer */}
      <div
        style={{
          fontSize: '2.25rem',
          fontWeight: 700,
          fontFamily: "'Courier New', monospace",
          letterSpacing: '0.05em',
          color: token.color.primary,
          textShadow: token.glow.textGlowNormal,
          animation: pulseAnimation,
          transition: `all ${TMI_MOTION.durations.normal}ms ${TMI_MOTION.easing.smooth}`,
          zIndex: 1,
        }}
      >
        {formattedTime}
      </div>

      {/* CTA Button */}
      <TmiFeatureButton
        feature={feature as any}
        onClick={onJoin}
        disabled={disabled || timeLeft === 0}
        size="normal"
        variant="hero"
        style={{
          marginTop: '8px',
          zIndex: 1,
        }}
      >
        {timeLeft === 0 ? 'ENDED' : 'JOIN NOW'}
      </TmiFeatureButton>

      {/* Bottom border */}
      <div style={bottomBorderStyle} />

      {/* Glow pulse indicator (for final 10 seconds) */}
      {glowIntensity === 'critical' && (
        <div
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '12px',
            border: `1px solid ${token.color.primary}`,
            boxShadow: `0 0 20px ${token.color.primary}88, inset 0 0 20px ${token.color.primary}22`,
            animation: `pulse 0.5s ease-in-out infinite`,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
}

export default TmiCountdownCard;
