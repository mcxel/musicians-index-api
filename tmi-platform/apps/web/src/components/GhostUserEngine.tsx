"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { startGhostForceV1 } from "@/lib/bots/BotDripEmitter";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ChatLine {
  id: number;
  name: string;
  text: string;
  ts: number;
}

interface ReactionBurst {
  id: number;
  emoji: string;
  x: number;
}

interface GhostUser {
  name: string;
  color: string;
  online: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const USER_COLORS = ["#00FFFF", "#FF2DAA", "#AA2DFF", "#FFD700", "#00FF88", "#FF6B35"];
const REACTIONS = ["🔥", "👏", "💎", "🎤", "🙌", "⚡"];
const MAX_CHAT = 30;
const MAX_REACTIONS = 12;


let _id = 0;
function uid() { return ++_id; }

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface GhostUserEngineProps {
  roomId?: string;
  compact?: boolean; // narrow sidebar mode
  className?: string;
  style?: React.CSSProperties;
}

export function GhostUserEngine({
  roomId = "room-main",
  compact = false,
  className,
  style,
}: GhostUserEngineProps) {
  const [chat, setChat] = useState<ChatLine[]>([]);
  const [reactions, setReactions] = useState<ReactionBurst[]>([]);
  const [ghosts, setGhosts] = useState<GhostUser[]>([]);
  const [viewers, setViewers] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const pushChat = useCallback((name: string, text: string) => {
    setChat((prev) => {
      const next = [...prev, { id: uid(), name, text, ts: Date.now() }];
      return next.length > MAX_CHAT ? next.slice(-MAX_CHAT) : next;
    });
  }, []);

  const burstReaction = useCallback((emoji: string) => {
    const burst: ReactionBurst = { id: uid(), emoji, x: 10 + Math.random() * 80 };
    setReactions((prev) => {
      const next = [...prev, burst];
      return next.length > MAX_REACTIONS ? next.slice(-MAX_REACTIONS) : next;
    });
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== burst.id));
    }, 2200);
  }, []);

  // Random ambient reactions every 10-22s
  useEffect(() => {
    const fire = () => {
      const count = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        setTimeout(() => burstReaction(REACTIONS[Math.floor(Math.random() * REACTIONS.length)]!), i * 180);
      }
    };
    const iv = setInterval(fire, 10000 + Math.random() * 12000);
    return () => clearInterval(iv);
  }, [burstReaction]);

  // Start ghost force
  useEffect(() => {
    stopRef.current = startGhostForceV1(roomId, {
      onChat: (name, text) => {
        pushChat(name, text);
        // Also register as a ghost user if not already present
        setGhosts((prev) => {
          if (prev.find((g) => g.name === name)) return prev;
          const color = USER_COLORS[prev.length % USER_COLORS.length]!;
          return [...prev, { name, color, online: true }];
        });
        // Increment viewer count on first ghost arrival
        setViewers((v) => v + 1);
      },
      onHype: () => {
        const emoji = REACTIONS[Math.floor(Math.random() * REACTIONS.length)]!;
        for (let i = 0; i < 4; i++) {
          setTimeout(() => burstReaction(emoji), i * 120);
        }
      },
      onTip: (name) => {
        pushChat(name, "💸 just tipped the artist!");
      },
      onDiag: () => {}, // suppress diag output from UI
    });

    return () => {
      stopRef.current?.();
    };
  }, [roomId, pushChat, burstReaction]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const w = compact ? 260 : 320;

  return (
    <div
      className={className}
      style={{
        width: w,
        background: "rgba(5,5,16,0.94)",
        border: "1px solid rgba(0,255,255,0.15)",
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
        ...style,
      }}
    >
      {/* Header */}
      <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00FF88", display: "inline-block", boxShadow: "0 0 6px #00FF88" }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: "#00FF88", letterSpacing: "0.12em" }}>LIVE</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>👁️ {viewers.toLocaleString()}</span>
          {ghosts.length > 0 && (
            <div style={{ display: "flex", gap: -4 }}>
              {ghosts.slice(0, 3).map((g) => (
                <span key={g.name} style={{ width: 18, height: 18, borderRadius: "50%", background: g.color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "#000", border: "1.5px solid #050510", marginLeft: -4 }}>
                  {g.name[0]}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reaction float layer */}
      <div style={{ position: "absolute", top: 44, left: 0, right: 0, height: 80, pointerEvents: "none", overflow: "hidden" }}>
        {reactions.map((r) => (
          <div key={r.id} style={{ position: "absolute", left: `${r.x}%`, bottom: 0, fontSize: 20, animation: "ghost-float 2.2s ease-out forwards" }}>
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Chat stream */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6, minHeight: compact ? 160 : 220, maxHeight: compact ? 240 : 340 }}>
        {chat.length === 0 ? (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: 20 }}>Waiting for activity…</div>
        ) : (
          chat.map((line) => {
            const ghost = ghosts.find((g) => g.name === line.name);
            const color = ghost?.color ?? "#00FFFF";
            return (
              <div key={line.id} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                <span style={{ fontSize: 9, fontWeight: 900, color, minWidth: 36, paddingTop: 2, letterSpacing: "0.04em", flexShrink: 0 }}>{line.name}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.35 }}>{line.text}</span>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Active ghost users */}
      {ghosts.length > 0 && (
        <div style={{ padding: "8px 12px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ghosts.map((g) => (
            <div key={g.name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: g.color, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: g.color, fontWeight: 700 }}>{g.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Quick reactions bar */}
      <div style={{ padding: "8px 12px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 8, justifyContent: "center" }}>
        {REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => burstReaction(emoji)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: "2px 4px", borderRadius: 6, transition: "transform 0.1s", lineHeight: 1 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.3)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* CSS keyframes injected inline */}
      <style>{`
        @keyframes ghost-float {
          0%   { transform: translateY(0)   scale(1);   opacity: 1; }
          60%  { transform: translateY(-55px) scale(1.2); opacity: 0.9; }
          100% { transform: translateY(-90px) scale(0.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
