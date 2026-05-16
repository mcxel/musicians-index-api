"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ImageSlotWrapper } from '@/components/visual-enforcement';
import {
  type PerformerRankData,
  simulateRankTick,
} from "@/engines/ranking/RankMovementEngine";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Top10ReactionLayerProps {
  performers: PerformerRankData[];
  activated: boolean;           // false until post-open delay fires
  category: string;
  accentColor: string;
  compact?: boolean;
}

// ─── TREND ARROW ─────────────────────────────────────────────────────────────
const TREND = {
  rising:  { arrow: "↑", color: "#00FF88", label: "RISING" },
  falling: { arrow: "↓", color: "#FF4444", label: "FALLING" },
  holding: { arrow: "→", color: "#4488FF", label: "HOLD"   },
};

// ─── THUMB BUTTON ─────────────────────────────────────────────────────────────
function ThumbButton({
  likes,
  activated,
  staggerMs,
}: {
  likes: number;
  activated: boolean;
  staggerMs: number;
}) {
  const [popped, setPopped] = useState(false);
  const [localLikes, setLocalLikes] = useState(likes);

  // Auto-pulse on activation with stagger
  useEffect(() => {
    if (!activated) return;
    const t = setTimeout(() => {
      setPopped(true);
      setLocalLikes((n) => n + Math.floor(Math.random() * 8 + 1));
      setTimeout(() => setPopped(false), 300);
    }, staggerMs);
    return () => clearTimeout(t);
  }, [activated, staggerMs]);

  // Update likes from parent
  useEffect(() => { setLocalLikes(likes); }, [likes]);

  function handleClick() {
    setPopped(true);
    setLocalLikes((n) => n + 1);
    setTimeout(() => setPopped(false), 300);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Like"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 6,
        padding: "3px 7px",
        cursor: "pointer",
        transform: popped ? "scale(1.18)" : "scale(1)",
        transition: "transform 180ms cubic-bezier(.22,.8,.2,1)",
        boxShadow: popped ? "0 0 12px rgba(255,45,170,0.5)" : "none",
      }}
    >
      <span style={{ fontSize: 12, lineHeight: 1 }}>👍</span>
      <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>
        {localLikes.toLocaleString()}
      </span>
    </button>
  );
}

// ─── VOTE TICKER ─────────────────────────────────────────────────────────────
function VoteTicker({ votes, activated }: { votes: number; activated: boolean }) {
  const [displayed, setDisplayed] = useState(votes);
  const [flash, setFlash]         = useState(false);

  useEffect(() => {
    if (!activated) return;
    if (displayed === votes) return;
    setFlash(true);
    const t = setTimeout(() => { setDisplayed(votes); setFlash(false); }, 180);
    return () => clearTimeout(t);
  }, [votes, activated, displayed]);

  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: "0.08em",
        color: flash ? "#FFD700" : "rgba(255,255,255,0.55)",
        transition: "color 180ms ease",
      }}
    >
      {displayed.toLocaleString()} VOTES
    </span>
  );
}

