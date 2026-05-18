'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

type AudienceSeat = {
  id: string;
  tag: string;
  active: boolean;
  reaction?: string;
};

const REACTIONS = ['🔥', '💬', '⚡', '👑', '🎤'] as const;

function buildSeats(count: number): AudienceSeat[] {
  return Array.from({ length: count }, (_, i) => {
    const active = i % 3 !== 0;
    const reaction = i % 5 === 0 ? REACTIONS[i % REACTIONS.length] : undefined;
    return {
      id: `seat-${i + 1}`,
      tag: `F${(1000 + i).toString(36).toUpperCase()}`,
      active,
      reaction,
    };
  });
}

export default function AudienceField({ isMobile }: { isMobile?: boolean }) {
  const base = useMemo(() => buildSeats(isMobile ? 24 : 48), [isMobile]);
  const [seats, setSeats] = useState<AudienceSeat[]>(base);
  const [occupancy, setOccupancy] = useState(84);

  // Breathing occupancy — drifts ±1 every 2.5 s, clamped 78–92
  useEffect(() => {
    const id = setInterval(() => {
      setOccupancy((prev) => {
        const next = prev + (Math.random() > 0.5 ? 1 : -1);
        return Math.max(78, Math.min(92, next));
      });
    }, 2500);
    return () => clearInterval(id);
  }, []);

  // Seat flux — randomly flip one seat's active state every 4 s so the grid shifts
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

  return (
    <section
      style={{
        width: '100%',
        borderRadius: 12,
        border: '1px solid rgba(0,255,255,0.25)',
        background: 'linear-gradient(145deg, rgba(0,255,255,0.09), rgba(5,5,16,0.75))',
        padding: 12,
      }}
      aria-label="Live audience field"
    >
      <style>{`
        @keyframes audienceSeatPulse {
          0% { opacity: 0.62; transform: scale(1) translateZ(0); }
          50% { opacity: 1; transform: scale(1.045) translateZ(0); }
          100% { opacity: 0.62; transform: scale(1) translateZ(0); }
        }
        @keyframes audienceReactionPop {
          0% { opacity: 0; transform: translateY(2px) scale(0.92) translateZ(0); }
          30% { opacity: 1; transform: translateY(0) scale(1) translateZ(0); }
          70% { opacity: 1; transform: translateY(-1px) scale(1.03) translateZ(0); }
          100% { opacity: 0; transform: translateY(-3px) scale(0.95) translateZ(0); }
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <div style={{ fontSize: 9, letterSpacing: '0.16em', color: '#00FFFF', fontWeight: 800 }}>
          LIVE AUDIENCE
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 900,
            color: occupancy >= 88 ? '#FFD700' : '#00FFFF',
            letterSpacing: '0.08em',
            transition: 'color 0.6s ease',
            fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)",
          }}
          aria-live="polite"
          aria-label={`Audience occupancy ${occupancy} percent`}
        >
          {occupancy}% <span style={{ opacity: 0.55, fontSize: 8, fontWeight: 700 }}>OCCUPIED</span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(6, minmax(0, 1fr))' : 'repeat(8, minmax(0, 1fr))',
          gap: 8,
        }}
      >
        {seats.map((seat, i) => (
          <div
            key={seat.id}
            style={{
              aspectRatio: '1 / 1',
              borderRadius: 8,
              border: seat.active ? '1px solid rgba(0,255,255,0.35)' : '1px solid rgba(255,255,255,0.12)',
              background: seat.active ? 'rgba(0,0,0,0.62)' : 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.72)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
              position: 'relative',
              transform: 'translateZ(0)',
              animation: `audienceSeatPulse ${2 + (i % 3)}s ease-in-out infinite`,
              willChange: 'transform, opacity',
              overflow: 'hidden',
            }}
            aria-label={`Audience seat ${seat.tag}`}
          >
            🎧
            {seat.reaction ? (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 3,
                  fontSize: 9,
                  animation: `audienceReactionPop ${2.4 + (i % 2)}s ease-in-out infinite`,
                  transform: 'translateZ(0)',
                }}
                aria-hidden
              >
                {seat.reaction}
              </span>
            ) : null}
            <span
              style={{
                position: 'absolute',
                left: 2,
                bottom: 1,
                fontSize: 7,
                letterSpacing: '0.03em',
                color: 'rgba(255,255,255,0.58)',
                whiteSpace: 'nowrap',
              }}
            >
              {seat.tag}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
