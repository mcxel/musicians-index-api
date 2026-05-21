"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const T = {
  void: "#0D0520", deep: "#150830", card: "#1E0D3E", raised: "#2A1452",
  cyan: "#00E5FF", gold: "#FFB800", pink: "#FF2D78", purple: "#7B2FBE",
  text: "#FFFFFF", text2: "#C8A8E8", text3: "#7A5F9A",
  display: "'Bebas Neue', Impact, sans-serif",
  heading: "'Oswald', 'Arial Narrow', sans-serif",
  body: "'Inter', sans-serif",
};

function SectionCard({ icon, title, sub, href, accent }: { icon: string; title: string; sub: string; href: string; accent: string }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{ background: T.card, border: `1px solid ${accent}44`, borderRadius: 12, padding: 20, cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontSize: 28 }}>{icon}</span>
        <div style={{ fontFamily: T.display, fontSize: 20, color: accent, letterSpacing: 1 }}>{title}</div>
        <div style={{ fontFamily: T.heading, fontSize: 12, color: T.text2 }}>{sub}</div>
      </div>
    </Link>
  );
}

export default function MagazineFront() {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ background: T.void, minHeight: "100vh", color: T.text, fontFamily: T.body }}>
      
      {/* ── ENTRY HEADLINE ── */}
      <div style={{
        background: `linear-gradient(to bottom, ${T.raised}, ${T.deep})`,
        borderBottom: `1px solid rgba(255,184,0,0.3)`,
        padding: "64px 32px 48px",
        textAlign: "center",
        opacity: entered ? 1 : 0,
        transform: entered ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.8s ease",
      }}>
        <div style={{ fontFamily: T.heading, fontSize: 11, color: T.cyan, letterSpacing: 4, marginBottom: 8 }}>
          THE MUSICIAN&apos;S INDEX
        </div>
        <h1 style={{ fontFamily: T.display, fontSize: 64, color: T.gold, letterSpacing: 4, lineHeight: 1, margin: "0 0 8px" }}>
          WELCOME TO
        </h1>
        <h1 style={{ fontFamily: T.display, fontSize: 48, color: T.text, letterSpacing: 3, lineHeight: 1, margin: "0 0 24px" }}>
          THE MUSICIAN&apos;S INDEX MAGAZINE
        </h1>
        <div style={{ fontFamily: T.heading, fontSize: 13, color: T.text2, letterSpacing: 2 }}>
          YOUR STAGE. YOUR STORY. YOUR SOUND.
        </div>

        {/* Sub-nav */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 32, flexWrap: "wrap" }}>
          {[["📰 FEATURED", "/magazine/featured"], ["🗞 NEWS", "/magazine/news"], ["🎙 INTERVIEWS", "/magazine/interviews"], ["⭐ REVIEWS", "/magazine/reviews"], ["📈 TRENDING", "/magazine/trending"]].map(([l, h]) => (
            <Link key={l} href={h} style={{ padding: "8px 16px", border: `1px solid rgba(0,229,255,0.4)`, borderRadius: 99, color: T.cyan, fontFamily: T.heading, fontSize: 11, letterSpacing: 1, textDecoration: "none" }}>{l}</Link>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>

        {/* ── FEATURED PERFORMER ── */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span style={{ color: T.gold, fontSize: 14 }}>⚡</span>
            <span style={{ fontFamily: T.display, fontSize: 20, color: T.gold, letterSpacing: 2 }}>FEATURED PERFORMER</span>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${T.gold}66, transparent)` }} />
          </div>
          <div style={{ background: T.card, border: `2px solid ${T.cyan}`, boxShadow: `0 0 16px rgba(0,229,255,0.3)`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", minHeight: 200 }}>
              <div style={{ background: `linear-gradient(135deg, ${T.purple}, ${T.void})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80, padding: 32 }}>👤</div>
              <div style={{ padding: 28 }}>
                <div style={{ background: T.gold, color: T.void, fontFamily: T.heading, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, padding: "2px 8px", borderRadius: 4, display: "inline-block", marginBottom: 12 }}>FEATURED PERFORMER</div>
                <div style={{ fontFamily: T.display, fontSize: 32, color: T.gold, letterSpacing: 2, marginBottom: 8 }}>ARTIST NAME</div>
                <div style={{ fontFamily: T.heading, fontSize: 13, color: T.text2, lineHeight: 1.6, marginBottom: 20 }}>Featured performer article preview loads here from editorial API when wired.</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Link href="/articles/featured-performer" style={{ padding: "8px 16px", background: T.cyan, color: T.void, borderRadius: 6, fontFamily: T.heading, fontSize: 11, fontWeight: 700, letterSpacing: 1, textDecoration: "none" }}>READ ARTICLE →</Link>
                  <Link href="/stations/featured-artist" style={{ padding: "8px 16px", border: `1px solid ${T.gold}`, color: T.gold, borderRadius: 6, fontFamily: T.heading, fontSize: 11, letterSpacing: 1, textDecoration: "none" }}>📻 STATION</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── NEWS BILLBOARD ── */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span style={{ color: T.gold, fontSize: 14 }}>⚡</span>
            <span style={{ fontFamily: T.display, fontSize: 20, color: T.gold, letterSpacing: 2 }}>NEWS BILLBOARD</span>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${T.gold}66, transparent)` }} />
            <Link href="/magazine/news" style={{ fontFamily: T.heading, fontSize: 11, color: T.cyan, textDecoration: "none", letterSpacing: 1 }}>ALL NEWS →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[1,2,3,4].map(n => (
              <Link key={n} href={`/news/story-${n}`} style={{ textDecoration: "none" }}>
                <div style={{ background: T.card, border: `1px solid rgba(0,229,255,0.2)`, borderRadius: 10, padding: "14px 16px", display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <span style={{ fontFamily: T.display, fontSize: 32, color: T.gold, lineHeight: 1, minWidth: 28 }}>{n}</span>
                  <div>
                    <div style={{ fontFamily: T.heading, fontSize: 14, color: T.text, marginBottom: 4 }}>Music news headline {n} — story loads from editorial API</div>
                    <div style={{ fontFamily: T.heading, fontSize: 10, color: T.text3, letterSpacing: 1 }}>MUSIC NEWS · 2h ago</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── SECTION GRID ── */}
        <div>
          <div style={{ fontFamily: T.display, fontSize: 20, color: T.gold, letterSpacing: 2, marginBottom: 20 }}>EXPLORE THE MAGAZINE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            <SectionCard icon="🎙" title="INTERVIEWS" sub="Artist conversations from the index" href="/magazine/interviews" accent={T.purple} />
            <SectionCard icon="⭐" title="REVIEWS" sub="New releases, albums, and shows" href="/magazine/reviews" accent={T.cyan} />
            <SectionCard icon="📚" title="TUTORIALS" sub="Craft, production, and performance" href="/magazine/tutorials" accent={T.teal} />
            <SectionCard icon="📈" title="TRENDING" sub="What the community is watching now" href="/magazine/trending" accent={T.pink} />
            <SectionCard icon="🏠" title="LOCAL ARTISTS" sub="Discovery-first in your area" href="/magazine/local" accent={T.gold} />
            <SectionCard icon="🗓" title="EVENTS" sub="Shows, launches, and listening parties" href="/magazine/events" accent={T.amber} />
          </div>
        </div>

      </div>
    </div>
  );
}
