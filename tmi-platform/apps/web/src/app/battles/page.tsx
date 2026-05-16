import Link from "next/link";
import type { Metadata } from "next";
import JuliusHudDock from "@/components/julius/JuliusHudDock";
import MonetizationRail from "@/components/monetization/MonetizationRail";

export const metadata: Metadata = {
  title: "Battles | TMI",
  description: "Live battles on The Musician's Index — 1v1 rap, freestyle, and mini-battles. Watch, vote, and win.",
};

const BATTLES = [
  { id: "b1", title: "Wavetek vs Krypt",      type: "1v1 RAP",       status: "LIVE",     viewers: 14200, prize: "$500",  color: "#FF2DAA" },
  { id: "b2", title: "Bar God vs Verse Knight",type: "FREESTYLE",     status: "UPCOMING", viewers: 0,     prize: "$250",  color: "#FFD700" },
  { id: "b3", title: "Overdrive vs FlowMaster",type: "MINI-BATTLE",   status: "UPCOMING", viewers: 0,     prize: "$100",  color: "#00FFFF" },
  { id: "b4", title: "MC Phantom vs Cold Spark",type: "1v1 RAP",      status: "ENDED",    viewers: 9800,  prize: "$500",  color: "#AA2DFF", winner: "MC Phantom" },
  { id: "b5", title: "Zero Degrees vs Ace Villain",type: "FREESTYLE",  status: "ENDED",    viewers: 7400,  prize: "$250",  color: "#00FF88", winner: "Ace Villain" },
];

export default function BattlesPage() {
  const live = BATTLES.filter(b => b.status === "LIVE");
  const upcoming = BATTLES.filter(b => b.status === "UPCOMING");
  const ended = BATTLES.filter(b => b.status === "ENDED");

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
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
          <Link href="/cypher" style={{ padding: "9px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, textDecoration: "none" }}>
            MONDAY CYPHER
          </Link>
          <Link href="/dirty-dozens" style={{ padding: "9px 22px", fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 8, textDecoration: "none" }}>
            DIRTY DOZENS
          </Link>
        </div>
      </section>

      <section style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
        {live.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FF88", fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00FF88", display: "inline-block", boxShadow: "0 0 8px #00FF88" }} />
              LIVE NOW
            </div>
            {live.map(battle => (
              <Link key={battle.id} href={`/battles/${battle.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.25)", borderRadius: 16, padding: "24px 28px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
                  <span style={{ fontSize: 32 }}>⚔️</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: "#00FF88", letterSpacing: "0.15em", marginBottom: 4 }}>🔴 LIVE · {battle.viewers.toLocaleString()} watching</div>
                    <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 4 }}>{battle.title}</h2>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{battle.type} · Prize: {battle.prize}</p>
                  </div>
                  <div style={{ padding: "9px 20px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "#00FF88", borderRadius: 8 }}>
                    WATCH &amp; VOTE
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 800, marginBottom: 20 }}>UPCOMING</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
            {upcoming.map(battle => (
              <Link key={battle.id} href={`/battles/${battle.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <article style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${battle.color}18`, borderRadius: 12, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                    <span style={{ fontSize: 24 }}>⚔️</span>
                    <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 4, padding: "3px 8px" }}>UPCOMING</span>
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>{battle.title}</h3>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>{battle.type}</p>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#FFD700" }}>{battle.prize}</div>
                </article>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 16 }}>PAST BATTLES</div>
          {ended.map(battle => (
            <Link key={battle.id} href={`/battles/${battle.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 18 }}>⚔️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{battle.title}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{battle.type} · {battle.viewers.toLocaleString()} views</div>
                </div>
                {"winner" in battle && battle.winner && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 8, color: "#FFD700", letterSpacing: "0.1em", fontWeight: 700 }}>WINNER</div>
                    <div style={{ fontSize: 11, fontWeight: 800 }}>{battle.winner}</div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
      <JuliusHudDock surface="battle" />
    </main>
  );
}
