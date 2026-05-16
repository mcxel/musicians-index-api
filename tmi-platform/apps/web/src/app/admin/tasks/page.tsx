import Link from "next/link";

const TASKS = [
  { id: "t-1", owner: "big-ace", text: "Route closure pass on social loop", done: true },
  { id: "t-2", owner: "big-ace", text: "Memory bridge to profile and venue", done: true },
  { id: "t-3", owner: "ops", text: "Commerce ticket print and validate loop", done: false },
];

export default function AdminTasksPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "30px 20px" }}>
      <div style={{ maxWidth: 940, margin: "0 auto" }}>
        <Link href="/admin" style={{ color: "#00FFFF", textDecoration: "none", fontSize: 12 }}>← Admin</Link>
        <h1 style={{ fontSize: 32, margin: "14px 0 10px" }}>Task Systems</h1>
        <p style={{ color: "rgba(255,255,255,0.62)" }}>Big Ace and operations task board for loop completion.</p>

        <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
          {TASKS.map((entry) => (
            <div key={entry.id} style={{ border: "1px solid rgba(255,255,255,0.16)", borderRadius: 10, padding: "10px 12px", background: "rgba(255,255,255,0.03)" }}>
              <div style={{ fontSize: 10, color: "#00FFFF", textTransform: "uppercase" }}>{entry.owner}</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>{entry.text}</div>
              <div style={{ fontSize: 11, marginTop: 4, color: entry.done ? "#00FF88" : "#FFD700" }}>{entry.done ? "Complete" : "In Progress"}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
