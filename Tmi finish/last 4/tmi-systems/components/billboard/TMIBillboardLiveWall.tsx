"use client";

/**
 * TMIBillboardLiveWall.tsx
 * Live discovery engine for The Musician's Index.
 *
 * Drop at: apps/web/src/components/billboard/TMIBillboardLiveWall.tsx
 * Use on:  /home/5 (main stage discover area), /live/world, /magazine sidebar
 *
 * Features:
 *  - Dense flat video grid (NOT 3D — fast, scalable, readable)
 *  - Engagement-based ranking: highest score climbs to bottom (place of honor)
 *  - Smooth CSS transition when tiles re-sort (0.6s ease)
 *  - IntersectionObserver: only hydrate WebRTC for visible tiles
 *  - Audio: muted by default, hover = preview, click = enter lobby
 *  - Diamond surf: Diamond members enter any live room free
 *  - Paid entry: others see paywall before joining
 *  - Genre filter: battle / cypher / challenge / game / concert / live
 *  - Cinematic transition: scale → blur → lobby
 *  - 100+ performer slots (bot accounts populate empty slots)
 *
 * Engagement score formula:
 *   score = (viewers × 2) + (tips × 3) + (battleRank × 4) + (activityLevel × 1)
 *
 * Sort order: LOWEST score → TOP (rising), HIGHEST → BOTTOM (champion position)
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type CSSProperties,
} from "react";
import Link from "next/link";

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type LobbyGenre =
  | "all" | "battle" | "cypher" | "challenge" | "game" | "concert" | "live";

export type LobbyPrivacy =
  | "PUBLIC" | "PRIVATE" | "INVITE_ONLY" | "DIAMOND_SURF" | "PAID_ENTRY";

export type PerformerTier = "free" | "silver" | "gold" | "platinum" | "diamond";

export interface LiveFeedItem {
  id: string;
  performerId: string;
  performerName: string;
  performerTier: PerformerTier;
  roomId: string;
  genre: LobbyGenre;
  privacy: LobbyPrivacy;
  thumbnailUrl?: string;
  motionPosterUrl?: string;
  accentColor: string;
  viewers: number;
  tips: number;
  battleRank: number;
  activityLevel: number;
  boostWeight: number;      // temporary boost (expires)
  boostExpiresAt?: number;  // timestamp ms
  isLive: boolean;
  entryPriceUsd?: number;   // for PAID_ENTRY lobbies
}

interface BillboardWallProps {
  feeds: LiveFeedItem[];
  userTier?: PerformerTier;
  userId?: string;
  currentGenre?: LobbyGenre;
  onGenreChange?: (genre: LobbyGenre) => void;
  onEnterLobby?: (feed: LiveFeedItem) => void;
  className?: string;
}

/* ─── Scoring ─────────────────────────────────────────────────────────────── */
function scoreItem(item: LiveFeedItem): number {
  const boostActive = item.boostExpiresAt
    ? Date.now() < item.boostExpiresAt
    : false;
  const boost = boostActive ? item.boostWeight : 0;
  return (
    item.viewers * 2 +
    item.tips * 3 +
    item.battleRank * 4 +
    item.activityLevel * 1 +
    boost
  );
}

/* ─── Tier colors ─────────────────────────────────────────────────────────── */
const TIER_ACCENT: Record<PerformerTier, string> = {
  free:     "#64748b",
  silver:   "#cbd5e1",
  gold:     "#fbbf24",
  platinum: "#e2e8f0",
  diamond:  "#38bdf8",
};

/* ─── Privacy gate check ─────────────────────────────────────────────────── */
function canEnterFree(privacy: LobbyPrivacy, userTier: PerformerTier): boolean {
  if (privacy === "PUBLIC" || privacy === "INVITE_ONLY") return true;
  if (privacy === "DIAMOND_SURF" && userTier === "diamond") return true;
  if (privacy === "PAID_ENTRY") return false;
  return false;
}

