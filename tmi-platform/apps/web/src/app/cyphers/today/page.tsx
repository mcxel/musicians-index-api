import Link from "next/link";
import ArenaEventShell from "@/components/live/ArenaEventShell";
import { WhatsHappeningTodayEngine } from "@/lib/events/WhatsHappeningTodayEngine";

export default function CyphersTodayPage() {
  const cyphers = WhatsHappeningTodayEngine.listByType("cypher");

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 20px",
        background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(255,45,170,0.18)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <Link href="/cyphers" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none", letterSpacing: "0.1em" }}>
          ← CYPHERS
        </Link>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.28em", color: "#FF2DAA" }}>
          TODAY&apos;S CYPHERS
        </div>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF2020", marginLeft: "auto",
          animation: "tmiCypherBlink 1s step-end infinite", boxShadow: "0 0 6px #FF2020" }} />
        <style>{`@keyframes tmiCypherBlink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#FF2020" }}>LIVE</span>
      </div>

      {/* 3D Cypher arena — Theater venue, intimate circle */}
      <ArenaEventShell roomId="cypher-today" eventType="cypher" mode="audience" />

      {/* Live session cards */}
      {cyphers.length > 0 && (
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 0" }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.24em", color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>
            TODAY&apos;S SESSIONS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cyphers.map((event) => (
              <Link key={event.slug} href={`/events/${event.slug}`} style={{
                display: "block", padding: "14px 18px", textDecoration: "none", color: "inherit",
                background: "rgba(255,45,170,0.06)", border: "1px solid rgba(255,45,170,0.25)",
                borderRadius: 10,
              }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{event.title}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                  Join now →
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {cyphers.length === 0 && (
        <div style={{ maxWidth: 860, margin: "32px auto 0", padding: "0 20px", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
            No scheduled cyphers right now — check back tonight.
          </div>
          <Link href="/cyphers" style={{
            display: "inline-block", padding: "10px 28px", fontSize: 10, fontWeight: 800,
            letterSpacing: "0.14em", color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.4)",
            borderRadius: 20, textDecoration: "none",
          }}>
            Browse All Sessions →
          </Link>
        </div>
      )}
    </main>
  );
}
