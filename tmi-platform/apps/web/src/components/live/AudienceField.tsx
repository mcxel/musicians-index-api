'use client';

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';

type AudienceSeat = {
  id: string;
  tag: string;
  active: boolean;
  reaction?: string;
};

const REACTIONS = ['🔥', '💬', '⚡', '👑', '🎤'] as const;

// Diverse avatar pool — youth, adult, older, all body types, all tones
const AVATAR_EMOJIS = [
  '🧑🏿', '🧑🏾', '🧑🏽', '🧑🏼', '🧑🏻', '🧑',
  '👩🏿', '👩🏾', '👩🏽', '👩🏼', '👩🏻',
  '👨🏿', '👨🏾', '👨🏽', '👨🏼', '👨🏻',
  '🧓🏿', '🧓🏾', '🧓🏽', '🧓🏼', '🧓🏻',
  '👴🏿', '👴🏾', '👴🏽', '👴🏼', '👴🏻',
  '👵🏿', '👵🏾', '👵🏽', '👵🏼', '👵🏻',
  '🧒🏿', '🧒🏾', '🧒🏽', '🧒🏼', '🧒🏻',
  '👦🏿', '👦🏾', '👦🏽', '👦🏼', '👦🏻',
  '👧🏿', '👧🏾', '👧🏽', '👧🏼', '👧🏻',
  '🧑‍🦱', '🧑‍🦲', '🧑‍🦳', '🧑‍🦰',
  '👩‍🦱', '👩‍🦲', '👩‍🦳', '👩‍🦰',
  '🎤', '🎧', '🎶', '🎸',
] as const;

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
    avatar: AVATAR_EMOJIS[hash % AVATAR_EMOJIS.length]!,
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
              fontSize: 28,
              boxShadow: `0 0 12px ${ghost.color}44`,
            }}
          >
            {ghost.avatar}
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

// ── MY SEAT: the seat ID the current user is sitting in
const MY_SEAT_KEY = "tmi_my_audience_seat";

