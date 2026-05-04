export default function ArenaLoading() {
  return (
    <main style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20 }}>
      <div style={{ maxWidth: 800, margin: "0 auto", display: "grid", gap: 12 }}>
        <div style={{ height: 18, width: 120, borderRadius: 6, background: "rgba(148,163,184,0.12)" }} />
        <div style={{ height: 28, width: 260, borderRadius: 6, background: "rgba(148,163,184,0.12)" }} />
        <div style={{ height: 48, borderRadius: 10, background: "rgba(148,163,184,0.07)" }} />
        <div style={{ border: "1px solid rgba(148,163,184,0.15)", borderRadius: 12, padding: 16, display: "grid", gap: 10 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`arena-skel-${i}`} style={{ height: 22, borderRadius: 6, background: "rgba(148,163,184,0.08)" }} />
          ))}
        </div>
      </div>
    </main>
  );
}
