"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type EventType =
  | "fan-followed" | "fan-voted" | "fan-read-article" | "fan-attended-event"
  | "fan-earned-reward" | "fan-invited" | "fan-joined" | "fan-shared";

interface Actor { fanId: string; displayName: string }
interface Subject {
  subjectType: "artist" | "venue" | "article" | "event" | "reward" | "fan" | "show" | "content";
  subjectId: string;
  subjectLabel: string;
}
interface FeedEntry {
  entryId: string;
  eventType: EventType;
  actor: Actor;
  subject: Subject;
  feedScope: "public" | "followers" | "private";
  createdAtMs: number;
  metadata?: Record<string, string | number | boolean>;
}

const EVENT_ICONS: Record<EventType, string> = {
  "fan-followed":       "➕",
  "fan-voted":          "🗳️",
  "fan-read-article":   "📰",
  "fan-attended-event": "🎟️",
  "fan-earned-reward":  "🏆",
  "fan-invited":        "📨",
  "fan-joined":         "🌟",
  "fan-shared":         "🔗",
};

const EVENT_COLORS: Record<EventType, string> = {
  "fan-followed":       "#00FFFF",
  "fan-voted":          "#FFD700",
  "fan-read-article":   "#FF2DAA",
  "fan-attended-event": "#00FF88",
  "fan-earned-reward":  "#FFD700",
  "fan-invited":        "#AA2DFF",
  "fan-joined":         "#39FF14",
  "fan-shared":         "#FF6B35",
};

const SEED_ENTRIES: FeedEntry[] = [
  { entryId: "s1", eventType: "fan-followed",       actor: { fanId: "a1", displayName: "Nova Cipher Fan #1"  }, subject: { subjectType: "artist", subjectId: "nova-cipher", subjectLabel: "Nova Cipher"         }, feedScope: "public", createdAtMs: Date.now() - 2*60*1000  },
  { entryId: "s2", eventType: "fan-voted",           actor: { fanId: "a2", displayName: "BigAce Believer"     }, subject: { subjectType: "event",  subjectId: "battle-001",  subjectLabel: "Big Ace vs Charro"    }, feedScope: "public", createdAtMs: Date.now() - 5*60*1000  },
  { entryId: "s3", eventType: "fan-attended-event",  actor: { fanId: "a3", displayName: "LobbyKing23"         }, subject: { subjectType: "event",  subjectId: "cypher-fri",  subjectLabel: "Friday Night Cypher"  }, feedScope: "public", createdAtMs: Date.now() - 8*60*1000  },
  { entryId: "s4", eventType: "fan-earned-reward",   actor: { fanId: "a4", displayName: "WaveFan"             }, subject: { subjectType: "reward", subjectId: "crown-badge", subjectLabel: "Crown Badge"          }, feedScope: "public", createdAtMs: Date.now() - 12*60*1000 },
  { entryId: "s5", eventType: "fan-read-article",    actor: { fanId: "a5", displayName: "MusicHead99"         }, subject: { subjectType: "article",subjectId: "art-01",      subjectLabel: "Issue 1 Cover Story"  }, feedScope: "public", createdAtMs: Date.now() - 18*60*1000 },
  { entryId: "s6", eventType: "fan-joined",          actor: { fanId: "a6", displayName: "NewFan_2026"         }, subject: { subjectType: "fan",    subjectId: "ref-02",      subjectLabel: "via referral"         }, feedScope: "public", createdAtMs: Date.now() - 24*60*1000 },
  { entryId: "s7", eventType: "fan-shared",          actor: { fanId: "a7", displayName: "ViralQueen"          }, subject: { subjectType: "content",subjectId: "pl-01",       subjectLabel: "Hip-Hop Playlist"     }, feedScope: "public", createdAtMs: Date.now() - 32*60*1000 },
  { entryId: "s8", eventType: "fan-invited",         actor: { fanId: "a8", displayName: "PromoterJack"        }, subject: { subjectType: "fan",    subjectId: "inv-01",      subjectLabel: "3 friends"            }, feedScope: "public", createdAtMs: Date.now() - 45*60*1000 },
];

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 60_000) return "just now";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return `${Math.floor(diff / 86400_000)}d ago`;
}

