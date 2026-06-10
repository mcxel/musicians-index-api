"use client";

/**
 * BillboardContentFeed — P9G Live Media Cards
 * Every card has: Watch · Like · Tip · Share · Save to Memory Wall
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { saveMemoryMoment } from "@/lib/memories/MemoryMomentEngine";
import { useEvolutionToast } from "@/components/avatar/EvolutionToast";

type FeedTab = "live" | "uploads" | "trending" | "battles" | "cyphers" | "ranked";

interface FeedItem {
  id: string;
  title: string;
  artist: string;
  type: string;
  plays: number;
  color: string;
  emoji: string;
  href: string;
  isLive?: boolean;
  badge?: string;
}

function seedFeed(_tab: FeedTab): FeedItem[] {
  return [];
}

const TABS: { key: FeedTab; label: string; emoji: string; color: string }[] = [
  { key: "live",     label: "LIVE NOW",          emoji: "🔴", color: "#FF2020" },
  { key: "ranked",   label: "TOP RANKED",        emoji: "👑", color: "#FFD700" },
  { key: "trending", label: "TRENDING",          emoji: "🔥", color: "#FF2DAA" },
  { key: "battles",  label: "BATTLE WINNERS",    emoji: "⚔️", color: "#FF6B35" },
  { key: "cyphers",  label: "CYPHER HIGHLIGHTS", emoji: "🎤", color: "#00FF88" },
  { key: "uploads",  label: "RECENT UPLOADS",    emoji: "📤", color: "#00FFFF" },
];

interface Props {
  defaultTab?: FeedTab;
  maxItems?: number;
  compact?: boolean;
  accentColor?: string;
  userId?: string;
}

// ── Per-card action row ─────────────────────────────────────────────────────
function MediaCard({ item, compact, userId }: { item: FeedItem; compact: boolean; userId: string }) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(Math.floor(item.plays * 0.12));
  const { showXp, ToastRenderer } = useEvolutionToast();

  const tipUrl = `/api/stripe/checkout?priceId=price_tip&amount=500&productName=Tip+${encodeURIComponent(item.artist)}&mode=payment`;

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked) return;
    setLiked(true);
    setLikes(n => n + 1);
  }, [liked]);

  const handleSave = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (saved) return;
    saveMemoryMoment(userId, `${item.title} — ${item.artist}`, "event", item.id);
    setSaved(true);
    showXp(8, "Saved to Memory Wall", "#00FF88");
  }, [saved, userId, item, showXp]);

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}${item.href}`;
    if (navigator.share) {
      navigator.share({ title: item.title, text: `${item.artist} on TMI`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  }, [item]);

  const handleTip = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    showXp(15, "Tipped Artist", "#FFD700");
    router.push(tipUrl);
  }, [router, tipUrl, showXp]);

  return (
    <div style={{ position: "relative" }}>
      {ToastRenderer}
      <div
        onClick={() => router.push(item.href)}
        style={{
          borderRadius: 10, background: "rgba(255,255,255,0.02)", border: `1px solid ${item.color}18`,
          transition: "border-color 0.15s, background 0.15s", cursor: "pointer",
          padding: compact ? "8px 10px" : "10px 12px",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${item.color}44`; (e.currentTarget as HTMLDivElement).style.background = `${item.color}06`; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${item.color}18`; (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)"; }}
    >
      {/* Top row: emoji + title + badge + plays */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: compact ? 16 : 20, flexShrink: 0 }}>{item.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: compact ? 10 : 12, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{item.artist} · {item.type}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
          {item.badge && (
            <span style={{ fontSize: 7, fontWeight: 900, color: item.color, letterSpacing: "0.08em", padding: "2px 6px", background: `${item.color}18`, borderRadius: 10, border: `1px solid ${item.color}33` }}>
              {item.badge}
            </span>
          )}
          {item.plays > 0 && (
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)" }}>▶ {item.plays.toLocaleString()}</span>
          )}
          {!item.badge && item.plays === 0 && (
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)" }}>NEW</span>
          )}
        </div>
      </div>

      {/* Action row */}
      <div style={{ display: "flex", gap: 4, marginTop: 8, paddingTop: 7, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        {/* Watch */}
        <button
          onClick={e => { e.stopPropagation(); router.push(item.href); }}
          style={{ flex: 1, padding: "4px 0", borderRadius: 6, border: "none", background: `${item.color}18`, color: item.color, fontSize: 8, fontWeight: 900, cursor: "pointer", letterSpacing: "0.06em" }}
        >
          {item.isLive ? "▶ JOIN" : "▶ WATCH"}
        </button>

        {/* Like */}
        <button
          onClick={handleLike}
          title={`${likes} likes`}
          style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${liked ? "#FF2DAA55" : "rgba(255,255,255,0.08)"}`, background: liked ? "rgba(255,45,170,0.12)" : "transparent", color: liked ? "#FF2DAA" : "rgba(255,255,255,0.35)", fontSize: 9, cursor: liked ? "default" : "pointer", transition: "all 0.15s" }}
        >
          {liked ? "♥" : "♡"} {likes > 0 ? likes : ""}
        </button>

        {/* Tip */}
        <button
          onClick={handleTip}
          style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(255,215,0,0.2)", background: "transparent", color: "#FFD700", fontSize: 9, cursor: "pointer", fontWeight: 800 }}
        >
          💰
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "rgba(255,255,255,0.35)", fontSize: 9, cursor: "pointer" }}
        >
          📤
        </button>

        {/* Save to Memory Wall */}
        <button
          onClick={handleSave}
          title={saved ? "Saved to Memory Wall" : "Save to Memory Wall"}
          style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${saved ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.08)"}`, background: saved ? "rgba(0,255,136,0.1)" : "transparent", color: saved ? "#00FF88" : "rgba(255,255,255,0.35)", fontSize: 9, cursor: saved ? "default" : "pointer", transition: "all 0.15s" }}
        >
          {saved ? "✓" : "📸"}
        </button>
      </div>
      </div>
    </div>
  );
}

