"use client";

/**
 * BillboardContentFeed — Real content tabs for the TMI billboard wall.
 * Replaces static presenter cards with live data from MediaAssetEngine.
 *
 * Tabs: LIVE NOW · RECENT UPLOADS · TRENDING · BATTLE WINNERS · CYPHER HIGHLIGHTS
 */

import { useState, useEffect } from "react";
import Link from "next/link";

type FeedTab = "live" | "uploads" | "trending" | "battles" | "cyphers";

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

// Seed feed items — in production, replace with MediaEngine.getByType() calls via API
function seedFeed(tab: FeedTab): FeedItem[] {
  const base = {
    live: [
      { id: "l1", title: "Neon Frequency (LIVE)",    artist: "Nova Cipher",  type: "LIVE STREAM",    plays: 2147, color: "#FF2020", emoji: "🔴", href: "/rooms/main-stage",    isLive: true, badge: "LIVE" },
      { id: "l2", title: "Crown Season Set",         artist: "Big Ace",      type: "LIVE STREAM",    plays: 1863, color: "#FFD700", emoji: "🔴", href: "/rooms/colosseum-stage", isLive: true, badge: "LIVE" },
      { id: "l3", title: "Friday Cypher",            artist: "Open Floor",   type: "LIVE CYPHER",    plays: 941,  color: "#00FFFF", emoji: "🔴", href: "/rooms/cypher-dome",   isLive: true, badge: "LIVE" },
      { id: "l4", title: "World Dance Party",        artist: "DJ Phantom",   type: "LIVE DJ SET",    plays: 888,  color: "#AA2DFF", emoji: "🔴", href: "/rooms/world-dance-party", isLive: true, badge: "LIVE" },
    ],
    uploads: [
      { id: "u1", title: "Dark Matter Loop",         artist: "Lani Flame",   type: "BEAT",           plays: 0,    color: "#AA2DFF", emoji: "🎛️", href: "/performer/lani-flame" },
      { id: "u2", title: "Stage Recap — May",        artist: "Wave Tek",     type: "VIDEO",          plays: 0,    color: "#00FFFF", emoji: "🎬", href: "/performer/wave-tek" },
      { id: "u3", title: "Trap Cypher Verse",        artist: "Zion Freq",    type: "CYPHER ENTRY",   plays: 0,    color: "#00FF88", emoji: "🎤", href: "/performer/zion-freq" },
      { id: "u4", title: "Arena Challenge #4",       artist: "DJ Phantom",   type: "CHALLENGE",      plays: 0,    color: "#FFD700", emoji: "⚡", href: "/performer/dj-phantom" },
      { id: "u5", title: "Red Sky",                  artist: "Mika Voss",    type: "SONG",           plays: 0,    color: "#FF2DAA", emoji: "🎵", href: "/performer/mika-voss" },
      { id: "u6", title: "Bass Architecture",        artist: "Redbeard",     type: "BEAT",           plays: 0,    color: "#AA2DFF", emoji: "🎛️", href: "/performer/redbeard" },
    ],
    trending: [
      { id: "t1", title: "Neon Frequency",           artist: "Nova Cipher",  type: "SONG",           plays: 94200,color: "#FF2DAA", emoji: "🔥", href: "/performer/nova-cipher", badge: "#1 TRENDING" },
      { id: "t2", title: "Crown Season",             artist: "Big Ace",      type: "SONG",           plays: 71800,color: "#FFD700", emoji: "🔥", href: "/performer/big-ace",     badge: "#2" },
      { id: "t3", title: "Midnight Protocol",        artist: "Lani Flame",   type: "SONG",           plays: 48300,color: "#FF6B35", emoji: "🔥", href: "/performer/lani-flame",  badge: "#3" },
      { id: "t4", title: "City of Noise",            artist: "Wave Tek",     type: "VIDEO",          plays: 32100,color: "#00FFFF", emoji: "🎬", href: "/performer/wave-tek" },
      { id: "t5", title: "Dark Matter Loop",         artist: "Zion Freq",    type: "BEAT",           plays: 21400,color: "#AA2DFF", emoji: "🎛️", href: "/performer/zion-freq" },
    ],
    battles: [
      { id: "b1", title: "Nova Cipher vs. Big Ace",  artist: "Nova Cipher",  type: "BATTLE WIN",     plays: 8420, color: "#FF6B35", emoji: "⚔️", href: "/battles/1",  badge: "WINNER" },
      { id: "b2", title: "Wave Tek vs. DJ Phantom",  artist: "Wave Tek",     type: "BATTLE WIN",     plays: 6100, color: "#FFD700", emoji: "⚔️", href: "/battles/2",  badge: "WINNER" },
      { id: "b3", title: "Zion vs. Redbeard",        artist: "Zion Freq",    type: "BATTLE WIN",     plays: 4820, color: "#AA2DFF", emoji: "⚔️", href: "/battles/3",  badge: "WINNER" },
      { id: "b4", title: "Lani Flame vs. Mika Voss", artist: "Lani Flame",   type: "BATTLE WIN",     plays: 3300, color: "#FF2DAA", emoji: "⚔️", href: "/battles/4",  badge: "WINNER" },
    ],
    cyphers: [
      { id: "c1", title: "Friday Cipher Vol. 12",    artist: "Open Floor",   type: "CYPHER HIGHLIGHT",plays: 12400,color: "#00FF88", emoji: "🎤", href: "/cypher/stage", badge: "HOT" },
      { id: "c2", title: "Monday Night Bars",        artist: "Nova Cipher",  type: "CYPHER CLIP",    plays: 8100, color: "#00FFFF", emoji: "🎤", href: "/cypher/live" },
      { id: "c3", title: "Trap Session",             artist: "Big Ace",      type: "CYPHER CLIP",    plays: 5400, color: "#FFD700", emoji: "🎤", href: "/cypher/live" },
      { id: "c4", title: "Sunrise Verse",            artist: "Lani Flame",   type: "CYPHER CLIP",    plays: 3800, color: "#FF2DAA", emoji: "🎤", href: "/cypher/live" },
    ],
  };
  return base[tab];
}

