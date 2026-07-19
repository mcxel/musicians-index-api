"use client";

/**
 * AnimatedLobbyWallDrawer
 *
 * Slide-out panel that lets users browse and join every lobby and lounge
 * without ever leaving the current home page.
 *
 * Motion model:
 *  • Desktop  — slides in from the RIGHT  (x: "100%" → 0)
 *  • Mobile   — slides up from the BOTTOM (y: "100%" → 0)
 *  • Cards    — stagger-animate in from below on open
 *  • Backdrop — fades in
 *  • Drag     — panel can be dragged to dismiss on mobile (dragY > 80px = close)
 *
 * Scrolling:
 *  • Genre filter tabs scroll horizontally
 *  • Room cards scroll vertically inside the panel
 */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import Link from "next/link";

// ─── Room / Lounge catalogue ─────────────────────────────────────────────────

type RoomType =
  | "concert" | "battle" | "cypher" | "challenge"
  | "dance" | "comedy" | "lounge" | "radio" | "game";

interface LobbyRoom {
  id: string;
  title: string;
  subtitle: string;
  type: RoomType;
  accent: string;
  glyph: string;
  href: string;
  viewers: number;
  isLive: boolean;
}

const ALL_ROOMS: LobbyRoom[] = [
  // ── Lobbies ──────────────────────────────────────────────
  {
    id: "lobby-a",    title: "Lobby A",        subtitle: "R&B · Soul · Concerts",
    type: "concert",  accent: "#FF2DAA",        glyph: "🎤",
    href: "/live/rooms/north-atrium", viewers: 0, isLive: false,
  },
  {
    id: "lobby-b",    title: "Lobby B",        subtitle: "Battles · Cyphers",
    type: "battle",   accent: "#00FFFF",        glyph: "⚔️",
    href: "/live/rooms/midnight-pit",  viewers: 0, isLive: false,
  },
  {
    id: "lobby-c",    title: "Lobby C",        subtitle: "Challenges · Games",
    type: "challenge", accent: "#FFD700",       glyph: "🏆",
    href: "/live/rooms/golden-hall",   viewers: 0, isLive: false,
  },
  // ── Lounges ──────────────────────────────────────────────
  {
    id: "fan-lounge",    title: "Fan Lounge",    subtitle: "Chill · Social · Community",
    type: "lounge",      accent: "#AA2DFF",      glyph: "🛋️",
    href: "/lobbies/fan-lounge",       viewers: 0, isLive: false,
  },
  {
    id: "vip-lounge",    title: "VIP Lounge",   subtitle: "Gold · Platinum · Diamond only",
    type: "lounge",      accent: "#FFD700",      glyph: "💎",
    href: "/lobbies/vip-lounge",       viewers: 0, isLive: false,
  },
  {
    id: "radio-lounge",  title: "Radio Lounge", subtitle: "Stream & Win · Artist Rotation",
    type: "radio",       accent: "#00FF88",      glyph: "📻",
    href: "/radio",                    viewers: 0, isLive: false,
  },
  // ── Stages ───────────────────────────────────────────────
  {
    id: "world-stage",   title: "World Stage",  subtitle: "World Concerts · Premieres",
    type: "concert",     accent: "#FF2DAA",      glyph: "🌍",
    href: "/live/rooms/world-stage",   viewers: 0, isLive: false,
  },
  {
    id: "dance-party",   title: "Dance Party",  subtitle: "DJ Sets · Floor Battles",
    type: "dance",       accent: "#00FFFF",      glyph: "💃",
    href: "/live/rooms/dance-floor",   viewers: 0, isLive: false,
  },
  {
    id: "comedy-room",   title: "Comedy Room",  subtitle: "Stand-up · Improv · Battles",
    type: "comedy",      accent: "#FF6B35",      glyph: "🎭",
    href: "/live/rooms/comedy-room",   viewers: 0, isLive: false,
  },
  {
    id: "open-cypher",   title: "Open Cypher",  subtitle: "Freestyle · Hip-Hop · Bars",
    type: "cypher",      accent: "#AA2DFF",      glyph: "🎙️",
    href: "/live/rooms/open-cypher",   viewers: 0, isLive: false,
  },
  {
    id: "game-show",     title: "Game Show",    subtitle: "Deal or Feud · Circle & Squares",
    type: "game",        accent: "#FFD700",      glyph: "🎰",
    href: "/live/rooms/game-show",     viewers: 0, isLive: false,
  },
  {
    id: "slow-jam",      title: "Slow Jam Room", subtitle: "R&B · Neo-Soul · Meet & Greet",
    type: "radio",       accent: "#FF2DAA",      glyph: "🌙",
    href: "/live/rooms/slow-jam",      viewers: 0, isLive: false,
  },
];

