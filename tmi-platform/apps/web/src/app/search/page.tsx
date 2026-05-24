"use client";
import { useState } from "react";
import Link from "next/link";

const TRENDING_SEARCHES = ["wavetek", "afrobeats", "monday cypher", "beat battle", "neon vibe", "trap beats", "cypher", "zuri bloom"];

const ALL_ROOMS = [
  { name: "Monday Cypher",   viewers: "4.2K", tag: "LIVE",  href: "/lobbies/monday-cypher",  color: "#FF2DAA" },
  { name: "The Neon Church", viewers: "2.8K", tag: "LIVE",  href: "/lobbies/neon-church",    color: "#00FFFF" },
  { name: "R&B Showcase",   viewers: "1.1K", tag: "LIVE",  href: "/live/zuri",               color: "#00FF88" },
  { name: "Battle Arena",   viewers: "890",  tag: "LIVE",  href: "/live/battles",             color: "#FFD700" },
];

const ALL_ARTISTS = [
  { name: "Wavetek",    genre: "Trap",       icon: "🎤", href: "/artists/wavetek",     color: "#FF2DAA" },
  { name: "Zuri Bloom", genre: "Afrobeats",  icon: "🌍", href: "/artists/zuri-bloom",  color: "#00FF88" },
  { name: "Neon Vibe",  genre: "House",      icon: "🎧", href: "/artists/neon-vibe",   color: "#00FFFF" },
  { name: "Krypt",      genre: "Boom Bap",   icon: "🔒", href: "/artists/krypt",       color: "#AA2DFF" },
  { name: "DJ Marcus",  genre: "Hip-Hop Mix",icon: "🎛️", href: "/artists/dj-marcus",   color: "#FFD700" },
  { name: "Ray Journey",genre: "Neo-Soul",   icon: "🎤", href: "/artists/ray-journey", color: "#00FF88" },
];

const ALL_BEATS = [
  { title: "Electric Sky",  producer: "Ray Journey", bpm: 140, price: "$29.99", href: "/beats/electric-sky",  color: "#FFD700" },
  { title: "Lagos Night",   producer: "Zuri Bloom",  bpm: 102, price: "$24.99", href: "/beats/lagos-night",   color: "#00FF88" },
  { title: "Cipher Code",   producer: "Krypt",       bpm: 88,  price: "$19.99", href: "/beats/cipher-code",   color: "#AA2DFF" },
  { title: "Frequency Drop",producer: "Wavetek",     bpm: 144, price: "$34.99", href: "/beats/frequency-drop",color: "#FF2DAA" },
  { title: "Neon Pulse",    producer: "Neon Vibe",   bpm: 128, price: "$22.99", href: "/beats/neon-pulse",    color: "#00FFFF" },
];

const ALL_ARTICLES = [
  { title: "TMI Platform Launch — Season 1 Begins", slug: "tmi-platform-launch", category: "NEWS" },
  { title: "How Wavetek Built His Empire on TMI", slug: "wavetek-tmi-story", category: "ARTIST" },
  { title: "The Beat Marketplace Is Now Live", slug: "beat-marketplace-launch", category: "NEWS" },
];

