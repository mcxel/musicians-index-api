import Link from "next/link";

export default function AdminMemoryPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "30px 20px" }}>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        <Link href="/admin" style={{ color: "#00FFFF", textDecoration: "none", fontSize: 12 }}>← Admin</Link>
        <h1 style={{ fontSize: 32, margin: "14px 0 10px" }}>Memory Systems</h1>
        <p style={{ color: "rgba(255,255,255,0.62)" }}>Memory pipeline observability for events, profiles, and ticket snapshots.</p>

        <div style={{ marginTop: 18, border: "1px solid rgba(255,255,255,0.16)", borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 10, color: "#AA2DFF", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.12em" }}>Big Ace Visibility</div>
          <div style={{ fontSize: 13, color: "#fff" }}>Live snapshot count: 128 · Shared moments: 47 · Failed sync: 0</div>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/memories" style={{ color: "#FFD700", textDecoration: "none", fontSize: 12 }}>Open User Memories</Link>
          <Link href="/admin/tasks" style={{ color: "#00FF88", textDecoration: "none", fontSize: 12 }}>Task System</Link>
        </div>
      </div>
    </main>
  );
}