function entryLabel(e: FeedEntry): string {
  switch (e.eventType) {
    case "fan-followed":       return `followed ${e.subject.subjectLabel}`;
    case "fan-voted":          return `voted in ${e.subject.subjectLabel}`;
    case "fan-read-article":   return `read ${e.subject.subjectLabel}`;
    case "fan-attended-event": return `attended ${e.subject.subjectLabel}`;
    case "fan-earned-reward":  return `earned ${e.subject.subjectLabel}`;
    case "fan-invited":        return `invited ${e.subject.subjectLabel}`;
    case "fan-joined":         return `joined TMI ${e.subject.subjectLabel}`;
    case "fan-shared":         return `shared ${e.subject.subjectLabel}`;
    default:                   return e.subject.subjectLabel;
  }
}

export default function SocialFeedPage() {
  const [entries, setEntries] = useState<FeedEntry[]>(SEED_ENTRIES);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | EventType>("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/social/feed?limit=40");
      if (res.ok) {
        const data = await res.json() as { entries?: FeedEntry[] };
        if (Array.isArray(data.entries) && data.entries.length > 0) {
          setEntries(data.entries);
        }
      }
    } catch {
      // keep seed data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const eventTypes: EventType[] = [
    "fan-followed", "fan-voted", "fan-attended-event", "fan-earned-reward",
    "fan-read-article", "fan-joined", "fan-shared", "fan-invited",
  ];

  const displayed = filter === "all" ? entries : entries.filter((e) => e.eventType === filter);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #050510, #0a0820)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "28px 24px 20px",
        position: "sticky", top: 0, zIndex: 10,
        backdropFilter: "blur(16px)",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Link href="/dashboard/fan" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
            ← FAN HUB
          </Link>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
            <div>
              <div style={{ fontSize: 8, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800 }}>COMMUNITY</div>
              <h1 style={{ margin: "4px 0 0", fontSize: "clamp(1.2rem,3vw,1.6rem)", fontWeight: 900 }}>Social Feed</h1>
            </div>
            <button
              onClick={() => void load()}
              disabled={loading}
              style={{
                border: "1px solid rgba(0,255,255,0.3)", background: "rgba(0,255,255,0.06)",
                color: "#00FFFF", borderRadius: 8, padding: "7px 14px",
                fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", cursor: "pointer",
              }}
            >
              {loading ? "..." : "↻ REFRESH"}
            </button>
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
            <button
              onClick={() => setFilter("all")}
              style={{
                border: `1px solid ${filter === "all" ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)"}`,
                background: filter === "all" ? "rgba(255,255,255,0.08)" : "transparent",
                color: filter === "all" ? "#fff" : "rgba(255,255,255,0.4)",
                borderRadius: 6, padding: "4px 10px", fontSize: 9, fontWeight: 700, cursor: "pointer",
              }}
            >
              ALL
            </button>
            {eventTypes.map((t) => {
              const color = EVENT_COLORS[t];
              return (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  style={{
                    border: `1px solid ${filter === t ? color + "66" : "rgba(255,255,255,0.08)"}`,
                    background: filter === t ? `${color}14` : "transparent",
                    color: filter === t ? color : "rgba(255,255,255,0.3)",
                    borderRadius: 6, padding: "4px 10px", fontSize: 9, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  {EVENT_ICONS[t]} {t.replace("fan-", "").replace("-", " ").toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 24px" }}>
        {displayed.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "rgba(255,255,255,0.25)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p style={{ fontSize: 13, margin: 0 }}>No activity in this category yet.</p>
          </div>
        ) : (
          <AnimatePresence>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {displayed.map((entry, i) => {
                const icon = EVENT_ICONS[entry.eventType];
                const color = EVENT_COLORS[entry.eventType];
                return (
                  <motion.div
                    key={entry.entryId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                      padding: "12px 16px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: 10,
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                      background: `${color}14`, border: `1px solid ${color}33`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16,
                    }}>
                      {icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                        <span style={{ color }}>{entry.actor.displayName}</span>
                        {" "}{entryLabel(entry)}
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>
                        {timeAgo(entry.createdAtMs)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}

        <div style={{ marginTop: 28, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/dashboard/fan" style={{ padding: "9px 18px", fontSize: 10, fontWeight: 700, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 8, textDecoration: "none" }}>
            Fan Hub
          </Link>
          <Link href="/battles" style={{ padding: "9px 18px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, textDecoration: "none" }}>
            Battles
          </Link>
          <Link href="/leaderboard" style={{ padding: "9px 18px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, textDecoration: "none" }}>
            Leaderboard
          </Link>
        </div>
      </div>
    </main>
  );
}
