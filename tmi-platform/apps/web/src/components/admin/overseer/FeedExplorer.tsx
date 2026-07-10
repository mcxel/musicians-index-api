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
            <div style={{ position: "relative", height: 108, background: "linear-gradient(135deg, rgba(110,120,140,0.25), rgba(28,30,39,0.7))" }}>
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
