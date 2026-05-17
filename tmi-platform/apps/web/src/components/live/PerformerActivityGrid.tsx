"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { usePerformerActivity } from "@/lib/hooks/usePerformerActivity";
import type { PerformerActivityState } from "@/lib/hooks/usePerformerActivity";

const STYLE_ID = "pag-activity-styles";

function ensureStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes pagPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(255,215,0,0); }
      50%       { box-shadow: 0 0 14px 2px rgba(255,215,0,0.45); }
    }
    @keyframes pagSpeak {
      0%, 100% { transform: scaleY(1); }
      50%       { transform: scaleY(1.7); }
    }
    @keyframes pagFocusPulse {
      0%, 100% { box-shadow: 0 0 22px rgba(0,255,255,0.55), 0 0 8px rgba(0,255,255,0.25) inset; }
      50%       { box-shadow: 0 0 36px rgba(0,255,255,0.8), 0 0 16px rgba(0,255,255,0.4) inset; }
    }
    @keyframes pagFocusEnter {
      0%   { opacity: 0;   transform: scale(1.0); box-shadow: 0 0 0   0   rgba(0,255,255,0);   }
      25%  { opacity: 0.6; transform: scale(1.04); box-shadow: 0 0 44px 6px rgba(0,255,255,0.7); }
      100% { opacity: 0;   transform: scale(1.0); box-shadow: 0 0 0   0   rgba(0,255,255,0);   }
    }
  `;
  document.head.appendChild(s);
}

const STATE_CONFIG: Record<
  PerformerActivityState,
  { border: string; opacity: number; label: string; labelColor: string }
> = {
  spotlight: {
    border: "2px solid #00FFFF",
    opacity: 1,
    label: "SPOTLIGHT",
    labelColor: "#00FFFF",
  },
  active: {
    border: "1px solid #FFD700",
    opacity: 1,
    label: "ACTIVE",
    labelColor: "#FFD700",
  },
  idle: {
    border: "1px solid rgba(255,255,255,0.12)",
    opacity: 0.65,
    label: "IDLE",
    labelColor: "rgba(255,255,255,0.38)",
  },
};

interface PerformerTileProps {
  userId: string;
  displayName?: string;
  roomId: string;
  isFocus: boolean;
  anyHasFocus: boolean;
  focusEntryKey: number;
  onScoreUpdate: (userId: string, score: number) => void;
}

function PerformerTile({
  userId,
  displayName,
  roomId,
  isFocus,
  anyHasFocus,
  focusEntryKey,
  onScoreUpdate,
}: PerformerTileProps) {
  const { state, isSpeaking, hasCameraOn, score } = usePerformerActivity(userId, roomId);
  const cfg = STATE_CONFIG[state];
  const name = displayName ?? (userId.startsWith("viewer-") ? "Guest" : userId);

  useEffect(() => {
    onScoreUpdate(userId, score);
  }, [userId, score, onScoreUpdate]);

  // Non-focus tiles dim when another performer owns the stage
  const dimOpacity = anyHasFocus && !isFocus ? Math.min(cfg.opacity, 0.55) : cfg.opacity;
  const focusScale = isFocus && state === "spotlight" ? "scale(1.15)" : state === "spotlight" ? "scale(1.11)" : "scale(1)";

  return (
    <div
      style={{
        position: "relative",
        width: 112,
        padding: "10px 8px 8px",
        borderRadius: 10,
        border: isFocus ? "2px solid #00FFFF" : cfg.border,
        background:
          state === "spotlight"
            ? "linear-gradient(140deg, rgba(0,255,255,0.12) 0%, rgba(7,7,24,0.92) 100%)"
            : state === "active"
              ? "linear-gradient(140deg, rgba(255,215,0,0.08) 0%, rgba(5,5,14,0.9) 100%)"
              : "rgba(255,255,255,0.04)",
        opacity: dimOpacity,
        transform: focusScale,
        transition: "transform 280ms ease, opacity 400ms ease",
        animation: isFocus
          ? "pagFocusPulse 1.8s ease-in-out infinite"
          : state === "active"
            ? "pagPulse 2s ease-in-out infinite"
            : "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        zIndex: isFocus ? 2 : 1,
        overflow: "hidden",
      }}
    >
      {/* Focus burst flash — remounts on new focusEntryKey to restart animation */}
      {isFocus && (
        <div
          key={focusEntryKey}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 10,
            pointerEvents: "none",
            willChange: "transform, opacity",
            animationFillMode: "none",
            animation: "pagFocusEnter 0.65s ease forwards",
          }}
        />
      )}

      {/* Focus crown */}
      {isFocus && (
        <div
          style={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 14,
            lineHeight: 1,
          }}
        >
          👑
        </div>
      )}

      {/* State badge */}
      <div
        style={{
          fontSize: 7,
          fontWeight: 900,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: cfg.labelColor,
          textShadow: state === "spotlight" ? `0 0 8px ${cfg.labelColor}` : undefined,
        }}
      >
        {cfg.label}
      </div>

      {/* Avatar circle */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background:
            state === "spotlight"
              ? "radial-gradient(circle, rgba(0,255,255,0.3) 0%, rgba(0,255,255,0.06) 100%)"
              : state === "active"
                ? "radial-gradient(circle, rgba(255,215,0,0.2) 0%, rgba(255,215,0,0.04) 100%)"
                : "rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
        }}
      >
        {state === "spotlight" ? "🎤" : state === "active" ? "🎵" : "💤"}
      </div>

      {/* Speaking waveform */}
      {state === "spotlight" && isSpeaking && (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 10 }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 2,
                height: 4 + (i % 2) * 4,
                background: "#00FFFF",
                borderRadius: 1,
                animation: `pagSpeak ${0.5 + i * 0.12}s ease-in-out ${i * 80}ms infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Name */}
      <div
        style={{
          fontSize: 9,
          fontWeight: 800,
          color: state === "idle" ? "rgba(255,255,255,0.5)" : "#fff",
          textAlign: "center",
          maxWidth: 96,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </div>

      {/* Signal indicators */}
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {hasCameraOn && (
          <span style={{ fontSize: 8, opacity: state === "idle" ? 0.4 : 0.8 }}>📷</span>
        )}
        <span
          style={{
            fontSize: 7,
            fontWeight: 800,
            color: cfg.labelColor,
            letterSpacing: "0.04em",
          }}
        >
          {score}pt
        </span>
      </div>
    </div>
  );
}