const TABS: { key: FeedTab; label: string; emoji: string; color: string }[] = [
  { key: "live",     label: "LIVE NOW",        emoji: "🔴", color: "#FF2020" },
  { key: "uploads",  label: "RECENT UPLOADS",  emoji: "📤", color: "#00FFFF" },
  { key: "trending", label: "TRENDING",        emoji: "🔥", color: "#FFD700" },
  { key: "battles",  label: "BATTLE WINNERS",  emoji: "⚔️", color: "#FF6B35" },
  { key: "cyphers",  label: "CYPHER HIGHLIGHTS",emoji: "🎤", color: "#00FF88" },
];

interface Props {
  defaultTab?: FeedTab;
  maxItems?: number;
  compact?: boolean;
  accentColor?: string;
}

export default function BillboardContentFeed({ defaultTab = "live", maxItems = 6, compact = false, accentColor = "#00FFFF" }: Props) {
  const [activeTab, setActiveTab] = useState<FeedTab>(defaultTab);
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/media/feed?tab=${activeTab}&limit=${maxItems}`);
        if (res.ok) {
          const data = await res.json();
          if (data.assets?.length) {
            // Map API assets to FeedItem shape
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
      // Fallback: use seeded demo data so the wall is never empty
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
        {items.map((item, i) => (
          <Link
            key={item.id}
            href={item.href}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: compact ? "8px 10px" : "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: `1px solid ${item.color}18`, textDecoration: "none", transition: "border-color 0.15s" }}
          >
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
          </Link>
        ))}

        <Link
          href={activeTab === "live" ? "/rooms" : activeTab === "battles" ? "/battles" : activeTab === "cyphers" ? "/cypher/stage" : "/store"}
          style={{ marginTop: 4, padding: "8px", textAlign: "center", borderRadius: 8, background: `${tabMeta.color}0C`, border: `1px solid ${tabMeta.color}28`, color: tabMeta.color, fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", textDecoration: "none" }}
        >
          VIEW ALL {tabMeta.label} →
        </Link>
      </div>
    </div>
  );
}
