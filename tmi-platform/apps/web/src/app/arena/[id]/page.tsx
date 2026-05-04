import { Suspense } from "react";
import Link from "next/link";
import PresenceBar from "@/components/live/PresenceBar";

export default function ArenaPage({ params }: { params: { id: string } }) {
  return (
    <main data-testid="arena-page" style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20 }}>
      <Link href="/home/3" style={{ color: "#93c5fd", textDecoration: "none", fontSize: 13 }}>← Back to Live</Link>
      <h1 style={{ margin: "10px 0 4px" }}>Arena · {params.id}</h1>
      <Suspense fallback={<div style={{ height: 48, borderRadius: 10, background: "rgba(148,163,184,0.07)" }} />}>
        <PresenceBar roomId={`arena-${params.id}`} />
      </Suspense>
      <div style={{ marginTop: 20, display: "grid", gap: 10, maxWidth: 800 }}>
        <div style={{ border: "1px solid rgba(148,163,184,0.2)", borderRadius: 12, padding: 16 }}>
          <h2 style={{ marginTop: 0, color: "#a5f3fc", fontSize: 14 }}>Active Events in Arena</h2>
          {["Main Stage", "Cypher Ring", "Side Stage"].map((zone) => (
            <div key={zone} style={{ padding: "8px 0", borderBottom: "1px solid rgba(148,163,184,0.08)", fontSize: 13, color: "#cbd5e1" }}>{zone}</div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link data-testid="arena-to-battles" href="/battles/main" style={linkBtn}>Enter Battle →</Link>
          <Link data-testid="arena-to-concerts" href="/concerts/main" style={linkBtn}>Concert →</Link>
          <Link data-testid="arena-to-games" href="/games/name-that-tune" style={linkBtn}>Games →</Link>
        </div>
      </div>
    </main>
  );
}

const linkBtn: React.CSSProperties = {
  border: "1px solid rgba(45,212,191,0.3)",
  borderRadius: 8,
  background: "rgba(13,148,136,0.14)",
  color: "#ccfbf1",
  textDecoration: "none",
  padding: "8px 12px",
  fontSize: 12,
};