interface PerformerActivityGridProps {
  performers: Array<{ userId: string; displayName?: string }>;
  roomId: string;
  overrideFocusId?: string | null;
  onStateSnapshot?: (scores: Record<string, number>, focusId: string | null) => void;
}

export default function PerformerActivityGrid({
  performers,
  roomId,
  overrideFocusId,
  onStateSnapshot,
}: PerformerActivityGridProps) {
  useEffect(() => {
    ensureStyles();
  }, []);

  const scoresRef = useRef<Record<string, number>>({});
  const [focusId, setFocusId] = useState<string | null>(null);
  const [focusVersion, setFocusVersion] = useState(0);
  const focusLockUntilRef = useRef<number>(0);
  const prevFocusIdRef = useRef<string | null>(null);
  const focusIdRef = useRef<string | null>(null);

  useEffect(() => {
    focusIdRef.current = focusId;
  }, [focusId]);

  // Increment focusVersion whenever a new performer acquires focus (drives flash overlay)
  useEffect(() => {
    if (focusId !== null && focusId !== prevFocusIdRef.current) {
      prevFocusIdRef.current = focusId;
      setFocusVersion((v) => v + 1);
    } else if (focusId === null) {
      prevFocusIdRef.current = null;
    }
  }, [focusId]);

  const handleScoreUpdate = useCallback((userId: string, score: number) => {
    scoresRef.current[userId] = score;
    const entries = Object.entries(scoresRef.current);
    if (entries.length === 0) return;
    const top = entries.reduce((best, cur) => (cur[1] > best[1] ? cur : best));
    if (top[1] < 5) {
      setFocusId(null);
      focusLockUntilRef.current = 0;
      onStateSnapshot?.({ ...scoresRef.current }, null);
      return;
    }
    const now = Date.now();
    setFocusId((prev) => {
      if (prev === top[0]) {
        onStateSnapshot?.({ ...scoresRef.current }, prev);
        return prev;
      }
      if (now < focusLockUntilRef.current) {
        const currentScore = scoresRef.current[prev ?? ""] ?? 0;
        if (top[1] < currentScore + 2) {
          onStateSnapshot?.({ ...scoresRef.current }, prev);
          return prev;
        }
      }
      focusLockUntilRef.current = now + 4000;
      onStateSnapshot?.({ ...scoresRef.current }, top[0]);
      return top[0];
    });
  }, [onStateSnapshot]);

  if (performers.length === 0) {
    return (
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", padding: "4px 0" }}>
        No performers on stage yet.
      </div>
    );
  }

  const anyHasFocus = focusId !== null;
  // overrideFocusId (from admin) takes precedence over computed focus at render time
  const effectiveFocusId = overrideFocusId !== undefined ? overrideFocusId : focusId;
  const effectiveAnyHasFocus = effectiveFocusId !== null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      {performers.map((p) => (
        <PerformerTile
          key={p.userId}
          userId={p.userId}
          displayName={p.displayName}
          roomId={roomId}
          isFocus={p.userId === effectiveFocusId}
          anyHasFocus={effectiveAnyHasFocus}
          focusEntryKey={focusVersion}
          onScoreUpdate={handleScoreUpdate}
        />
      ))}
    </div>
  );
}
