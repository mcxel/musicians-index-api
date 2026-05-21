import Link from "next/link";

interface Props { params: { id: string } }

function titleCase(s: string) {
  return s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function seedContest(id: string) {
  const h = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const types = ["Battle Rap", "Freestyle", "Cypher", "Song Contest", "Beat Battle"];
  const statuses = ["live", "upcoming", "ended"] as const;
  const accents = ["#00FFFF", "#FF2DAA", "#AA2DFF", "#FFD700", "#22c55e"];
  return {
    title: titleCase(id),
    type: types[h % types.length]!,
    status: statuses[h % 3]!,
    accent: accents[h % accents.length]!,
    prizePool: `$${1000 + (h % 9000)}`,
    entrants: 8 + (h % 24),
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  live:     { label: "🔴 LIVE",   color: "#ef4444" },
  upcoming: { label: "⏳ SOON",   color: "#f59e0b" },
  ended:    { label: "✅ ENDED",  color: "#6b7280" },
};

export default function ContestDetailPage({ params }: Props) {
  const contest = seedContest(params.id);
  const statusCfg = STATUS_CONFIG[contest.status]!;

  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>

      <div style={{ padding: "20px 24px 0", display: "flex", gap: 16 }}>
        <Link href="/contests" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← CONTESTS</Link>
        <Link href="/battles" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.2)", textDecoration: "none" }}>BATTLES</Link>
      </div>

      <div style={{ padding: "28px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.16em", color: statusCfg.color, background: `${statusCfg.color}18`, border: `1px solid ${statusCfg.color}44`, borderRadius: 4, padding: "2px 8px" }}>
              {statusCfg.label}
            </span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{contest.type}</span>
          </div>
          <h1 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 900, margin: "0 0 10px" }}>{contest.title}</h1>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: contest.accent, fontWeight: 700 }}>💰 {contest.prizePool} Prize Pool</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{contest.entrants} entrants</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "28px auto", padding: "0 24px" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32 }}>
          {contest.status !== "ended" && (
            <Link href={`/battles`} style={{ padding: "11px 24px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: contest.accent, color: "#060410", textDecoration: "none" }}>
              {contest.status === "live" ? "Enter Now →" : "Register →"}
            </Link>
          )}
          <Link href="/contests" style={{ padding: "11px 24px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
            All Contests
          </Link>
          <Link href="/hub/fan" style={{ padding: "11px 24px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
            Fan Hub
          </Link>
        </div>
      </div>
    </main>
  );
}
