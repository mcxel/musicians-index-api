import Link from "next/link";

interface Props { params: { id: string } }

function titleFromId(id: string) {
  const h = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const titles = [
    "Nova Cipher — 8-Win Cypher Highlight",
    "FlowState.J — Season 2 Battle KO",
    "Ari Volt — Live Set Breakdown",
    "BeatLab Session 14 — Best Moments",
    "Yung Mako — Freestyle Drop S2",
    "Season 2 Finals — Best Performances",
  ];
  return titles[h % titles.length]!;
}

export default function ClipDetailPage({ params }: Props) {
  const title = titleFromId(params.id);

  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>

      <div style={{ padding: "20px 24px 0", display: "flex", gap: 16 }}>
        <Link href="/clips" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← CLIPS</Link>
        <Link href="/shows" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.2)", textDecoration: "none" }}>SHOWS</Link>
      </div>

      <div style={{ maxWidth: 900, margin: "24px auto", padding: "0 24px" }}>

        {/* Video player */}
        <div style={{
          width: "100%", aspectRatio: "16/9", background: "#0a0a1a",
          border: "1px solid rgba(0,255,255,0.2)", borderRadius: 16,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#00FFFF", marginBottom: 6 }}>Clip Player</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>TMI Clip #{params.id}</div>
        </div>

        {/* Info */}
        <h1 style={{ fontSize: "clamp(18px,3vw,28px)", fontWeight: 900, margin: "0 0 10px" }}>{title}</h1>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
          <span style={{ fontSize: 11, color: "#00FFFF" }}>🎤 TMI Artist</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>1.2M views</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>0:58</span>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/clips" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "#00FFFF", color: "#060410", textDecoration: "none" }}>
            More Clips →
          </Link>
          <Link href="/shows" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
            Live Shows
          </Link>
        </div>
      </div>
    </main>
  );
}
