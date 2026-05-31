import Link from "next/link";
import ArenaEventShell from "@/components/live/ArenaEventShell";

const DISCIPLINE_META: Record<string, { label: string; emoji: string; color: string; desc: string }> = {
  dance:    { label: "Dance Challenge",      emoji: "💃", color: "#FF2DAA", desc: "Freestyle, crew battles, and solo showcases on the outdoor stage." },
  rap:      { label: "Rap Challenge",        emoji: "🎤", color: "#AA2DFF", desc: "Drop bars, battle for the mic, and earn crowd votes in the cypher." },
  singing:  { label: "Singing Challenge",    emoji: "🎵", color: "#00FFFF", desc: "Vocal showdowns, harmony battles, and live arrangements." },
  beat:     { label: "Beat Battle",          emoji: "🎛️", color: "#FFD700", desc: "Producer head-to-head. Best beat wins. 60 seconds on the clock." },
  comedy:   { label: "Comedy Challenge",     emoji: "😂", color: "#00FF88", desc: "Open mic comedy sets. Crowd reaction decides the winner." },
  spoken:   { label: "Spoken Word",          emoji: "📜", color: "#FF9500", desc: "Poetry, spoken word, and storytelling on the open stage." },
};

function getMeta(discipline: string) {
  return DISCIPLINE_META[discipline.toLowerCase()] ?? {
    label: `${discipline.charAt(0).toUpperCase()}${discipline.slice(1)} Challenge`,
    emoji: "🏆",
    color: "#00FFFF",
    desc: "Live challenge event — join the arena and compete.",
  };
}

export default function ChallengeDisciplinePage({ params }: { params: { discipline: string } }) {
  const { discipline } = params;
  const meta = getMeta(discipline);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 20px",
        background: "rgba(0,0,0,0.85)", borderBottom: `1px solid ${meta.color}22`,
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <Link href="/challenges" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none", letterSpacing: "0.1em" }}>
          ← CHALLENGES
        </Link>
        <span style={{ fontSize: 14 }}>{meta.emoji}</span>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.22em", color: meta.color }}>
          {meta.label.toUpperCase()}
        </div>
      </div>

      {/* Hero strip */}
      <div style={{
        padding: "28px 20px 20px",
        background: `radial-gradient(ellipse at top, ${meta.color}10 0%, transparent 60%)`,
        borderBottom: `1px solid ${meta.color}18`,
        maxWidth: 860, margin: "0 auto",
      }}>
        <div style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, marginBottom: 8 }}>
          {meta.emoji} {meta.label}
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 560, margin: "0 0 20px" }}>
          {meta.desc}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href={`/challenges?discipline=${discipline}`} style={{
            padding: "10px 24px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em",
            color: "#050510", background: meta.color, borderRadius: 8, textDecoration: "none",
          }}>
            BROWSE {meta.label.toUpperCase()} →
          </Link>
          <Link href="/challenges/create" style={{
            padding: "10px 20px", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em",
            color: meta.color, border: `1px solid ${meta.color}44`, borderRadius: 8, textDecoration: "none",
          }}>
            + CREATE CHALLENGE
          </Link>
        </div>
      </div>

      {/* 3D Arena — Outdoor venue for challenge stage */}
      <ArenaEventShell
        roomId={`challenge-${discipline}`}
        eventType="challenge"
        mode="audience"
      />
    </main>
  );
}