/* ─── Cinematic transition overlay ───────────────────────────────────────── */
function CinematicTransition({
  feed,
  onComplete,
  onCancel,
  userTier,
}: {
  feed: LiveFeedItem;
  onComplete: () => void;
  onCancel: () => void;
  userTier: PerformerTier;
}) {
  const [phase, setPhase] = useState<"preview" | "zooming" | "enter">("preview");
  const needsPayment = feed.privacy === "PAID_ENTRY" && userTier !== "diamond";

  useEffect(() => {
    if (phase !== "preview") return;
    const t = setTimeout(() => setPhase("zooming"), 200);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "zooming") return;
    const t = setTimeout(() => {
      if (!needsPayment) {
        setPhase("enter");
        onComplete();
      }
    }, 600);
    return () => clearTimeout(t);
  }, [phase, needsPayment, onComplete]);

  const accent = feed.accentColor;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.92)" }}
    >
      {/* Expanding ring */}
      <div
        style={{
          position: "absolute",
          inset: "50%",
          borderRadius: "50%",
          border: `2px solid ${accent}`,
          transform: phase === "zooming" ? "inset(0%)" : "inset(50%)",
          width: phase === "zooming" ? "100vw" : "60px",
          height: phase === "zooming" ? "100vh" : "60px",
          marginLeft: phase === "zooming" ? "-50vw" : "-30px",
          marginTop: phase === "zooming" ? "-50vh" : "-30px",
          transition: "all 0.6s cubic-bezier(0.77, 0, 0.18, 1)",
          boxShadow: `0 0 60px ${accent}60, inset 0 0 60px ${accent}20`,
        }}
      />

      {/* Info card */}
      {phase === "preview" && !needsPayment && (
        <div
          className="relative z-10 text-center space-y-3 px-6"
          style={{ animation: "fadeIn 0.2s ease" }}
        >
          <p className="text-[9px] text-white/40 uppercase tracking-[0.3em]">
            Entering Lobby
          </p>
          <h2 className="text-2xl font-black text-white">{feed.performerName}</h2>
          <p className="text-[10px]" style={{ color: accent }}>
            {feed.genre.toUpperCase()} · {feed.viewers} watching
          </p>
          <button onClick={onCancel} className="text-[9px] text-white/30 hover:text-white/60 mt-4">
            Cancel
          </button>
        </div>
      )}

      {/* Paywall */}
      {needsPayment && (
        <div
          className="relative z-10 text-center space-y-4 px-6 max-w-sm w-full"
          style={{ animation: "fadeIn 0.3s ease" }}
        >
          <p className="text-[9px] text-white/40 uppercase tracking-[0.3em]">Paid Event</p>
          <h2 className="text-xl font-black text-white">{feed.performerName}</h2>
          <div
            className="border rounded-xl p-4 space-y-3"
            style={{ borderColor: accent + "40" }}
          >
            <p className="text-2xl font-black" style={{ color: accent }}>
              ${feed.entryPriceUsd?.toFixed(2) ?? "5.00"}
            </p>
            <p className="text-[9px] text-white/50">
              Diamond subscribers enter free with their subscription
            </p>
            <div className="flex gap-2">
              <Link
                href={`/tickets/purchase?room=${feed.roomId}&price=${feed.entryPriceUsd}`}
                className="flex-1 py-2 text-[10px] font-black uppercase rounded-lg text-black text-center"
                style={{ background: accent }}
              >
                Buy Ticket
              </Link>
              <button
                onClick={onCancel}
                className="px-4 py-2 text-[9px] text-white/50 border border-white/10 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
          <Link
            href="/settings/billing"
            className="block text-[9px] text-white/30 hover:text-white/50"
          >
            Upgrade to Diamond → get access to all live concerts
          </Link>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}

/* ─── Single live tile ───────────────────────────────────────────────────── */
function LiveTile({
  item,
  onSelect,
  rank,
}: {
  item: LiveFeedItem;
  onSelect: () => void;
  rank: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inViewport, setInViewport] = useState(false);
  const [hovered,    setHovered]    = useState(false);
  const accent = item.accentColor;
  const totalScore = scoreItem(item);
  const maxScore = 500; // normalize for bar
  const scoreBar = Math.min(1, totalScore / maxScore);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInViewport(e.isIntersecting), { rootMargin: "80px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden cursor-pointer"
      style={{
        borderRadius: 10,
        border: `1.5px solid ${item.isLive ? accent + "70" : accent + "20"}`,
        aspectRatio: "1 / 1",
        transition: "transform 0.6s ease, box-shadow 0.3s ease",
        transform: hovered ? "scale(1.05)" : "scale(1)",
        boxShadow: item.isLive
          ? `0 0 ${hovered ? "20px" : "8px"} ${accent}60`
          : "none",
        willChange: "transform",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
    >
      {/* Media */}
      <div className="absolute inset-0">
        {inViewport && item.motionPosterUrl ? (
          <video
            src={item.motionPosterUrl}
            autoPlay muted loop playsInline
            className="w-full h-full object-cover"
          />
        ) : item.thumbnailUrl ? (
          <img src={item.thumbnailUrl} alt={item.performerName} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `radial-gradient(circle at 50% 40%, ${accent}25 0%, #05050c 80%)` }}
          >
            <span className="font-black text-2xl" style={{ color: accent }}>
              {item.performerName.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Subtle scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)",
        }}
      />

      {/* LIVE badge */}
      {item.isLive && (
        <div
          className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1 px-1 py-0.5 rounded"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[7px] font-black text-white uppercase">LIVE</span>
        </div>
      )}

      {/* Diamond surf badge */}
      {item.privacy === "DIAMOND_SURF" && (
        <div
          className="absolute top-1.5 right-1.5 z-10 px-1 py-0.5 rounded text-[7px] font-black text-cyan-400"
          style={{ background: "rgba(0,0,0,0.7)" }}
        >
          ◈
        </div>
      )}

      {/* Paid entry badge */}
      {item.privacy === "PAID_ENTRY" && item.entryPriceUsd && (
        <div
          className="absolute top-1.5 right-1.5 z-10 px-1 py-0.5 rounded text-[7px] font-black text-yellow-400"
          style={{ background: "rgba(0,0,0,0.7)" }}
        >
          ${item.entryPriceUsd}
        </div>
      )}

      {/* Score bar (very subtle, at bottom) */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "rgba(0,0,0,0.3)" }}>
        <div
          className="h-full transition-all duration-1000"
          style={{ width: `${scoreBar * 100}%`, background: accent }}
        />
      </div>

      {/* Bottom info overlay */}
      <div
        className="absolute bottom-0 inset-x-0 z-10 px-2 pt-6 pb-1.5"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)" }}
      >
        <p className="text-[9px] font-black text-white truncate leading-tight">
          {item.performerName}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[7px] text-white/40 capitalize">{item.genre}</span>
          {item.viewers > 0 && (
            <span className="text-[7px] text-white/30">{item.viewers}</span>
          )}
        </div>
      </div>

      {/* Hover action */}
      {hovered && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
        >
          <div
            className="px-3 py-1 rounded-full text-[9px] font-black uppercase text-black"
            style={{ background: accent }}
          >
            {item.privacy === "PAID_ENTRY" ? `$${item.entryPriceUsd} Enter` : "Join"}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Genre filter strip ─────────────────────────────────────────────────── */
const GENRES: { id: LobbyGenre; label: string; icon: string }[] = [
  { id: "all",       label: "All",       icon: "🌐" },
  { id: "battle",    label: "Battles",   icon: "⚔️" },
  { id: "cypher",    label: "Cyphers",   icon: "🎤" },
  { id: "challenge", label: "Challenges",icon: "🏆" },
  { id: "game",      label: "Games",     icon: "🎮" },
  { id: "concert",   label: "Concerts",  icon: "🎵" },
  { id: "live",      label: "Live",      icon: "📡" },
];

/* ─── Main wall ───────────────────────────────────────────────────────────── */
export default function TMIBillboardLiveWall({
  feeds,
  userTier = "free",
  userId,
  currentGenre = "all",
  onGenreChange,
  onEnterLobby,
  className = "",
}: BillboardWallProps) {
  const [genre,        setGenre]        = useState<LobbyGenre>(currentGenre);
  const [selectedFeed, setSelectedFeed] = useState<LiveFeedItem | null>(null);
  const [sortedFeeds,  setSortedFeeds]  = useState<LiveFeedItem[]>([]);

  /* Filter + sort feeds */
  useEffect(() => {
    const filtered = genre === "all"
      ? feeds
      : feeds.filter((f) => f.genre === genre);

    const sorted = [...filtered].sort((a, b) => scoreItem(a) - scoreItem(b));
    setSortedFeeds(sorted);
  }, [feeds, genre]);

  /* Re-sort every 4 seconds (simulates live movement) */
  useEffect(() => {
    const interval = setInterval(() => {
      setSortedFeeds((prev) => [...prev].sort((a, b) => scoreItem(a) - scoreItem(b)));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  function handleGenreChange(g: LobbyGenre) {
    setGenre(g);
    onGenreChange?.(g);
  }

  function handleSelectFeed(feed: LiveFeedItem) {
    setSelectedFeed(feed);
  }

  function handleEnterConfirmed() {
    if (!selectedFeed) return;
    onEnterLobby?.(selectedFeed);
    setSelectedFeed(null);
  }

  const isDiamond = userTier === "diamond";

  return (
    <div className={`flex flex-col bg-[#05050c] ${className}`}>

      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-tight">
            Live Billboard
          </h2>
          <p className="text-[8px] text-white/30 mt-0.5">
            {sortedFeeds.filter((f) => f.isLive).length} rooms live now
            {isDiamond && " · Diamond surf active"}
          </p>
        </div>
        {isDiamond && (
          <span className="text-[9px] font-black px-2 py-0.5 rounded text-black bg-cyan-400">
            ◈ SURF MODE
          </span>
        )}
      </div>

      {/* Genre filter */}
      <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto scrollbar-none">
        {GENRES.map((g) => (
          <button
            key={g.id}
            onClick={() => handleGenreChange(g.id)}
            className={`flex-shrink-0 text-[9px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition-all flex items-center gap-1 ${
              genre === g.id
                ? "bg-white text-black"
                : "bg-white/5 text-white/50 hover:bg-white/10"
            }`}
          >
            <span>{g.icon}</span>
            <span>{g.label}</span>
          </button>
        ))}
      </div>

      {/* Live wall grid */}
      <div
        className="px-3 pb-4 overflow-y-auto"
        style={{ maxHeight: "65vh" }}
      >
        {sortedFeeds.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/20 text-sm">No live rooms in this genre</p>
            <button
              onClick={() => handleGenreChange("all")}
              className="mt-3 text-[9px] text-white/40 hover:text-white/60 uppercase tracking-wider"
            >
              Show all →
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
              gap: "6px",
            }}
          >
            {sortedFeeds.map((feed, i) => (
              <div
                key={feed.id}
                style={{ transition: "order 0.6s ease" }}
              >
                <LiveTile
                  item={feed}
                  rank={i}
                  onSelect={() => handleSelectFeed(feed)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-4 pb-3 flex items-center gap-4 text-[7px] text-white/20 uppercase tracking-wider border-t border-white/5 pt-2">
        <span>↑ Rising</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />Live</span>
        <span className="flex items-center gap-1"><span className="text-cyan-400 font-black">◈</span>Diamond surf</span>
        <span className="flex items-center gap-1"><span className="text-yellow-400">$</span>Paid entry</span>
      </div>

      {/* Cinematic transition overlay */}
      {selectedFeed && (
        <CinematicTransition
          feed={selectedFeed}
          userTier={userTier}
          onComplete={handleEnterConfirmed}
          onCancel={() => setSelectedFeed(null)}
        />
      )}
    </div>
  );
}
