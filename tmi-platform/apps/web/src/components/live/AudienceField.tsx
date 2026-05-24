'use client';

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';

type AudienceSeat = {
  id: string;
  tag: string;
  active: boolean;
  reaction?: string;
};

const REACTIONS = ['🔥', '💬', '⚡', '👑', '🎤'] as const;

const GHOST_NAMES = [
  'MusicHead', 'NeonFan', 'CrownWatcher', 'BeatRider', 'WaveBreaker',
  'FlowObserver', 'RhymeWatcher', 'CypherFan', 'PulseFan', 'GrooveHead',
  'LyricsLover', 'BattleViewer', 'StageWatcher', 'BeatNerd', 'RoomEnergy',
];
const GHOST_ROLES = ['Fan', 'Supporter', 'VIP', 'Ghost Listener', 'Super Fan'];
const ENERGY_COLORS = ['#00FF88', '#FFD700', '#FF2DAA', '#00FFFF', '#AA2DFF'];

function ghostForSeat(tag: string) {
  const hash = tag.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    name: GHOST_NAMES[hash % GHOST_NAMES.length]!,
    role: GHOST_ROLES[hash % GHOST_ROLES.length]!,
    energy: 28 + (hash % 62),
    color: ENERGY_COLORS[hash % ENERGY_COLORS.length]!,
  };
}

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

interface SeatProfileOverlayProps {
  seat: AudienceSeat;
  followed: boolean;
  onFollow: () => void;
  onReact: (emoji: string) => void;
  onClose: () => void;
}

