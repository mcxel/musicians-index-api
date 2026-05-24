'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SpotlightPhase } from '@/hooks/useSpotlight';

const MAX_VISIBLE_ACTIVE_SEATS = 24;
const PROXIMITY_BURST_RADIUS = 5;
const REACTIONS = ['🔥', '💬', '⚡', '👑', '🎤', '💸'] as const;

interface Seat {
  id: string;
  tag: string;
  active: boolean;
  reaction: string | null;
  glowing: boolean;
  spotlit: boolean;
}

function buildBaseSeats(count: number): Seat[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `av-seat-${i}`,
    tag: `F${(1000 + i).toString(36).toUpperCase()}`,
    active: i % 3 !== 0,
    reaction: i % 7 === 0 ? REACTIONS[i % REACTIONS.length]! : null,
    glowing: false,
    spotlit: false,
  }));
}

interface AudienceVisibilityProps {
  spotlightPhase: SpotlightPhase;
  spotlightSeatIndex?: number;
  isMobile?: boolean;
  crowdEnergy?: number;
}

export function AudienceVisibility({
  spotlightPhase,
  spotlightSeatIndex,
  isMobile = false,
  crowdEnergy = 50,
}: AudienceVisibilityProps) {
  const totalSeats = isMobile ? 24 : 48;
  const base = useMemo(() => buildBaseSeats(totalSeats), [totalSeats]);
  const [seats, setSeats] = useState<Seat[]>(base);

  // Cap visible active seats at MAX_VISIBLE_ACTIVE_SEATS
  const visibleSeats = useMemo(() => {
    let activeCount = 0;
    return seats.map((s) => {
      if (!s.active) return s;
      if (activeCount >= MAX_VISIBLE_ACTIVE_SEATS) return { ...s, active: false };
      activeCount++;
      return s;
    });
  }, [seats]);

  // Proximity burst when spotlight fires
  const burstFiredRef = useRef(false);
  useEffect(() => {
    if (spotlightPhase === 'revealed' && !burstFiredRef.current) {
      burstFiredRef.current = true;
      const anchor = spotlightSeatIndex ?? Math.floor(Math.random() * totalSeats);

      setSeats((prev) =>
        prev.map((s, i) => {
          const dist = Math.abs(i - anchor);
          if (dist > PROXIMITY_BURST_RADIUS) return s;
          return {
            ...s,
            glowing: true,
            reaction: REACTIONS[Math.floor(Math.random() * REACTIONS.length)]!,
            spotlit: i === anchor,
          };
        })
      );

      // Clear burst after 3.5s
      const t = setTimeout(() => {
        setSeats((prev) =>
          prev.map((s) =>
            s.glowing || s.spotlit ? { ...s, glowing: false, spotlit: false } : s
          )
        );
        burstFiredRef.current = false;
      }, 3500);
      return () => clearTimeout(t);
    }
    if (spotlightPhase === 'idle') {
      burstFiredRef.current = false;
    }
  }, [spotlightPhase, spotlightSeatIndex, totalSeats]);

  // Organic seat flux every 4s
  const flipSeat = useCallback(() => {
    setSeats((prev) => {
      const idx = Math.floor(Math.random() * prev.length);
      return prev.map((s, i) => (i === idx ? { ...s, active: !s.active } : s));
    });
  }, []);

  useEffect(() => {
    const id = setInterval(flipSeat, 4000);
    return () => clearInterval(id);
  }, [flipSeat]);

  // Energy-driven reaction cycle
  useEffect(() => {
    const intervalMs = crowdEnergy >= 70 ? 1800 : crowdEnergy >= 40 ? 3200 : 5000;
    const id = setInterval(() => {
      setSeats((prev) => {
        const idx = Math.floor(Math.random() * prev.length);
        const reaction = REACTIONS[Math.floor(Math.random() * REACTIONS.length)]!;
        return prev.map((s, i) => (i === idx ? { ...s, reaction } : s));
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [crowdEnergy]);

  const cols = isMobile ? 6 : 8;

  return (
    <section
      style={{
        width: '100%',
        borderRadius: 12,
        border: '1px solid rgba(0,255,255,0.2)',
        background: 'linear-gradient(145deg, rgba(0,255,255,0.07), rgba(5,5,16,0.8))',
        padding: 12,
        transition: 'background 0.6s ease',
      }}
      aria-label="Live audience visibility"
    >
      <style>{`
        @keyframes avSeatPulse {
          0%,100% { opacity: 0.6; transform: scale(1) translateZ(0); }
          50%      { opacity: 1;   transform: scale(1.04) translateZ(0); }
        }
        @keyframes avGlow {
          0%   { box-shadow: 0 0 0px rgba(255,215,0,0); }
          40%  { box-shadow: 0 0 14px rgba(255,215,0,0.7); }
          100% { box-shadow: 0 0 0px rgba(255,215,0,0); }
        }
        @keyframes avSpotlit {
          0%   { box-shadow: 0 0 0px rgba(0,255,255,0); }
          30%  { box-shadow: 0 0 20px rgba(0,255,255,0.9), 0 0 40px rgba(0,255,255,0.4); }
          100% { box-shadow: 0 0 8px rgba(0,255,255,0.3); }
        }
        @keyframes avReaction {
          0%   { opacity: 0; transform: translateY(2px) scale(0.9) translateZ(0); }
          30%  { opacity: 1; transform: translateY(0) scale(1) translateZ(0); }
          70%  { opacity: 1; transform: translateY(-2px) scale(1.05) translateZ(0); }
          100% { opacity: 0; transform: translateY(-5px) scale(0.95) translateZ(0); }
        }
        @keyframes avParticle {
          0%   { opacity: 1; transform: translateY(0) scale(1) translateZ(0); }
          100% { opacity: 0; transform: translateY(-20px) scale(0.7) translateZ(0); }
        }
      `}</style>

      <div
        style={{
          fontSize: 9,
          letterSpacing: '0.16em',
          color: '#00FFFF',
          fontWeight: 800,
          marginBottom: 8,
          textTransform: 'uppercase',
        }}
      >
        AUDIENCE · {visibleSeats.filter((s) => s.active).length} ACTIVE
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: 6,
        }}
      >
        {visibleSeats.map((seat, i) => (
          <div
            key={seat.id}
            style={{
              aspectRatio: '1 / 1',
              borderRadius: 7,
              border: seat.spotlit
                ? '1px solid rgba(0,255,255,0.9)'
                : seat.glowing
                  ? '1px solid rgba(255,215,0,0.7)'
                  : seat.active
                    ? '1px solid rgba(0,255,255,0.3)'
                    : '1px solid rgba(255,255,255,0.1)',
              background: seat.spotlit
                ? 'rgba(0,255,255,0.15)'
                : seat.glowing
                  ? 'rgba(255,215,0,0.1)'
                  : seat.active
                    ? 'rgba(0,0,0,0.6)'
                    : 'rgba(255,255,255,0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              position: 'relative',
              transform: 'translateZ(0)',
              willChange: 'transform, opacity',
              animation: seat.spotlit
                ? `avSpotlit 3.5s ease-out forwards`
                : seat.glowing
                  ? `avGlow 2s ease-out forwards`
                  : `avSeatPulse ${2 + (i % 3)}s ease-in-out infinite`,
            }}
            aria-label={`Seat ${seat.tag}${seat.spotlit ? ' spotlit' : ''}`}
          >
            {seat.active || seat.spotlit ? '🎧' : '○'}
            {seat.reaction && (
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 1,
                  fontSize: 8,
                  animation: `avReaction 2.2s ease-out forwards`,
                  pointerEvents: 'none',
                }}
              >
                {seat.reaction}
              </span>
            )}
            {seat.spotlit && (
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 7,
                  color: '#00FFFF',
                  fontWeight: 900,
                  letterSpacing: '0.04em',
                  animation: 'avParticle 3s ease-out forwards',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                ✦ SPOT
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
