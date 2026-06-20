import Link from "next/link";
import type { Metadata } from "next";
import JuliusHudDock from "@/components/julius/JuliusHudDock";
import MonetizationRail from "@/components/monetization/MonetizationRail";
import ArenaEventShell from "@/components/live/ArenaEventShell";
import { battleBillboardLobbyWallEngine } from "@/lib/competition/BattleBillboardLobbyWallEngine";

export const metadata: Metadata = {
  title: "Battles | TMI",
  description: "Live battles on The Musician's Index — 1v1 rap, freestyle, and mini-battles. Watch, vote, and win.",
};

// Real format reference — names/descriptions only, no fabricated viewer
// counts, no fake "LIVE" claim, not clickable into a fake room. The actual
// LIVE/UPCOMING/PAST sections below come from the real (currently empty
// pre-launch) battleBillboardLobbyWallEngine instead of a hardcoded catalog
// that previously claimed "14,200 viewers" on a fictional matchup (Rule 20).
const BATTLE_FORMATS = [
  { type: "1v1 RAP", description: "Head-to-head bars, crowd-judged.", color: "#FF2DAA" },
  { type: "FREESTYLE", description: "No prep, no script — pure improvisation.", color: "#FFD700" },
  { type: "MINI-BATTLE", description: "Quick-fire 60-second rounds.", color: "#00FFFF" },
];

export default function BattlesPage() {
  const cards = battleBillboardLobbyWallEngine.getCards();
  const live = cards.filter(c => c.status === "live");
  const upcoming = cards.filter(c => c.status === "accepted");
  const ended = cards.filter(c => c.status === "completed");

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      {/* Arena system header — Battle Arena (venueIndex 1, 18,500 cap) */}
      <ArenaEventShell eventType="battle" roomId="battles-hub" watcherCount={live.length} />

      <section style={{ textAlign: "center", padding: "64px 24px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800, marginBottom: 12 }}>
          TMI BATTLES
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,5vw,3.2rem)", fontWeight: 900, marginBottom: 12 }}>
          Battles
        </h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 460, margin: "0 auto 24px", lineHeight: 1.6 }}>
          1v1 rap battles, freestyle showdowns, and mini-battles. The crowd votes. The winner takes the prize.
        </p>
        <MonetizationRail
          target={{}}
          actions={["ticket", "season-pass", "subscribe"]}
          heading="BATTLE ECONOMY"
          layout="row"
        />
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 16 }}>
          <Link href="/battles/create" style={{ padding: "9px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "#FF2DAA", borderRadius: 8, textDecoration: "none" }}>
            ⚔️ CREATE BATTLE
          </Link>
          <Link href="/battles/categories" style={{ padding: "9px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.35)", borderRadius: 8, textDecoration: "none" }}>
            ALL CATEGORIES
          </Link>
          <Link href="/battles/formats" style={{ padding: "9px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "#AA2DFF", border: "1px solid rgba(170,45,255,0.35)", borderRadius: 8, textDecoration: "none" }}>
            FORMAT GUIDE
          </Link>
          <Link href="/cyphers" style={{ padding: "9px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, textDecoration: "none" }}>
            CYPHER
          </Link>
          <Link href="/dirty-dozens" style={{ padding: "9px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, textDecoration: "none" }}>
            DIRTY DOZENS
          </Link>
        </div>
      </section>

      <section style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FF88", fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00FF88", display: "inline-block", boxShadow: "0 0 8px #00FF88" }} />
            LIVE NOW
          </div>
          {live.length === 0 && (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>No live battles right now.</p>
          )}
          {live.map(card => (
            <Link key={card.battleId} href={card.route} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.25)", borderRadius: 16, padding: "24px 28px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
                <span style={{ fontSize: 32 }}>⚔️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#00FF88", letterSpacing: "0.15em", marginBottom: 4 }}>🔴 LIVE</div>
                  <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>{card.challengerName} vs {card.targetName}</h2>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{card.formatLabel}</p>
                </div>
                <div style={{ padding: "9px 20px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "#00FF88", borderRadius: 8 }}>
                  WATCH &amp; VOTE
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 800, marginBottom: 20 }}>UPCOMING</div>
          {upcoming.length === 0 && (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>No upcoming battles scheduled.</p>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
            {upcoming.map(card => (
              <Link key={card.battleId} href={card.route} style={{ textDecoration: "none", color: "inherit" }}>
                <article style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,255,255,0.18)", borderRadius: 12, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                    <span style={{ fontSize: 24 }}>⚔️</span>
                    <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 4, padding: "3px 8px" }}>UPCOMING</span>
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>{card.challengerName} vs {card.targetName}</h3>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{card.formatLabel}</p>
                </article>
              </Link>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 16 }}>PAST BATTLES</div>
          {ended.length === 0 && (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>No completed battles yet.</p>
          )}
          {ended.map(card => (
            <Link key={card.battleId} href={card.route} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 18 }}>⚔️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{card.challengerName} vs {card.targetName}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{card.formatLabel}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Format reference — explicitly examples, never linked into a fake live room (Rule 20) */}
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 16 }}>BATTLE FORMATS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
            {BATTLE_FORMATS.map(f => (
              <div key={f.type} style={{ border: `1px solid ${f.color}22`, borderRadius: 10, padding: "14px 16px", background: `${f.color}06` }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: f.color, marginBottom: 4 }}>{f.type}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{f.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <JuliusHudDock surface="battle" />
    </main>
  );
}