// ─── PERFORMER CARD ──────────────────────────────────────────────────────────
function PerformerCard({
  performer,
  activated,
  accentColor,
  staggerMs,
  compact,
}: {
  performer: PerformerRankData;
  activated: boolean;
  accentColor: string;
  staggerMs: number;
  compact: boolean;
}) {
  const [bouncing, setBouncing] = useState(false);
  const prevRankRef = useRef(performer.rank);

  // Bounce on rank change
  useEffect(() => {
    if (!activated) return;
    if (prevRankRef.current !== performer.rank) {
      setBouncing(true);
      const t = setTimeout(() => setBouncing(false), 400);
      prevRankRef.current = performer.rank;
      return () => clearTimeout(t);
    }
  }, [performer.rank, activated]);

  const trend = TREND[performer.trend];
  const isTopThree = performer.rank <= 3;

  return (
    <Link
      href={`/profile/${performer.performerId}`}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: compact ? 8 : 10,
          padding: compact ? "7px 10px" : "9px 12px",
          borderRadius: 10,
          border: `1px solid ${isTopThree ? accentColor + "40" : "rgba(255,255,255,0.06)"}`,
          background: isTopThree ? `${accentColor}08` : "rgba(255,255,255,0.02)",
          transform: bouncing ? "translateY(-3px) scale(1.01)" : "translateY(0) scale(1)",
          transition: "transform 280ms cubic-bezier(.22,.8,.2,1), border-color 300ms ease",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Activation enter shimmer */}
        {activated && isTopThree && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(90deg, transparent 0%, ${accentColor}0a 50%, transparent 100%)`,
              borderRadius: 10,
              pointerEvents: "none",
            }}
          />
        )}

        {/* Rank number */}
        <div
          style={{
            minWidth: compact ? 22 : 26,
            textAlign: "center",
            fontSize: compact ? 14 : 17,
            fontWeight: 900,
            color: isTopThree ? accentColor : "rgba(255,255,255,0.3)",
            lineHeight: 1,
          }}
        >
          {performer.rank}
        </div>

        {/* Avatar */}
        <div
          style={{
            width: compact ? 30 : 38,
            height: compact ? 30 : 38,
            borderRadius: "50%",
            overflow: "hidden",
            border: `1.5px solid ${accentColor}30`,
            flexShrink: 0,
            background: "rgba(255,255,255,0.05)",
          }}
        >
          <ImageSlotWrapper imageId="img-3n15sp" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
        </div>

        {/* Name + category */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: compact ? 10 : 11,
              fontWeight: 900,
              color: "#fff",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              letterSpacing: "0.02em",
            }}
          >
            {performer.name}
          </p>
          {!compact && (
            <p style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", margin: "1px 0 0", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {performer.category}
            </p>
          )}
        </div>

        {/* Vote count + thumb */}
        {activated && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", flexShrink: 0 }}>
            <VoteTicker votes={performer.votes} activated={activated} />
            <ThumbButton likes={performer.likes} activated={activated} staggerMs={staggerMs} />
          </div>
        )}

        {/* Trend arrow — small corner badge */}
        {activated && (
          <div
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              display: "flex",
              alignItems: "center",
              gap: 2,
              padding: "1px 5px",
              borderRadius: 4,
              background: `${trend.color}18`,
              border: `1px solid ${trend.color}30`,
            }}
          >
            <span style={{ fontSize: 9, fontWeight: 900, color: trend.color }}>
              {trend.arrow}
            </span>
            {performer.delta !== 0 && (
              <span style={{ fontSize: 7, fontWeight: 800, color: trend.color }}>
                {Math.abs(performer.delta)}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

// ─── LIVE BADGE ───────────────────────────────────────────────────────────────
function LiveBadge({ accentColor }: { accentColor: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: accentColor,
          boxShadow: `0 0 8px ${accentColor}`,
          animation: "pulse 1.4s ease-in-out infinite",
        }}
      />
      <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.2em", color: accentColor, textTransform: "uppercase" }}>
        LIVE
      </span>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function Top10ReactionLayer({
  performers: initialPerformers,
  activated,
  category,
  accentColor,
  compact = false,
}: Top10ReactionLayerProps) {
  const [performers, setPerformers] = useState(initialPerformers);

  // Sync initial performers from parent
  useEffect(() => { setPerformers(initialPerformers); }, [initialPerformers]);

  // Live rank tick every 8s once activated
  const tick = useCallback(() => {
    setPerformers((prev) => simulateRankTick(prev, 0.2));
  }, []);

  useEffect(() => {
    if (!activated) return;
    const id = setInterval(tick, 8000);
    return () => clearInterval(id);
  }, [activated, tick]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: compact ? 6 : 8,
        }}
      >
        <div>
          <p style={{ fontSize: 8, letterSpacing: "0.24em", color: accentColor, fontWeight: 800, textTransform: "uppercase", margin: 0 }}>
            Top 10
          </p>
          <p style={{ fontSize: compact ? 12 : 14, fontWeight: 900, color: "#fff", margin: "1px 0 0", letterSpacing: "0.02em" }}>
            {category}
          </p>
        </div>
        {activated && <LiveBadge accentColor={accentColor} />}
      </div>

      {/* Performer list */}
      {performers.map((p, i) => (
        <PerformerCard
          key={p.performerId}
          performer={p}
          activated={activated}
          accentColor={accentColor}
          staggerMs={80 + i * 120}
          compact={compact}
        />
      ))}
    </div>
  );
}