export default function AudienceField({
  isMobile,
  status = "live",
}: {
  isMobile?: boolean;
  /** live | replay | finished — controls whether seating is allowed */
  status?: "live" | "replay" | "finished";
}) {
  const base = useMemo(() => buildSeats(isMobile ? 24 : 48), [isMobile]);
  const [seats, setSeats] = useState<AudienceSeat[]>(base);
  const [occupancy, setOccupancy] = useState(84);
  const [joinBurst, setJoinBurst] = useState<number | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<AudienceSeat | null>(null);
  const [followedSeats, setFollowedSeats] = useState<Set<string>>(new Set());
  const [sentReacts, setSentReacts] = useState<Record<string, string>>({});
  const prevOccupancyRef = useRef(84);

  // MY SEAT — restore from session storage, allow sitting in empty seats
  const [mySeatId, setMySeatId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(MY_SEAT_KEY);
  });

  const sitInSeat = useCallback((seatId: string) => {
    if (status === "finished") return; // finished shows lock seating
    setMySeatId(seatId);
    if (typeof window !== "undefined") sessionStorage.setItem(MY_SEAT_KEY, seatId);
    // Mark the seat as active (occupied) in the grid
    setSeats((prev) => prev.map((s) => s.id === seatId ? { ...s, active: true } : s));
  }, [status]);

  const leaveSeat = useCallback(() => {
    if (mySeatId) {
      setSeats((prev) => prev.map((s) => s.id === mySeatId ? { ...s, active: false } : s));
    }
    setMySeatId(null);
    if (typeof window !== "undefined") sessionStorage.removeItem(MY_SEAT_KEY);
  }, [mySeatId]);

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

      {/* Status banner */}
      {status !== "live" && (
        <div style={{ padding: "6px 12px", borderRadius: 6, background: status === "finished" ? "rgba(255,68,68,0.08)" : "rgba(255,215,0,0.08)", border: `1px solid ${status === "finished" ? "rgba(255,68,68,0.3)" : "rgba(255,215,0,0.3)"}`, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: status === "finished" ? "#FF4444" : "#FFD700", letterSpacing: "0.1em" }}>
            {status === "finished" ? "📼 REPLAY MODE — Audience locked for this session" : "⏳ REPLAY — Browse the audience from this show"}
          </span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.16em', color: '#00FFFF', fontWeight: 800 }}>
            {status === 'live' ? 'LIVE AUDIENCE' : status === 'replay' ? 'REPLAY AUDIENCE' : 'AUDIENCE — SHOW ENDED'}
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
            {joinBurst !== null && (
              <span aria-hidden style={{ position: 'absolute', right: '100%', marginRight: 6, whiteSpace: 'nowrap', fontSize: 10, fontWeight: 900, color: '#00FF88', letterSpacing: '0.06em', animation: 'joinBurstFloat 1.4s ease-out forwards', pointerEvents: 'none' }}>
                +{joinBurst} JOINED
              </span>
            )}
            <div style={{ fontSize: 11, fontWeight: 900, color: occupancy >= 88 ? '#FFD700' : '#00FFFF', letterSpacing: '0.08em', transition: 'color 0.6s ease' }} aria-live="polite">
              {occupancy}% <span style={{ opacity: 0.55, fontSize: 8, fontWeight: 700 }}>OCCUPIED</span>
            </div>
          </div>
          {mySeatId && (
            <span style={{ fontSize: 8, fontWeight: 900, color: '#00FF88', letterSpacing: '0.1em', background: 'rgba(0,255,136,0.12)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 4, padding: '2px 7px' }}>
              SEATED ✓
            </span>
          )}
        </div>
        {/* Sit/Leave controls */}
        <div style={{ display: 'flex', gap: 6 }}>
          {mySeatId && (
            <button onClick={leaveSeat} style={{ padding: '4px 12px', borderRadius: 6, background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#FF4444', fontSize: 9, fontWeight: 800, cursor: 'pointer', letterSpacing: '0.08em' }}>
              LEAVE SEAT
            </button>
          )}
          {!mySeatId && status !== 'finished' && (
            <button
              onClick={() => {
                const empty = seats.find((s) => !s.active);
                if (empty) sitInSeat(empty.id);
              }}
              style={{ padding: '4px 14px', borderRadius: 6, background: 'rgba(0,255,136,0.12)', border: '1px solid rgba(0,255,136,0.3)', color: '#00FF88', fontSize: 9, fontWeight: 800, cursor: 'pointer', letterSpacing: '0.08em' }}>
              + SIT IN AUDIENCE
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(6, minmax(0, 1fr))' : 'repeat(8, minmax(0, 1fr))',
          gap: 8,
        }}
      >
        {seats.map((seat, i) => {
          const ghost = ghostForSeat(seat.tag);
          const isMe = seat.id === mySeatId;
          const isEmpty = !seat.active && !isMe;
          const canSitHere = isEmpty && status !== 'finished' && !mySeatId;
          return (
          <div
            key={seat.id}
            role="button"
            tabIndex={0}
            aria-label={isMe ? `YOUR SEAT — ${seat.tag}` : seat.active ? `Audience seat ${seat.tag} — click to view profile` : canSitHere ? `Empty seat ${seat.tag} — click to sit here` : `Empty seat ${seat.tag}`}
            onClick={() => {
              if (isMe) { leaveSeat(); return; }
              if (seat.active) { setSelectedSeat(seat); return; }
              if (canSitHere) { sitInSeat(seat.id); }
            }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { if (isMe) { leaveSeat(); } else if (seat.active) { setSelectedSeat(seat); } else if (canSitHere) { sitInSeat(seat.id); } } }}
            style={{
              aspectRatio: '1 / 1',
              borderRadius: 8,
              border: isMe
                ? '2px solid #00FF88'
                : seat.active
                ? `1px solid ${ghost.color}55`
                : canSitHere
                ? '1px dashed rgba(0,255,136,0.35)'
                : '1px solid rgba(255,255,255,0.08)',
              background: isMe
                ? 'rgba(0,255,136,0.18)'
                : seat.active
                ? `${ghost.color}12`
                : canSitHere
                ? 'rgba(0,255,136,0.04)'
                : 'rgba(255,255,255,0.03)',
              color: 'rgba(255,255,255,0.72)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: seat.active || isMe ? 18 : 11,
              fontWeight: 700,
              position: 'relative',
              transform: 'translateZ(0)',
              animation: (seat.active || isMe) ? `audienceSeatPulse ${2 + (i % 3)}s ease-in-out infinite` : undefined,
              willChange: 'transform, opacity',
              overflow: 'hidden',
              cursor: (seat.active || isMe || canSitHere) ? 'pointer' : 'default',
              boxShadow: isMe ? '0 0 14px rgba(0,255,136,0.4)' : seat.active ? `0 0 8px ${ghost.color}22` : 'none',
              opacity: seat.active || isMe ? 1 : canSitHere ? 0.65 : 0.28,
            }}
          >
            {isMe ? '🙋' : seat.active ? ghost.avatar : canSitHere ? '+' : '💺'}
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
                fontSize: 6,
                letterSpacing: '0.03em',
                color: isMe ? '#00FF88' : seat.active ? ghost.color : 'rgba(255,255,255,0.3)',
                whiteSpace: 'nowrap',
                opacity: 0.8,
                fontWeight: isMe ? 900 : 400,
              }}
            >
              {isMe ? 'YOU' : seat.tag}
            </span>
          </div>
          );
        })}
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