function SeatProfileOverlay({ seat, followed, onFollow, onReact, onClose }: SeatProfileOverlayProps) {
  const ghost = ghostForSeat(seat.tag);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(5,5,16,0.72)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'rgba(5,5,16,0.96)',
          border: `1px solid ${ghost.color}40`,
          borderRadius: 16,
          padding: '24px 28px',
          minWidth: 260,
          maxWidth: 320,
          boxShadow: `0 0 40px ${ghost.color}22, 0 8px 32px rgba(0,0,0,0.7)`,
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 14,
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            fontSize: 18,
            cursor: 'pointer',
            lineHeight: 1,
          }}
          aria-label="Close"
        >
          ×
        </button>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              border: `2px solid ${ghost.color}`,
              background: `${ghost.color}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              boxShadow: `0 0 12px ${ghost.color}44`,
            }}
          >
            🎧
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', letterSpacing: '0.06em' }}>
              {ghost.name}
            </div>
            <div style={{ fontSize: 10, color: ghost.color, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>
              {ghost.role}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2, letterSpacing: '0.06em' }}>
              SEAT {seat.tag}
            </div>
          </div>
        </div>

        {/* Energy bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5 }}>
            Energy
          </div>
          <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
            <div
              style={{
                width: `${ghost.energy}%`,
                height: '100%',
                borderRadius: 3,
                background: `linear-gradient(90deg, ${ghost.color}, ${ghost.color}88)`,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <div style={{ fontSize: 9, color: ghost.color, fontWeight: 700, marginTop: 3 }}>
            {ghost.energy}/100
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button
            onClick={onFollow}
            style={{
              flex: 1,
              padding: '9px 0',
              borderRadius: 8,
              border: followed ? '1px solid #00FF88' : '1px solid rgba(0,255,136,0.4)',
              background: followed ? 'rgba(0,255,136,0.2)' : 'rgba(0,255,136,0.06)',
              color: '#00FF88',
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
              letterSpacing: '0.08em',
              transition: 'background 0.2s ease, border-color 0.2s ease',
            }}
          >
            {followed ? '✓ FOLLOWING' : '+ FOLLOW'}
          </button>
        </div>

        {/* React buttons */}
        <div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            React
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['🔥', '❤️', '⚡', '👑', '🎤'] as const).map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReact(emoji)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.04)',
                  fontSize: 18,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s ease, transform 0.15s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.12)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AudienceField({ isMobile }: { isMobile?: boolean }) {
  const base = useMemo(() => buildSeats(isMobile ? 24 : 48), [isMobile]);
  const [seats, setSeats] = useState<AudienceSeat[]>(base);
  const [occupancy, setOccupancy] = useState(84);
  const [joinBurst, setJoinBurst] = useState<number | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<AudienceSeat | null>(null);
  const [followedSeats, setFollowedSeats] = useState<Set<string>>(new Set());
  const [sentReacts, setSentReacts] = useState<Record<string, string>>({});
  const prevOccupancyRef = useRef(84);

  useEffect(() => {
    const id = setInterval(() => {
      setOccupancy((prev) => {
        const next = prev + (Math.random() > 0.5 ? 1 : -1);
        return Math.max(78, Math.min(92, next));
      });
    }, 2500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (occupancy > prevOccupancyRef.current) {
      const count = Math.floor(Math.random() * 4) + 1;
      setJoinBurst(count);
      const t = setTimeout(() => setJoinBurst(null), 1400);
      prevOccupancyRef.current = occupancy;
      return () => clearTimeout(t);
    }
    prevOccupancyRef.current = occupancy;
  }, [occupancy]);

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

  const handleReact = useCallback((seatId: string, emoji: string) => {
    setSentReacts((prev) => ({ ...prev, [seatId]: emoji }));
    setTimeout(() => {
      setSentReacts((prev) => {
        const next = { ...prev };
        delete next[seatId];
        return next;
      });
    }, 1500);
  }, []);

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
        @keyframes joinBurstFloat {
          0%   { opacity: 0; transform: translateY(4px) scale(0.9) translateZ(0); }
          20%  { opacity: 1; transform: translateY(0)   scale(1)   translateZ(0); }
          70%  { opacity: 1; transform: translateY(-4px) scale(1)  translateZ(0); }
          100% { opacity: 0; transform: translateY(-9px) scale(0.95) translateZ(0); }
        }
        @keyframes reactSent {
          0%   { opacity: 1; transform: translateY(0) scale(1.2) translateZ(0); }
          100% { opacity: 0; transform: translateY(-14px) scale(0.9) translateZ(0); }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.16em', color: '#00FFFF', fontWeight: 800 }}>
          LIVE AUDIENCE
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
          {joinBurst !== null && (
            <span
              aria-hidden
              style={{
                position: 'absolute',
                right: '100%',
                marginRight: 6,
                whiteSpace: 'nowrap',
                fontSize: 10,
                fontWeight: 900,
                color: '#00FF88',
                letterSpacing: '0.06em',
                animation: 'joinBurstFloat 1.4s ease-out forwards',
                pointerEvents: 'none',
                fontFamily: "var(--font-tmi-orbitron, 'Orbitron', monospace)",
              }}
            >
              +{joinBurst} JOINED
            </span>
          )}
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
            role={seat.active ? 'button' : undefined}
            tabIndex={seat.active ? 0 : undefined}
            aria-label={seat.active ? `Audience seat ${seat.tag} — click to view profile` : `Empty seat ${seat.tag}`}
            onClick={() => { if (seat.active) setSelectedSeat(seat); }}
            onKeyDown={(e) => { if (seat.active && (e.key === 'Enter' || e.key === ' ')) setSelectedSeat(seat); }}
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
              cursor: seat.active ? 'pointer' : 'default',
            }}
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
            {sentReacts[seat.id] && (
              <span
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 16,
                  animation: 'reactSent 1.5s ease-out forwards',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
                aria-hidden
              >
                {sentReacts[seat.id]}
              </span>
            )}
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

      {/* Seat profile overlay */}
      {selectedSeat && (
        <SeatProfileOverlay
          seat={selectedSeat}
          followed={followedSeats.has(selectedSeat.id)}
          onFollow={() => setFollowedSeats((prev) => new Set(prev).add(selectedSeat.id))}
          onReact={(emoji) => {
            handleReact(selectedSeat.id, emoji);
            setSelectedSeat(null);
          }}
          onClose={() => setSelectedSeat(null)}
        />
      )}
    </section>
  );
}