function matches(q: string, ...strs: string[]) {
  const lq = q.toLowerCase();
  return strs.some(s => s.toLowerCase().includes(lq));
}

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const q = query.trim();

  const rooms   = q ? ALL_ROOMS.filter(r   => matches(q, r.name))                          : ALL_ROOMS.slice(0, 2);
  const artists = q ? ALL_ARTISTS.filter(a => matches(q, a.name, a.genre))                  : ALL_ARTISTS.slice(0, 3);
  const beats   = q ? ALL_BEATS.filter(b   => matches(q, b.title, b.producer))              : ALL_BEATS.slice(0, 3);
  const articles= q ? ALL_ARTICLES.filter(a=> matches(q, a.title, a.category))              : ALL_ARTICLES;

  const totalResults = rooms.length + artists.length + beats.length + articles.length;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ padding: "40px 24px 28px", maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 16 }}>SEARCH TMI</div>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search artists, beats, rooms, articles..."
            autoFocus
            style={{ width: "100%", padding: "14px 20px", paddingLeft: 48, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
          />
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "rgba(255,255,255,0.3)" }}>🔍</span>
          {q && <span onClick={() => setQuery("")} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>✕</span>}
        </div>
        {q && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>{totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;</div>}
        {!q && (
          <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
            {TRENDING_SEARCHES.map(s => (
              <button key={s} onClick={() => setQuery(s)} style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "5px 12px", cursor: "pointer" }}>
                {s}
              </button>
            ))}
          </div>
        )}
      </section>

      {rooms.length > 0 && (
        <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 20px" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FF2DAA", fontWeight: 800, marginBottom: 14 }}>LIVE ROOMS</div>
          {rooms.map(r => (
            <Link key={r.name} href={r.href} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(255,255,255,0.02)", border: `1px solid ${r.color}18`, borderRadius: 10, padding: "12px 16px", marginBottom: 8 }}>
                <span style={{ fontSize: 7, fontWeight: 800, color: "#FF5555", background: "#FF555515", borderRadius: 3, padding: "2px 6px", flexShrink: 0 }}>{r.tag}</span>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: "#fff" }}>{r.name}</span>
                <span style={{ fontSize: 9, color: r.color }}>🔴 {r.viewers} watching</span>
              </div>
            </Link>
          ))}
        </section>
      )}

      {artists.length > 0 && (
        <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 20px" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 800, marginBottom: 14 }}>ARTISTS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
            {artists.map(a => (
              <Link key={a.name} href={a.href} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${a.color}18`, borderRadius: 10, padding: "14px", display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 22 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{a.name}</div>
                    <div style={{ fontSize: 8, color: a.color, marginTop: 2 }}>{a.genre}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {beats.length > 0 && (
        <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 20px" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 14 }}>BEATS</div>
          {beats.map(b => (
            <Link key={b.title} href={b.href} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(255,255,255,0.02)", border: `1px solid ${b.color}15`, borderRadius: 10, padding: "12px 16px", marginBottom: 7 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{b.title}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{b.producer} · {b.bpm} BPM</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: b.color }}>{b.price}</span>
              </div>
            </Link>
          ))}
        </section>
      )}

      {articles.length > 0 && (
        <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 20px" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#AA2DFF", fontWeight: 800, marginBottom: 14 }}>ARTICLES</div>
          {articles.map(a => (
            <Link key={a.slug} href={`/articles/${a.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(170,45,255,0.15)", borderRadius: 10, padding: "12px 16px", marginBottom: 7 }}>
                <span style={{ fontSize: 9, padding: "2px 7px", background: "rgba(170,45,255,0.12)", borderRadius: 4, color: "#AA2DFF", fontWeight: 800 }}>{a.category}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{a.title}</span>
              </div>
            </Link>
          ))}
        </section>
      )}

      {q && totalResults === 0 && (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
          No results found for &ldquo;{q}&rdquo;. Try a different search.
        </div>
      )}

      {!q && (
        <section style={{ textAlign: "center", marginTop: 8, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", padding: "0 24px" }}>
          <Link href="/browse" style={{ fontSize: 9, fontWeight: 700, color: "#00FFFF", textDecoration: "none", border: "1px solid #00FFFF30", borderRadius: 6, padding: "8px 16px" }}>Browse All →</Link>
          <Link href="/beat-marketplace" style={{ fontSize: 9, fontWeight: 700, color: "#FFD700", textDecoration: "none", border: "1px solid #FFD70030", borderRadius: 6, padding: "8px 16px" }}>Beat Marketplace →</Link>
          <Link href="/live/lobby" style={{ fontSize: 9, fontWeight: 700, color: "#FF2DAA", textDecoration: "none", border: "1px solid #FF2DAA30", borderRadius: 6, padding: "8px 16px" }}>Live Rooms →</Link>
        </section>
      )}
    </main>
  );
}
