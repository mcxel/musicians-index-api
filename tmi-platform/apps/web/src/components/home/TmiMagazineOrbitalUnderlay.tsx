"use client";
/**
 * TmiMagazineOrbitalUnderlay
 * ──────────────────────────
 * The canonical Home 1 orbital + scrolling tabloid underlay.
 * Reference: Homapge and battle challange and cyphers/tmi_home1_complete_magazine_orbital_underlay.html
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │  SCROLLING TABLOID PANELS (full-screen width, 420px tall)    │
 *   │  ← WHO TOOK CROWN · BATTLE NIGHT · CYPHER · CHALLENGE →     │
 *   │          ↑ these scroll left or right automatically         │
 *   │                                                              │
 *   │              ORBITAL WHEEL (floats on top)                   │
 *   │         10 ranked artists spinning around center             │
 *   │              ← BACK / NEXT ▶ navigation                     │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * Expandable lobbies: clicking any orbital node expands a lobby modal
 * showing that venue's live preview, room list, and enter CTA.
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AudienceScene from "@/components/live/AudienceScene";

// ── Design tokens (from tmiTokens.js) ────────────────────────────────────────
const C = {
  bg:     "#050815",
  panel:  "rgba(8,14,38,.95)",
  card:   "rgba(12,20,50,.90)",
  red:    "#E63000",
  orange: "#FF6B00",
  amber:  "#FF8C00",
  gold:   "#FFD700",
  green:  "#00FF7F",
  cyan:   "#00E5FF",
  pink:   "#FF2DAA",
  purple: "#7B00FF",
  white:  "#FFFFFF",
};

// ── Tabloid panels (the scrolling underlay) ───────────────────────────────────
const MAG_PANELS = [
  {
    id: "crown",
    bg: "#FFD700",
    headerBg: "#FF1493",
    headerText: "THE MUSICIAN'S INDEX · VOL.1 · $4.99",
    headline: "WHO TOOK THE CROWN?",
    headlineColor: "#000",
    subjectBg: "#00BFFF",
    subject: "BIG ACE",
    subjectColor: "#000",
    detail: "RANK · DJ BLEND · 41 CYPHER WINS",
    detailBg: "#000",
    detailColor: "#fff",
    tags: [
      { label: "CYPHER OPEN", bg: "#00BFFF", color: "#000" },
      { label: "VOTE NOW",    bg: "#FF1493", color: "#fff" },
      { label: "4,812 VOTES", bg: "#000",    color: C.gold },
    ],
    footer: "STREAM & WIN RADIO LIVE · BATTLE TONIGHT 8PM",
    footerBg: "#FFD700",
    footerColor: "#000",
    href: "/vote",
  },
  {
    id: "battle",
    bg: "#FF1493",
    headerBg: "#000",
    headerText: "TMI · HIP-HOP EDITION · WEEK 25",
    headline: "BATTLE NIGHT CHAMPION",
    headlineColor: C.gold,
    subjectBg: C.gold,
    subject: "WAVETEK",
    subjectColor: "#000",
    detail: "CHALLENGE HIM AT THE BATTLE ARENA NOW",
    detailBg: "#000",
    detailColor: "#FF1493",
    tags: [
      { label: "⚔️ CHALLENGE OPENS 8PM", bg: "#00BFFF", color: "#000" },
    ],
    footer: "JOIN THE BATTLE · ENTER YOUR SONG · WIN TONIGHT",
    footerBg: "#000",
    footerColor: "#FF1493",
    href: "/battles",
  },
  {
    id: "cypher",
    bg: "#00BFFF",
    headerBg: "#000",
    headerText: "TMI CYPHER EDITION · OPEN MIC · LIVE NOW",
    headline: "WHO'S GOT THE BARS?",
    headlineColor: "#000",
    subjectBg: C.gold,
    subject: "NOVA CIPHER",
    subjectColor: "#000",
    detail: "CYPHER ARENA — 841 WATCHING LIVE",
    detailBg: "#FF1493",
    detailColor: "#fff",
    tags: [
      { label: "THEATER SEATS 2,730", bg: "#000", color: "#00BFFF" },
    ],
    footer: "OPEN MIC ALL DAY · ROTATE THROUGH · WIN XP",
    footerBg: "#000",
    footerColor: "#00BFFF",
    href: "/cypher",
  },
  {
    id: "challenge",
    bg: "#000",
    headerBg: C.gold,
    headerText: "TMI CHALLENGE ARENA · SONG VS SONG",
    headline: "CHALLENGE THE CROWN HOLDER",
    headlineColor: C.gold,
    subjectBg: C.gold,
    subject: "BEAT THE BEAT",
    subjectColor: "#000",
    detail: "YOUR SONG CAN TAKE THE THRONE",
    detailBg: "#FF1493",
    detailColor: "#fff",
    tags: [
      { label: "ARENA SEATS 18,500 · JOIN FREE", bg: "#00BFFF", color: "#000" },
    ],
    footer: "CHALLENGE RUNS ALL DAY · WINNER STAYS · NONSTOP",
    footerBg: C.gold,
    footerColor: "#000",
    href: "/challenge",
  },
];

// ── Orbital nodes ─────────────────────────────────────────────────────────────
const ORBIT_NODES = [
  { rank: 1,  name: "Astra Nova",   genre: "R&B",     color: C.pink,   live: true,  slug: "astra-nova",   venue: "/rooms/world-concert",    venueIndex: 1 as const },
  { rank: 2,  name: "Prism Vex",    genre: "EDM",     color: C.gold,   live: false, slug: "prism-vex",    venue: "/rooms/monthly-idol",     venueIndex: 0 as const },
  { rank: 3,  name: "Zion Freq",    genre: "Gospel",  color: C.green,  live: true,  slug: "zion-freq",    venue: "/rooms/fan-meetup",       venueIndex: 2 as const },
  { rank: 4,  name: "Flex King",    genre: "Dance",   color: C.cyan,   live: true,  slug: "flex-king",    venue: "/rooms/world-dance-party",venueIndex: 2 as const },
  { rank: 5,  name: "Song Chall.",  genre: "Hip-Hop", color: C.purple, live: true,  slug: "song-chall",   venue: "/challenge",              venueIndex: 3 as const },
  { rank: 6,  name: "Main Lobby",   genre: "Various", color: C.amber,  live: true,  slug: "main-lobby",   venue: "/live/rooms",             venueIndex: 0 as const },
  { rank: 7,  name: "Battle Floor", genre: "LIVE",    color: C.red,    live: true,  slug: "battle-floor", venue: "/battles/live",           venueIndex: 1 as const },
  { rank: 8,  name: "Lagos Burst",  genre: "Afrobeat",color: C.gold,   live: false, slug: "lagos-burst",  venue: "/rooms/new-release",      venueIndex: 0 as const },
  { rank: 9,  name: "Nova Laugh",   genre: "Comedy",  color: C.cyan,   live: false, slug: "nova-laugh",   venue: "/rooms/monday-stage",     venueIndex: 0 as const },
  { rank: 10, name: "Dance Crew",   genre: "Dance",   color: C.pink,   live: false, slug: "dance-crew",   venue: "/rooms/world-dance-party",venueIndex: 2 as const },
];

// Orbit positions: equally spaced on a circle, radius ~174px, center 190px
function orbitPos(i: number, total: number) {
  const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
  const r = 164;
  return { x: 190 + r * Math.cos(angle), y: 190 + r * Math.sin(angle) };
}

// ── Expandable Lobby Modal ────────────────────────────────────────────────────
function LobbyModal({ node, onClose }: { node: typeof ORBIT_NODES[0]; onClose: () => void }) {
  const router = useRouter();
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 680, background: C.bg, border: `2px solid ${node.color}55`, borderRadius: 20, overflow: "hidden" }}
      >
        {/* Arena preview */}
        <div style={{ height: 220, position: "relative" }}>
          <AudienceScene
            venue={node.venueIndex}
            watcherCount={node.venueIndex === 1 ? 18500 : node.venueIndex === 0 ? 2730 : 420}
            view="fan"
            accentColor={node.color}
            bpm={node.genre === "Dance" ? 138 : node.genre === "Hip-Hop" ? 145 : 120}
            screenLabel={node.name}
            screenSubLabel={node.genre + (node.live ? " · LIVE" : "")}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, #050815 100%)" }} />
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 14, background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          {node.live && (
            <div style={{ position: "absolute", top: 12, left: 14, display: "flex", alignItems: "center", gap: 5, background: "rgba(0,0,0,0.7)", padding: "3px 10px", borderRadius: 6, backdropFilter: "blur(4px)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF2020", display: "inline-block" }} />
              <span style={{ fontSize: 8, fontWeight: 900, color: "#fff", letterSpacing: "0.12em" }}>LIVE NOW</span>
            </div>
          )}
        </div>

        {/* Modal body */}
        <div style={{ padding: "18px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 9, color: node.color, fontWeight: 900, letterSpacing: "0.2em", marginBottom: 4 }}>#{node.rank} · {node.genre}</div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>{node.name}</h2>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>STATUS</div>
              <div style={{ fontSize: 11, fontWeight: 900, color: node.live ? "#00FF7F" : "rgba(255,255,255,0.4)" }}>{node.live ? "● LIVE" : "○ OFFLINE"}</div>
            </div>
          </div>

          {/* Mini room list */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
            {["Live Show", "Battles", "Cypher"].map((r, i) => (
              <div key={r} style={{ background: `${node.color}12`, border: `1px solid ${node.color}30`, borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: node.color }}>{r}</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{[841, 324, 156][i]} watching</div>
              </div>
            ))}
          </div>

          {/* Revenue hooks */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {[
              { label: "💰 Tip", href: `/api/stripe/checkout?priceId=price_tip&amount=500&productName=${encodeURIComponent("Tip " + node.name)}&mode=payment` },
              { label: "🎫 Ticket", href: `/tickets?event=${node.slug}` },
              { label: "👑 Subscribe", href: "/subscribe" },
            ].map(h => (
              <Link key={h.label} href={h.href} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 9, fontWeight: 800, textDecoration: "none", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.12)" }}>
                {h.label}
              </Link>
            ))}
          </div>

          <button
            onClick={() => { onClose(); router.push(node.venue + "?autoSeat=1"); }}
            style={{ width: "100%", padding: "13px 0", borderRadius: 10, border: "none", background: `linear-gradient(90deg, ${node.color}, ${node.color}88)`, color: "#000", fontWeight: 900, fontSize: 13, cursor: "pointer", letterSpacing: "0.1em" }}
          >
            ▶ ENTER + SIT IN AUDIENCE
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TmiMagazineOrbitalUnderlay() {
  const [scrollDir, setScrollDir] = useState<"left" | "right">("left");
  const [voteCount, setVoteCount] = useState(4948);
  const [centerIdx, setCenterIdx] = useState(0);
  const [expandedNode, setExpandedNode] = useState<typeof ORBIT_NODES[0] | null>(null);
  const centerNode = ORBIT_NODES[centerIdx % ORBIT_NODES.length]!;

  // Tick vote count
  useEffect(() => {
    const id = setInterval(() => setVoteCount(v => v + Math.floor(Math.random() * 8)), 2000);
    return () => clearInterval(id);
  }, []);

  // Auto-advance center node every 6s
  useEffect(() => {
    const id = setInterval(() => setCenterIdx(i => (i + 1) % ORBIT_NODES.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Anton&display=swap');
        @keyframes tmiOrbitSpin        { from{transform:rotate(0deg)}   to{transform:rotate(360deg)}  }
        @keyframes tmiCounterSpin      { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }
        @keyframes tmiScrollLeft       { from{transform:translateX(0)}  to{transform:translateX(-50%)} }
        @keyframes tmiScrollRight      { from{transform:translateX(-50%)} to{transform:translateX(0)}  }
        @keyframes tmiTypeColor        { 0%{color:#fff}25%{color:#FFD700}50%{color:#00FF7F}75%{color:#E63000}100%{color:#fff} }
        @keyframes tmiBadgePulse       { 0%,100%{background:rgba(255,45,170,.3);border-color:rgba(255,45,170,.7)}50%{background:rgba(255,45,170,.5);border-color:#FF2DAA} }
        @keyframes tmiCenterPulse      { 0%,100%{box-shadow:0 0 20px rgba(0,229,255,.4)}50%{box-shadow:0 0 40px rgba(0,229,255,.7),0 0 60px rgba(255,45,170,.3)} }
        @keyframes tmiVotePulse        { 0%,100%{color:#FFD700}50%{color:#fff} }
        @keyframes tmiChallengeBounce  { 0%,100%{transform:translateX(0)}50%{transform:translateX(4px)} }
        @keyframes tmiBlink            { 0%,100%{opacity:1}50%{opacity:0} }
        .tmi-orbit-ring   { animation:tmiOrbitSpin   38s linear infinite; transform-origin:190px 190px; }
        .tmi-node-counter { animation:tmiCounterSpin 38s linear infinite; transform-origin:center; }
        .tmi-center-hub   { animation:tmiCenterPulse 3s ease-in-out infinite; }
        .tmi-underlay-left  { animation:tmiScrollLeft  18s linear infinite; }
        .tmi-underlay-right { animation:tmiScrollRight 18s linear infinite; }
        .tmi-twl { animation:tmiTypeColor 4s ease-in-out infinite; }
        .tmi-live-dot { display:inline-block;width:7px;height:7px;border-radius:50%;background:#FF2020;animation:tmiBlink 1s step-end infinite;vertical-align:middle;margin-right:4px; }
      `}</style>

      {/* ── Beta bar ── */}
      <div style={{ background: "rgba(230,48,0,.15)", borderBottom: "1px solid rgba(230,48,0,.35)", padding: "3px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 8, color: C.red, fontWeight: 700, letterSpacing: "0.1em" }}>TMI SOFT LAUNCH</div>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,.5)" }}>Founding member · All purchases persist permanently</div>
        <Link href="/subscribe" style={{ fontSize: 8, color: C.gold, fontWeight: 700, textDecoration: "none" }}>JOIN FREE →</Link>
      </div>

      {/* ── Magazine header ── */}
      <div style={{ background: "linear-gradient(180deg,rgba(255,45,170,.16) 0%,rgba(5,8,21,1) 100%)", padding: "16px 16px 12px", textAlign: "center" }}>
        {/* Status badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,45,170,.2)", border: "1px solid rgba(255,45,170,.6)", borderRadius: 4, padding: "4px 12px", animation: "tmiBadgePulse 2s ease-in-out infinite" }}>
            <span className="tmi-live-dot" />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: C.pink }}>VOTING LIVE</span>
          </div>
          <div style={{ background: "rgba(255,215,0,.15)", border: "1px solid rgba(255,215,0,.5)", borderRadius: 4, padding: "4px 14px", fontFamily: "'Orbitron',sans-serif", fontSize: 11, fontWeight: 700, color: C.gold, animation: "tmiVotePulse 3s ease-in-out infinite" }}>
            {voteCount.toLocaleString()} VOTES
          </div>
          <div style={{ background: "rgba(230,48,0,.2)", border: "1px solid rgba(230,48,0,.5)", borderRadius: 4, padding: "4px 12px", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: C.red }}>
            CROWN UPDATING
          </div>
        </div>

        {/* THE MUSICIAN'S INDEX — per-letter color typewriter */}
        <div style={{ fontFamily: "'Anton',sans-serif", fontSize: "clamp(36px,8vw,60px)", lineHeight: 1, letterSpacing: "0.02em", marginBottom: 4 }}>
          {"THE".split("").map((ch, i) => (
            <span key={`t${i}`} className="tmi-twl" style={{ animationDelay: `${i * 0.08}s` }}>{ch}</span>
          ))}
          <br />
          {"MUSICIAN'S".split("").map((ch, i) => (
            <span key={`m${i}`} className="tmi-twl" style={{ animationDelay: `${(i + 3) * 0.08}s` }}>{ch}</span>
          ))}
          <br />
          {"INDEX".split("").map((ch, i) => (
            <span key={`x${i}`} className="tmi-twl" style={{ animationDelay: `${(i + 13) * 0.08}s` }}>{ch}</span>
          ))}
        </div>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,.3)", letterSpacing: "0.2em", marginBottom: 12 }}>THE WORLD IS LIVE · MUSIC · MAGAZINE · BATTLES · CYPHERS</div>

        {/* Challenge banner */}
        <div style={{ background: "rgba(123,0,255,.2)", border: "1px solid rgba(123,0,255,.45)", borderRadius: 6, padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, cursor: "pointer" }}>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>◀</span>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: "0.08em", animation: "tmiChallengeBounce 2s ease-in-out infinite" }}>CHALLENGE YOUR SONG HERE</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,.4)" }}>SONG FOR SONG · WORK FOR WORK · VIDEO FOR VIDEO</div>
          </div>
          <Link href="/challenge" style={{ fontSize: 9, fontWeight: 700, color: C.cyan, textDecoration: "none", letterSpacing: "0.08em" }}>START NOW →</Link>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
          <Link href="/auth/signup" style={{ fontWeight: 800, cursor: "pointer", borderRadius: 5, padding: "7px 16px", border: "1px solid rgba(0,255,127,.4)", background: "rgba(0,255,127,.15)", color: C.green, fontSize: 11, textDecoration: "none", letterSpacing: "0.05em" }}>JOIN FREE</Link>
          <Link href="/auth/signin" style={{ fontWeight: 800, cursor: "pointer", borderRadius: 5, padding: "7px 16px", border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.8)", fontSize: 11, textDecoration: "none" }}>LOGIN</Link>
          <Link href="/challenge" style={{ fontWeight: 800, cursor: "pointer", borderRadius: 5, padding: "7px 16px", border: `1px solid rgba(255,215,0,.4)`, background: "rgba(255,215,0,.15)", color: C.gold, fontSize: 11, textDecoration: "none" }}>CHALLENGE SONG</Link>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
          <Link href="/cypher" style={{ fontWeight: 800, cursor: "pointer", borderRadius: 5, padding: "7px 14px", border: `1px solid rgba(0,229,255,.4)`, background: "rgba(0,229,255,.15)", color: C.cyan, fontSize: 11, textDecoration: "none" }}>CYPHER ARENA</Link>
          <Link href="/magazine" style={{ fontWeight: 800, cursor: "pointer", borderRadius: 5, padding: "7px 14px", border: `1px solid rgba(255,45,170,.4)`, background: "rgba(255,45,170,.15)", color: C.pink, fontSize: 11, textDecoration: "none" }}>MAGAZINE</Link>
          <Link href="/hub/sponsor" style={{ fontWeight: 800, cursor: "pointer", borderRadius: 5, padding: "7px 14px", border: "1px solid rgba(155,89,182,.4)", background: "rgba(155,89,182,.15)", color: "#9B59B6", fontSize: 11, textDecoration: "none" }}>SPONSOR</Link>
          <Link href="/hub/advertiser" style={{ fontWeight: 800, cursor: "pointer", borderRadius: 5, padding: "7px 14px", border: `1px solid rgba(230,48,0,.4)`, background: "rgba(230,48,0,.15)", color: C.red, fontSize: 11, textDecoration: "none" }}>ADVERTISE</Link>
        </div>
      </div>

      {/* ── ORBITAL + UNDERLAY SECTION (full-screen width) ── */}
      <div style={{ position: "relative", overflow: "hidden", width: "100%" }}>

        {/* Direction controls */}
        <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", zIndex: 20, display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={() => setScrollDir("right")} style={{ background: scrollDir === "right" ? C.gold : "rgba(255,215,0,.2)", color: scrollDir === "right" ? "#000" : C.gold, border: `1px solid rgba(255,215,0,.4)`, borderRadius: 5, padding: "3px 10px", fontSize: 9, fontWeight: 800, cursor: "pointer", letterSpacing: "0.05em" }}>◀ SCROLL</button>
          <span style={{ fontSize: 7, color: "rgba(255,255,255,.3)" }}>UNDERLAY</span>
          <button onClick={() => setScrollDir("left")} style={{ background: scrollDir === "left" ? C.gold : "rgba(255,215,0,.2)", color: scrollDir === "left" ? "#000" : C.gold, border: `1px solid rgba(255,215,0,.4)`, borderRadius: 5, padding: "3px 10px", fontSize: 9, fontWeight: 800, cursor: "pointer", letterSpacing: "0.05em" }}>SCROLL ▶</button>
        </div>

        {/* ── SCROLLING TABLOID UNDERLAY (full viewport width) ── */}
        <div style={{ overflow: "hidden", position: "relative", height: 420, width: "100%", background: C.bg }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", overflow: "hidden" }}>
            <div
              className={scrollDir === "left" ? "tmi-underlay-left" : "tmi-underlay-right"}
              style={{ display: "flex", whiteSpace: "nowrap", gap: 0, opacity: 0.88 }}
            >
              {/* 3× the panels for seamless loop */}
              {[...MAG_PANELS, ...MAG_PANELS, ...MAG_PANELS].map((p, i) => (
                <Link
                  key={`${p.id}-${i}`}
                  href={p.href}
                  style={{ display: "inline-flex", flexDirection: "column", width: 280, flexShrink: 0, border: "3px solid #000", overflow: "hidden", verticalAlign: "top", textDecoration: "none" }}
                >
                  <div style={{ background: p.headerBg, padding: "8px 12px" }}>
                    <div style={{ fontSize: 7, color: p.headerBg === "#000" ? p.footerColor : "rgba(0,0,0,.6)", fontWeight: 700 }}>{p.headerText}</div>
                  </div>
                  <div style={{ background: p.bg, padding: "12px 12px", flex: 1 }}>
                    <div style={{ fontFamily: "'Anton',sans-serif", fontSize: 30, color: p.headlineColor, lineHeight: 1, marginBottom: 8 }}>{p.headline}</div>
                    <div style={{ background: p.subjectBg, padding: "7px 10px", marginBottom: 6 }}>
                      <div style={{ fontFamily: "'Anton',sans-serif", fontSize: 18, color: p.subjectColor }}>{p.subject}</div>
                    </div>
                    <div style={{ background: p.detailBg, padding: "5px 8px", fontSize: 7, color: p.detailColor, marginBottom: 6 }}>{p.detail}</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {p.tags.map((t, ti) => (
                        <div key={ti} style={{ background: t.bg, padding: "3px 8px", fontSize: 7, fontWeight: 800, color: t.color }}>{t.label}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: p.footerBg, borderTop: `2px solid #000`, padding: "5px 12px", fontSize: 7, color: p.footerColor, fontWeight: 700 }}>{p.footer}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Vignette overlay — lets orbital read cleanly */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,rgba(5,8,21,.85) 0%,rgba(5,8,21,.15) 18%,rgba(5,8,21,.15) 82%,rgba(5,8,21,.85) 100%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 65% 85% at center,transparent 28%,rgba(5,8,21,.88) 100%)", pointerEvents: "none" }} />

          {/* ── ORBITAL WHEEL (floats above underlay) ── */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ position: "relative", width: 380, height: 380 }}>
              <svg viewBox="0 0 380 380" width="380" height="380" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
                <circle cx="190" cy="190" r="174" fill="none" stroke="rgba(255,215,0,.1)" strokeWidth="1" />
                <circle cx="190" cy="190" r="155" fill="none" stroke="rgba(255,45,170,.13)" strokeWidth=".8" strokeDasharray="5 9" />
                <circle cx="190" cy="190" r="105" fill="none" stroke="rgba(0,229,255,.1)" strokeWidth=".6" strokeDasharray="3 12" />
                {[0,45,90,135,180,225,270,315].map(deg => {
                  const rad = deg * Math.PI / 180;
                  return <line key={deg} x1={190 + 85*Math.cos(rad)} y1={190 + 85*Math.sin(rad)} x2={190 + 174*Math.cos(rad)} y2={190 + 174*Math.sin(rad)} stroke="rgba(255,215,0,.08)" strokeWidth=".5" />;
                })}
                <circle cx="190" cy="190" r="72" fill="rgba(5,8,21,.94)" stroke="rgba(0,229,255,.5)" strokeWidth="1.5" />
                <circle cx="190" cy="190" r="68" fill="none" stroke="rgba(255,215,0,.15)" strokeWidth=".5" />
              </svg>

              {/* Orbit ring (nodes) — pointerEvents re-enabled */}
              <div className="tmi-orbit-ring" style={{ position: "absolute", inset: 0, transformOrigin: "190px 190px", pointerEvents: "all" }}>
                {ORBIT_NODES.map((node, i) => {
                  const pos = orbitPos(i, ORBIT_NODES.length);
                  return (
                    <div
                      key={node.slug}
                      className="tmi-node-counter"
                      style={{ position: "absolute", left: pos.x - 42, top: pos.y - 22, transformOrigin: `${190 - pos.x + 42}px ${190 - pos.y + 22}px`, cursor: "pointer", pointerEvents: "all" }}
                      onClick={() => setExpandedNode(node)}
                    >
                      <div style={{ background: `${node.color}20`, border: `1.5px solid ${node.color}`, borderRadius: 6, padding: "4px 7px", textAlign: "center", minWidth: 80, transition: "all 0.15s" }}>
                        <div style={{ fontSize: 7, color: node.color, fontWeight: 800 }}>#{node.rank} {node.live && <span className="tmi-live-dot" style={{ width: 5, height: 5 }} />}</div>
                        <div style={{ fontSize: 8, fontWeight: 800, color: "#fff" }}>{node.name}</div>
                        <div style={{ fontSize: 6, color: "rgba(255,255,255,.45)" }}>{node.genre}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Center hub */}
              <div className="tmi-center-hub" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 136, height: 136, borderRadius: "50%", background: "rgba(5,8,21,.96)", border: "2px solid rgba(0,229,255,.6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", cursor: "pointer", pointerEvents: "all", zIndex: 10 }} onClick={() => setExpandedNode(centerNode)}>
                <div style={{ fontSize: 7, color: "rgba(255,255,255,.3)", letterSpacing: "0.12em", marginBottom: 2 }}>HOME 1/{ORBIT_NODES.length}</div>
                <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 10, fontWeight: 900, color: centerNode.color, lineHeight: 1.3, marginBottom: 2 }}>{centerNode.name.toUpperCase()}</div>
                <div style={{ fontSize: 7, color: "rgba(255,255,255,.45)" }}>{centerNode.genre}</div>
                {centerNode.live && <span className="tmi-live-dot" style={{ margin: "4px 0 0" }} />}
              </div>
            </div>
          </div>

          {/* Orbit title overlay */}
          <div style={{ position: "absolute", top: 34, left: 0, right: 0, textAlign: "center", pointerEvents: "none" }}>
            <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 13, fontWeight: 900, color: C.gold, letterSpacing: "0.08em", textShadow: `0 0 20px rgba(255,215,0,.6)` }}>WEEKLY CROWN ORBIT</div>
            <div style={{ fontSize: 7, color: "rgba(255,255,255,.3)", letterSpacing: "0.15em", marginTop: 2 }}>TOP RANKED · LIVE NOW · UPDATED IN REAL TIME</div>
          </div>

          {/* BACK / NEXT arrows */}
          <button onClick={() => setCenterIdx(i => (i - 1 + ORBIT_NODES.length) % ORBIT_NODES.length)} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,.6)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", padding: "8px 12px", borderRadius: 20, cursor: "pointer", fontSize: 12, zIndex: 20 }}>◀ BACK</button>
          <button onClick={() => setCenterIdx(i => (i + 1) % ORBIT_NODES.length)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,.6)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", padding: "8px 12px", borderRadius: 20, cursor: "pointer", fontSize: 12, zIndex: 20 }}>NEXT ▶</button>
        </div>
      </div>

      {/* Expanded lobby modal */}
      {expandedNode && <LobbyModal node={expandedNode} onClose={() => setExpandedNode(null)} />}
    </>
  );
}
