"use client";

/**
 * VenueLobbyWall — expandable audience lobby with chevron sizing control.
 * Shows AudienceScene at SM / MD / LG / FULL sizes.
 * Fans can enlarge to see avatars bigger. Has reaction buttons + venue switcher.
 * Includes tier-aware ad slot and live watcher count from presenceEngine.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AudienceScene, { VENUES, type VenueIndex } from "@/components/live/AudienceScene";
import TieredAdSlot from "@/components/ads/TieredAdSlot";
import { usePresenceEngine } from "@/lib/live/presenceEngine";

type LobbySize = "sm" | "md" | "lg" | "full";
type UserTier  = "free" | "pro-RUBY" | "gold-platinum" | "diamond";

interface VenueLobbyWallProps {
  roomId?: string;
  accentColor?: string;
  userTier?: UserTier;
  defaultSize?: LobbySize;
  view?: "fan" | "performer";
}

const SIZE_LABELS: Record<LobbySize, string> = {
  sm:   "▸ Expand",
  md:   "◆ Medium",
  lg:   "◇ Large",
  full: "⬛ Full",
};

const SIZE_HEIGHTS: Record<LobbySize, number | string> = {
  sm:   160,
  md:   280,
  lg:   400,
  full: "calc(100vh - 120px)",
};

const REACTION_EMOJIS = ["💎","🔥","❤️","🙌","⚡","🎶","💰","👑"];

export default function VenueLobbyWall({
  roomId = "fan-theater",
  accentColor = "#00FFFF",
  userTier = "free",
  defaultSize = "sm",
  view = "fan",
}: VenueLobbyWallProps) {
  const [size, setSize]     = useState<LobbySize>(defaultSize);
  const [venueIdx, setVenueIdx] = useState<VenueIndex>(0);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; x: number }[]>([]);
  const [lastReaction, setLastReaction] = useState<string | null>(null);
  const presence = usePresenceEngine(roomId);

  const cycleSize = () => {
    const order: LobbySize[] = ["sm", "md", "lg", "full"];
    setSize(prev => order[(order.indexOf(prev) + 1) % order.length]!);
  };

  const collapseSize = () => {
    const order: LobbySize[] = ["sm", "md", "lg", "full"];
    const cur = order.indexOf(size);
    if (cur > 0) setSize(order[cur - 1]!);
  };

  const fireReaction = (emoji: string) => {
    setLastReaction(emoji);
    const id = Date.now();
    setFloatingEmojis(prev => [...prev, { id, emoji, x: Math.random() * 80 + 10 }]);
    setTimeout(() => setFloatingEmojis(prev => prev.filter(e => e.id !== id)), 1600);
    setTimeout(() => setLastReaction(null), 1000);
  };

  const isExpanded = size !== "sm";

  return (
    <div style={{
      background: "rgba(2,2,12,0.95)",
      border: `1px solid ${accentColor}28`,
      borderRadius: 14,
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Header bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px",
        borderBottom: `1px solid ${accentColor}20`,
        background: "rgba(0,0,0,0.4)",
      }}>
        {/* Live dot + count */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}
            style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
          <span style={{ fontSize: 9, fontWeight: 900, color: "#22c55e", letterSpacing: "0.12em" }}>LIVE LOBBY</span>
        </div>

        <span style={{ fontSize: 9, color: `${accentColor}88`, marginLeft: 4 }}>
          {presence.watching.toLocaleString()} watching
        </span>

        {/* Venue tabs */}
        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {VENUES.map((v, i) => (
            <button key={v.name} onClick={() => setVenueIdx(i as VenueIndex)} style={{
              padding: "3px 8px", borderRadius: 5, fontSize: 9, fontWeight: 700, cursor: "pointer",
              background: venueIdx === i ? `${accentColor}22` : "rgba(255,255,255,0.04)",
              border: `1px solid ${venueIdx === i ? accentColor + "55" : "rgba(255,255,255,0.08)"}`,
              color: venueIdx === i ? accentColor : "rgba(255,255,255,0.35)",
            }}>{v.name}</button>
          ))}
        </div>

        {/* Size controls */}
        <div style={{ display: "flex", gap: 3 }}>
          <button onClick={collapseSize} disabled={size === "sm"} style={{
            background: "none", border: `1px solid rgba(255,255,255,0.12)`,
            borderRadius: 4, color: size === "sm" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.45)",
            fontSize: 12, cursor: size === "sm" ? "default" : "pointer", padding: "2px 6px",
          }}>‹</button>
          <button onClick={cycleSize} style={{
            padding: "3px 10px", borderRadius: 5, fontSize: 9, fontWeight: 800,
            background: `${accentColor}18`, border: `1px solid ${accentColor}44`,
            color: accentColor, cursor: "pointer",
          }}>{SIZE_LABELS[size]}</button>
          {size !== "full" && (
            <button onClick={() => setSize("full")} style={{
              background: "none", border: `1px solid rgba(255,255,255,0.12)`,
              borderRadius: 4, color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer", padding: "2px 6px",
            }}>⛶</button>
          )}
        </div>
      </div>

      {/* AudienceScene — animated height */}
      <motion.div
        animate={{ height: SIZE_HEIGHTS[size] }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        style={{ overflow: "hidden", position: "relative" }}
      >
        <AudienceScene
          view={view}
          venue={venueIdx}
          watcherCount={presence.watching}
          hideControls={size === "sm"}
        />

        {/* Floating emoji reactions */}
        <AnimatePresence>
          {floatingEmojis.map(e => (
            <motion.div key={e.id}
              initial={{ y: 0, opacity: 1, scale: 1 }}
              animate={{ y: -80, opacity: 0, scale: 1.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{
                position: "absolute", bottom: 40,
                left: `${e.x}%`,
                fontSize: 22, pointerEvents: "none", zIndex: 20,
              }}
            >{e.emoji}</motion.div>
          ))}
        </AnimatePresence>

        {/* Small-size overlay: show expand prompt */}
        {size === "sm" && (
          <div
            onClick={cycleSize}
            style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "flex-end",
              paddingBottom: 12,
              background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)",
              cursor: "pointer", zIndex: 10,
            }}
          >
            <div style={{
              background: `${accentColor}22`, border: `1px solid ${accentColor}55`,
              borderRadius: 20, padding: "4px 14px", display: "flex", alignItems: "center", gap: 5,
            }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: accentColor, letterSpacing: "0.1em" }}>TAP TO EXPAND LOBBY</span>
              <span style={{ fontSize: 12, color: accentColor }}>▾</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Reaction dock — only shown when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            style={{
              padding: "8px 14px",
              borderTop: `1px solid ${accentColor}18`,
              display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
              background: "rgba(0,0,0,0.3)",
            }}
          >
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>REACT</span>
            {REACTION_EMOJIS.map(e => (
              <motion.button key={e} whileTap={{ scale: 1.5 }} onClick={() => fireReaction(e)} style={{
                fontSize: 18, background: lastReaction === e ? `${accentColor}22` : "none",
                border: `1px solid ${lastReaction === e ? accentColor + "44" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 8, cursor: "pointer", padding: "2px 6px", transition: "all 0.1s",
              }}>{e}</motion.button>
            ))}
            {/* Recently joined */}
            {presence.joinedRecently.length > 0 && (
              <div style={{ marginLeft: "auto", display: "flex", gap: 4, alignItems: "center" }}>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>joined:</span>
                {presence.joinedRecently.slice(0, 3).map(n => (
                  <span key={n} style={{ fontSize: 9, background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 6, color: "rgba(255,255,255,0.4)" }}>{n}</span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ad slot — free users only, only show when expanded */}
      {isExpanded && userTier === "free" && (
        <div style={{ padding: "4px 14px 10px" }}>
          <TieredAdSlot tier="free" placement="in-content" height={50} />
        </div>
      )}
    </div>
  );
}