const FILTER_TABS: { label: string; type: RoomType | "all" }[] = [
  { label: "All",       type: "all" },
  { label: "Concerts",  type: "concert" },
  { label: "Battles",   type: "battle" },
  { label: "Cyphers",   type: "cypher" },
  { label: "Lounges",   type: "lounge" },
  { label: "Dance",     type: "dance" },
  { label: "Comedy",    type: "comedy" },
  { label: "Radio",     type: "radio" },
  { label: "Games",     type: "game" },
];

// ─── Single room card ────────────────────────────────────────────────────────

function RoomCard({
  room,
  index,
  onJoin,
}: {
  room: LobbyRoom;
  index: number;
  onJoin: (room: LobbyRoom) => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.055, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.025, y: -2 }}
      whileTap={{ scale: 0.97 }}
      style={{
        borderRadius: 12,
        border: `1px solid ${room.accent}44`,
        background: `linear-gradient(145deg, ${room.accent}12 0%, rgba(8,6,24,0.92) 100%)`,
        padding: "12px 14px",
        cursor: "pointer",
        display: "grid",
        gridTemplateColumns: "38px 1fr auto",
        alignItems: "center",
        gap: 10,
        boxShadow: `0 2px 12px ${room.accent}18`,
        position: "relative",
        overflow: "hidden",
      }}
      onClick={() => onJoin(room)}
    >
      {/* Glow edge */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${room.accent}88, transparent)`,
      }} />

      {/* Glyph */}
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: `${room.accent}1a`,
        border: `1px solid ${room.accent}44`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, flexShrink: 0,
      }}>
        {room.glyph}
      </div>

      {/* Info */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {room.title}
        </div>
        <div style={{ fontSize: 10, color: room.accent, marginTop: 2, fontWeight: 700, letterSpacing: "0.04em" }}>
          {room.subtitle}
        </div>
      </div>

      {/* Live badge / join */}
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
        {room.isLive ? (
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.14em", color: room.accent }}
          >
            ● LIVE
          </motion.div>
        ) : (
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" }}>
            OPEN
          </div>
        )}
        <div style={{
          fontSize: 9, fontWeight: 800, color: "#000",
          background: room.accent,
          borderRadius: 6, padding: "2px 8px",
          letterSpacing: "0.06em",
        }}>
          JOIN
        </div>
      </div>
    </motion.article>
  );
}

// ─── Drawer ──────────────────────────────────────────────────────────────────

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnimatedLobbyWallDrawer({ isOpen, onClose }: DrawerProps) {
  const [activeFilter, setActiveFilter] = useState<RoomType | "all">("all");
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount/resize
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Mobile drag-to-dismiss
  const dragY = useMotionValue(0);
  const drawerOpacity = useTransform(dragY, [0, 200], [1, 0.3]);

  function handleDragEnd(_: unknown, info: { offset: { y: number } }) {
    if (info.offset.y > 80) onClose();
    else dragY.set(0);
  }

  const filteredRooms =
    activeFilter === "all"
      ? ALL_ROOMS
      : ALL_ROOMS.filter((r) => r.type === activeFilter);

  function handleJoin(room: LobbyRoom) {
    onClose();
    // Give the close animation time to start before navigating
    setTimeout(() => {
      window.location.href = room.href;
    }, 200);
  }

  // Slide-in variants: desktop = from right, mobile = from bottom
  const drawerVariants = {
    hidden:  isMobile ? { y: "100%", opacity: 0.6 } : { x: "100%", opacity: 0.6 },
    visible: isMobile ? { y: 0,      opacity: 1    } : { x: 0,      opacity: 1    },
    exit:    isMobile ? { y: "100%", opacity: 0    } : { x: "100%", opacity: 0    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 120,
              background: "rgba(0,0,0,0.68)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", stiffness: 340, damping: 34, mass: 0.9 }}
            drag={isMobile ? "y" : false}
            dragConstraints={{ top: 0 }}
            dragElastic={0.18}
            style={{
              position: "fixed",
              zIndex: 121,
              background: "linear-gradient(170deg, #0d0920 0%, #060613 100%)",
              border: "1px solid rgba(170,45,255,0.22)",
              boxShadow: "0 0 60px rgba(0,0,0,0.85), 0 0 0 1px rgba(170,45,255,0.12)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              // Desktop: right drawer
              ...(isMobile ? {
                left: 0, right: 0, bottom: 0,
                height: "82vh",
                borderRadius: "20px 20px 0 0",
                opacity: drawerOpacity as unknown as number,
              } : {
                top: 0, right: 0, bottom: 0,
                width: "min(420px, 100vw)",
                borderRadius: "16px 0 0 16px",
              }),
            }}
            onDragEnd={handleDragEnd}
          >
            {/* Mobile drag handle */}
            {isMobile && (
              <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.18)" }} />
              </div>
            )}

            {/* Header */}
            <div style={{
              padding: "14px 18px 10px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexShrink: 0,
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", letterSpacing: "0.04em" }}>
                  Lobbies & Lounges
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                  {filteredRooms.length} rooms available
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close lobby wall"
                style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff", fontSize: 15, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>

            {/* Genre filter tabs — horizontal scroll */}
            <div style={{
              display: "flex", gap: 6, padding: "10px 18px 8px",
              overflowX: "auto", flexShrink: 0,
              scrollbarWidth: "none",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <style>{`.tmi-drawer-tabs::-webkit-scrollbar{display:none}`}</style>
              {FILTER_TABS.map((tab) => {
                const active = activeFilter === tab.type;
                return (
                  <motion.button
                    key={tab.type}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setActiveFilter(tab.type)}
                    style={{
                      padding: "4px 13px", borderRadius: 999, flexShrink: 0,
                      border: active ? "1px solid rgba(170,45,255,0.7)" : "1px solid rgba(255,255,255,0.14)",
                      background: active ? "rgba(170,45,255,0.18)" : "transparent",
                      color: active ? "#c084fc" : "rgba(255,255,255,0.55)",
                      fontSize: 11, fontWeight: 700, cursor: "pointer",
                      transition: "background 160ms, color 160ms",
                    }}
                  >
                    {tab.label}
                  </motion.button>
                );
              })}
            </div>

            {/* Room cards — vertically scrollable */}
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              style={{
                flex: 1, overflowY: "auto",
                padding: "12px 14px 24px",
                display: "flex", flexDirection: "column", gap: 8,
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(170,45,255,0.3) transparent",
              }}
            >
              {filteredRooms.map((room, i) => (
                <RoomCard key={room.id} room={room} index={i} onJoin={handleJoin} />
              ))}
            </motion.div>

            {/* Footer CTA */}
            <div style={{
              padding: "10px 14px",
              borderTop: "1px solid rgba(255,255,255,0.07)",
              flexShrink: 0,
              paddingBottom: "max(10px, env(safe-area-inset-bottom))",
            }}>
              <Link
                href="/lobbies"
                onClick={onClose}
                style={{
                  display: "block", textAlign: "center",
                  padding: "10px", borderRadius: 10,
                  background: "linear-gradient(90deg, rgba(170,45,255,0.18), rgba(0,229,255,0.12))",
                  border: "1px solid rgba(170,45,255,0.4)",
                  color: "#c084fc", fontSize: 12, fontWeight: 800,
                  textDecoration: "none", letterSpacing: "0.06em",
                }}
              >
                VIEW ALL LOBBIES & LOUNGES →
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Trigger button (for embedding anywhere) ─────────────────────────────────

export function LobbyWallTrigger({
  label = "🎤 Browse Rooms",
  style: extraStyle,
}: {
  label?: string;
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <AnimatedLobbyWallDrawer isOpen={open} onClose={() => setOpen(false)} />
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          borderRadius: 999, padding: "6px 16px",
          border: "1px solid rgba(0,229,255,0.4)",
          background: "rgba(0,229,255,0.08)",
          color: "#00e5ff", fontSize: 12, fontWeight: 800,
          cursor: "pointer", letterSpacing: "0.04em",
          ...extraStyle,
        }}
      >
        {label}
      </motion.button>
    </>
  );
}