// ── Main feed ───────────────────────────────────────────────────────────────
export default function BillboardContentFeed({ defaultTab = "live", maxItems = 6, compact = false, accentColor = "#00FFFF", userId = "guest" }: Props) {
  const [activeTab, setActiveTab] = useState<FeedTab>(defaultTab);
  const [items, setItems] = useState<FeedItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/media/feed?tab=${activeTab}&limit=${maxItems}`);
        if (res.ok) {
          const data = await res.json();
          if (data.assets?.length) {
            const mapped: FeedItem[] = data.assets.map((a: { id: string; title: string; artist: string; type: string; plays: number; url: string }) => ({
              id:     a.id,
              title:  a.title,
              artist: a.artist,
              type:   a.type.replace(/_/g, " ").toUpperCase(),
              plays:  a.plays,
              color:  "#00FFFF",
              emoji:  "🎵",
              href:   a.url ?? "#",
            }));
            setItems(mapped);
            return;
          }
        }
      } catch { /* fallthrough to seed */ }
      setItems(seedFeed(activeTab).slice(0, maxItems));
    }
    load();
  }, [activeTab, maxItems]);

  const tabMeta = TABS.find(t => t.key === activeTab)!;

  return (
    <div style={{ background: "rgba(255,255,255,0.015)", border: `1px solid ${accentColor}22`, borderRadius: 20, overflow: "hidden" }}>
      {/* Tab header */}
      <div style={{ padding: compact ? "12px 16px 0" : "16px 20px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ overflowX: "auto", display: "flex", gap: 4, paddingBottom: compact ? 10 : 12 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: compact ? "4px 10px" : "5px 12px",
                borderRadius: 20, border: "none", cursor: "pointer", whiteSpace: "nowrap",
                fontSize: 8, fontWeight: 800, letterSpacing: "0.08em",
                background: activeTab === t.key ? t.color : "rgba(255,255,255,0.05)",
                color: activeTab === t.key ? "#000" : "rgba(255,255,255,0.4)",
              }}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed list */}
      <div style={{ padding: compact ? "10px 14px 14px" : "14px 20px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
        {items.length === 0 && (
          <div style={{ padding: "24px 0", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 11 }}>
            {activeTab === "live" ? "No live sessions right now — check back soon." :
             activeTab === "battles" ? "No battles recorded yet." :
             activeTab === "cyphers" ? "No cypher highlights yet." :
             activeTab === "ranked" ? "Rankings populate as performers compete." :
             activeTab === "trending" ? "Nothing trending yet — be the first." :
             "No uploads yet."}
          </div>
        )}
        {items.map(item => (
          <MediaCard key={item.id} item={item} compact={compact} userId={userId} />
        ))}

        <button
          onClick={() => router.push(activeTab === "live" ? "/rooms" : activeTab === "battles" ? "/battles" : activeTab === "cyphers" ? "/cypher/stage" : activeTab === "ranked" ? "/store" : "/store")}
          style={{ marginTop: 4, padding: "8px", textAlign: "center", borderRadius: 8, background: `${tabMeta.color}0C`, border: `1px solid ${tabMeta.color}28`, color: tabMeta.color, fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", cursor: "pointer" }}
        >
          VIEW ALL {tabMeta.label} →
        </button>
      </div>
    </div>
  );
}
