"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { WarpEntryLog } from "@/lib/live/WarpEntryLog";

export interface SeatProfile {
  id: string;
  name: string;
  role: string;
  energy?: "HIGH" | "MID" | "LOW" | string;
  energyScore?: number;
  isBot?: boolean;
  isNew?: boolean;
}

interface Props {
  profile: SeatProfile | null;
  onClose: () => void;
  autoDismissMs?: number;
}

const ENERGY_META: Record<string, { color: string; label: string }> = {
  HIGH: { color: "#FF2DAA", label: "⚡ HIGH ENERGY" },
  MID:  { color: "#FFD700", label: "🔥 ACTIVE"      },
  LOW:  { color: "#00FFFF", label: "🎧 LISTENING"   },
};

const ROLE_ICON: Record<string, string> = {
  fan: "🎧", artist: "🎤", performer: "🎙", sponsor: "💼",
  advertiser: "📢", venue: "🏛", writer: "✍️", promoter: "📣",
  admin: "👑", staff: "🛡", vip: "🥂", "ghost listener": "👤",
};

const REACTIONS = ["🔥", "❤️", "⚡", "👑", "🎉"];

// Module-level follow set — persists within the session
const followed = new Set<string>();

export default function SeatProfileOverlay({ profile, onClose, autoDismissMs = 5000 }: Props) {
  const [isFollowed, setIsFollowed] = useState(false);
  const [reactIdx, setReactIdx] = useState(0);
  const [reacted, setReacted] = useState(false);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!profile) return;
    WarpEntryLog.markInteraction();
    setIsFollowed(followed.has(profile.id));
    setReacted(false);
    setReactIdx(0);

    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(onClose, autoDismissMs);
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [profile, onClose, autoDismissMs]);

  const handleFollow = () => {
    if (!profile) return;
    if (isFollowed) {
      followed.delete(profile.id);
      setIsFollowed(false);
    } else {
      followed.add(profile.id);
      setIsFollowed(true);
    }
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(onClose, autoDismissMs);
  };

  const handleReact = () => {
    setReacted(true);
    setReactIdx((i) => (i + 1) % REACTIONS.length);
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(onClose, autoDismissMs);
  };

  const energyKey = (profile?.energy ?? "LOW").toUpperCase();
  const energyMeta = ENERGY_META[energyKey] ?? ENERGY_META.LOW!;
  const roleKey = (profile?.role ?? "fan").toLowerCase();
  const icon = ROLE_ICON[roleKey] ?? "🎧";
  const profileSlug = profile?.name.toLowerCase().replace(/\s+/g, "-") ?? "";

  return (
    <AnimatePresence>
      {profile && (
        <motion.div
          key={`spo-${profile.id}`}
          initial={{ opacity: 0, y: 20, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.94 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          style={{
            position: "fixed",
            bottom: 168,
            left: 20,
            zIndex: 200,
            width: 226,
            background: "rgba(5,5,16,0.96)",
            border: "1px solid rgba(0,255,255,0.25)",
            borderRadius: 16,
            padding: "14px 16px 12px",
            backdropFilter: "blur(16px)",
            boxShadow: `0 0 32px rgba(0,255,255,0.12), 0 8px 32px rgba(0,0,0,0.7)`,
            pointerEvents: "auto",
          }}
          role="dialog"
          aria-label={`Profile: ${profile.name}`}
        >
          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close profile"
            style={{
              position: "absolute", top: 8, right: 10,
              background: "none", border: "none",
              color: "rgba(255,255,255,0.3)", fontSize: 14, cursor: "pointer",
              lineHeight: 1, padding: 2,
            }}
          >
            ✕
          </button>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              border: `2px solid ${energyMeta.color}`,
              background: "rgba(0,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, flexShrink: 0,
              boxShadow: `0 0 10px ${energyMeta.color}40`,
            }}>
              {icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 900, color: "#fff",
                letterSpacing: "0.06em", textTransform: "uppercase",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {profile.isNew && <span style={{ color: "#00FF88", marginRight: 4 }}>★</span>}
                {profile.name}
              </div>
              <div style={{
                fontSize: 9, fontWeight: 700, color: "rgba(0,255,255,0.7)",
                letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 1,
              }}>
                {profile.role}
              </div>
            </div>
          </div>

          {/* Energy bar */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 8, fontWeight: 900, color: energyMeta.color, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                {energyMeta.label}
              </span>
              {profile.energyScore !== undefined && (
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>
                  {profile.energyScore}
                </span>
              )}
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
              <div style={{
                height: "100%", borderRadius: 2,
                width: `${profile.energyScore ?? (energyKey === "HIGH" ? 85 : energyKey === "MID" ? 55 : 25)}%`,
                background: `linear-gradient(90deg, ${energyMeta.color}, rgba(0,255,255,0.6))`,
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={handleFollow}
              style={{
                flex: 1,
                padding: "7px 0",
                borderRadius: 8,
                border: isFollowed ? "1px solid #00FF88" : "1px solid rgba(0,255,255,0.35)",
                background: isFollowed ? "rgba(0,255,136,0.15)" : "rgba(0,255,255,0.07)",
                color: isFollowed ? "#00FF88" : "#00FFFF",
                fontSize: 10, fontWeight: 900, cursor: "pointer",
                letterSpacing: "0.1em", textTransform: "uppercase",
                transition: "all 0.2s ease",
              }}
            >
              {isFollowed ? "✓ FOLLOWING" : "+ FOLLOW"}
            </button>
            <button
              onClick={handleReact}
              style={{
                width: 36, height: 34,
                borderRadius: 8,
                border: "1px solid rgba(255,45,170,0.35)",
                background: reacted ? "rgba(255,45,170,0.18)" : "rgba(255,45,170,0.07)",
                fontSize: 14, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.2s ease",
              }}
              aria-label="React"
            >
              {REACTIONS[reactIdx]}
            </button>
          </div>

          {/* View profile link */}
          {!profile.isBot && (
            <Link
              href={`/profile/${profileSlug}`}
              style={{
                display: "block", marginTop: 8, textAlign: "center",
                fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.14em", textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              VIEW FULL PROFILE →
            </Link>
          )}

          {/* Ghost label */}
          {profile.isBot && (
            <div style={{ marginTop: 8, textAlign: "center", fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em" }}>
              GHOST PRESENCE · TMI SIMULATED
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
