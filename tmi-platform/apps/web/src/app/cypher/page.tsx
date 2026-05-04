import Link from "next/link";
import JuliusHudDock from "@/components/julius/JuliusHudDock";

export const metadata = { title: "Monday Cypher | TMI", description: "The most competitive freestyle session in music. 90-second bars. Real-time judging. Live every Monday 8PM." };

const SCHEDULE = [
  { time: "7:30 PM", event: "Lobby Opens",         icon: "🚪", status: "pre"    },
  { time: "8:00 PM", event: "Cypher Begins",        icon: "🎙️", status: "main"   },
  { time: "8:00–9:30", event: "Open Rounds",        icon: "🔥", status: "main"   },
  { time: "9:30 PM", event: "Judge Scores Released",icon: "⚖️", status: "main"   },
  { time: "10:00 PM", event: "Top 3 Announced",     icon: "🏆", status: "finale" },
  { time: "10:15 PM", event: "Prize Distribution",  icon: "🎁", status: "finale" },
];

const RULES = [
  "90-second freestyle per round — no hooks, no repeated bars",
  "All genres welcome — rap, sung, hybrid",
  "No pre-written lyrics (honor system, judges decide)",
  "Top 3 earn XP bonus + homepage feature slot",
  "Monthly winners qualify for Grand Contest",
  "Bots are clearly labeled and judge-ineligible",
];

const PAST_WINNERS = [
  { name: "Wavetek",    category: "Rap",      week: "April 14",  icon: "🎤", xp: "+500 XP" },
  { name: "Krypt",      category: "Rap",      week: "April 7",   icon: "🎙️", xp: "+500 XP" },
  { name: "Zuri Bloom", category: "Hybrid",   week: "March 31",  icon: "✨", xp: "+500 XP" },
];

export default function CypherPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "72px 24px 56px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "radial-gradient(ellipse at top, rgba(255,45,170,0.07) 0%, transparent 70%)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800, marginBottom: 12 }}>EVERY MONDAY — 8PM</div>
        <h1 style={{ fontSize: "clamp(2rem,6vw,4rem)", fontWeight: 900, letterSpacing: -1, lineHeight: 1.1, marginBottom: 14 }}>MONDAY CYPHER</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", maxWidth: 500, margin: "0 auto 28px", lineHeight: 1.6 }}>
          90 seconds. No hooks. No repeats. Just bars. The most competitive freestyle session in music — live every Monday night.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/lobbies/monday-cypher" aria-label="Enter Monday Cypher room"
            style={{ padding: "12px 30px", fontSize: 10, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)", borderRadius: 8, textDecoration: "none" }}>
            ENTER THE CYPHER →
          </Link>
          <Link href="/live-schedule"
            style={{ padding: "12px 22px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#fff", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, textDecoration: "none" }}>
            FULL SCHEDULE
          </Link>
        </div>
      </section>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <section>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FF2DAA", fontWeight: 800, marginBottom: 20 }}>TONIGHT'S SCHEDULE</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {SCHEDULE.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: s.status === "main" ? "#fff" : "rgba(255,255,255,0.5)" }}>{s.event}</div>
                </div>
                <span style={{ fontSize: 9, color: s.status === "main" ? "#FF2DAA" : "rgba(255,255,255,0.25)", fontWeight: 700 }}>{s.time}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 20 }}>RULES</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {RULES.map((rule, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "#FF2DAA", fontWeight: 900, flexShrink: 0, marginTop: 1 }}>→</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>{rule}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 0" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 20 }}>RECENT WINNERS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PAST_WINNERS.map((w, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 18px" }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{w.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{w.name}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{w.category} — Week of {w.week}</div>
              </div>
              <span style={{ fontSize: 9, fontWeight: 800, color: "#FFD700" }}>{w.xp}</span>
            </div>
          ))}
        </div>
      </section>
      <JuliusHudDock surface="cypher" />
    </main>
  );
}

