"use client";

import { useMemo, useState } from "react";
import { DeckButton } from "@/components/admin/overseer/AdminDesignSystem";

type Card = {
  id: string;
  title: string;
  subtitle: string;
  tone: "live" | "event" | "sponsor";
};

const CARDS: Card[] = [
  { id: "1", title: "Live Performance: Ace", subtitle: "Neutral tones", tone: "live" },
  { id: "2", title: "Cypher Tournament Event", subtitle: "Tournament feed", tone: "event" },
  { id: "3", title: "Transistor Hut Beta Launch", subtitle: "Product demo feed", tone: "event" },
  { id: "4", title: "Sponsor Segment: Pundworthy", subtitle: "Advertiser feed", tone: "sponsor" },
];

const toneOverlay: Record<Card["tone"], string> = {
  live: "linear-gradient(180deg, rgba(0,255,136,0.12), rgba(0,0,0,0.72))",
  event: "linear-gradient(180deg, rgba(250,204,21,0.12), rgba(0,0,0,0.72))",
  sponsor: "linear-gradient(180deg, rgba(232,121,249,0.12), rgba(0,0,0,0.72))",
};

const cardGraphics: Record<string, React.ReactNode> = {
  "1": (
    <svg width="100%" height="100%" viewBox="0 0 160 100" style={{ background: "#1a1a24" }}>
      <circle cx="80" cy="40" r="20" fill="none" stroke="#FFD700" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M50 90 C 50 70, 110 70, 110 90" fill="none" stroke="#FFD700" strokeWidth="2" />
      <line x1="80" y1="60" x2="80" y2="85" stroke="#00FFFF" strokeWidth="2" />
      <circle cx="80" cy="58" r="4" fill="#00FFFF" />
    </svg>
  ),
  "2": (
    <svg width="100%" height="100%" viewBox="0 0 160 100" style={{ background: "#241812" }}>
      <path d="M 10 90 L 30 70 L 50 85 L 70 65 L 90 80 L 110 60 L 130 75 L 150 50" fill="none" stroke="#FF5500" strokeWidth="2" />
      <circle cx="150" cy="50" r="3" fill="#00FF88" />
      <line x1="150" y1="50" x2="150" y2="90" stroke="#00FF88" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  ),
  "3": (
    <svg width="100%" height="100%" viewBox="0 0 160 100" style={{ background: "#121d24" }}>
      <rect x="20" y="20" width="120" height="60" rx="6" fill="none" stroke="#00FFFF" strokeWidth="1.5" />
      <line x1="40" y1="40" x2="120" y2="40" stroke="#00FFFF" strokeWidth="1" />
      <line x1="40" y1="50" x2="100" y2="50" stroke="#00FFFF" strokeWidth="1" />
      <line x1="40" y1="60" x2="80" y2="60" stroke="#00FFFF" strokeWidth="1" />
    </svg>
  ),
  "4": (
    <svg width="100%" height="100%" viewBox="0 0 160 100" style={{ background: "#1f1224" }}>
      <circle cx="80" cy="50" r="30" fill="none" stroke="#DA70D6" strokeWidth="2" />
      <circle cx="80" cy="50" r="20" fill="none" stroke="#8A2BE2" strokeWidth="1.5" />
      <line x1="40" y1="50" x2="120" y2="50" stroke="#DA70D6" strokeWidth="1" />
      <line x1="80" y1="10" x2="80" y2="90" stroke="#DA70D6" strokeWidth="1" />
    </svg>
  )
};

export default function FeedExplorer() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("Hip-Hop");
  const [mode, setMode] = useState<"live" | "trending">("trending");

  const visible = useMemo(() => {
    return CARDS.filter((card) => card.title.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  return (
    <section style={{ height: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          borderRadius: 8,
          border: "1px solid rgba(241,181,66,0.38)",
          background: "linear-gradient(180deg, rgba(76,32,25,0.62), rgba(26,11,14,0.84))",
          padding: 8,
          display: "grid",
          gap: 7,
        }}
      >
        <div
          style={{
            borderRadius: 8,
            border: "1px solid rgba(241,181,66,0.35)",
            background: "rgba(12,7,10,0.78)",
            padding: "6px 8px",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 8,
            alignItems: "center",
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search artists or events"
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#ffe9bb",
              fontSize: 11,
              fontWeight: 700,
              width: "100%",
            }}
          />
          <span style={{ fontSize: 11, color: "#f4d07f" }}>⌕</span>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <DeckButton onClick={() => setMode("live")} active={mode === "live"}>Live Now</DeckButton>
          <DeckButton onClick={() => setGenre("Hip-Hop")} active={genre === "Hip-Hop"}>Genre: Hip-Hop</DeckButton>
          <DeckButton onClick={() => setMode("trending")} active={mode === "trending"}>Top Trending</DeckButton>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
        {visible.map((card) => (
          <article
            key={card.id}
            style={{
              borderRadius: 9,
              border: "1px solid rgba(241,181,66,0.45)",
              background: "#07090d",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ position: "relative", height: 108, overflow: "hidden" }}>
              {cardGraphics[card.id]}
              <div style={{ position: "absolute", inset: 0, background: toneOverlay[card.tone] }} />
              <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 4px)", opacity: 0.3, pointerEvents: "none" }} />
              <div style={{ position: "absolute", left: 8, top: 8, borderRadius: 999, border: "1px solid rgba(255,216,143,0.45)", background: "rgba(0,0,0,0.55)", color: "#ffe9bb", padding: "2px 6px", fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {mode === "live" ? "Live" : "Feed"}
              </div>
            </div>
            <div style={{ padding: "8px 9px" }}>
              <div style={{ color: "#fff1c3", fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.04em" }}>{card.title}</div>
              <div style={{ marginTop: 3, color: "rgba(255,216,143,0.72)", fontSize: 9 }}>{card.subtitle}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
