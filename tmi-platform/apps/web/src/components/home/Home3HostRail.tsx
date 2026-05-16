"use client";

import Link from "next/link";

const HOSTS = [
  { id: "aria-vox", name: "Aria Vox", state: "Featured" },
  { id: "milo-crown", name: "Milo Crown", state: "Current" },
  { id: "rune-pulse", name: "Rune Pulse", state: "Hosts" },
];

export default function Home3HostRail() {
  return (
    <section style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px 30px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#ffd700", fontWeight: 800, marginBottom: 14 }}>
        HOST RAIL
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
        {HOSTS.map((host) => (
          <Link
            key={host.id}
            href={`/hosts/hosts/${host.id}`}
            style={{
              textDecoration: "none",
              color: "white",
              borderRadius: 10,
              border: "1px solid rgba(255,215,0,0.35)",
              background: "rgba(255,215,0,0.08)",
              padding: "10px 12px",
              display: "grid",
              gap: 4,
            }}
          >
            <strong style={{ fontSize: 12 }}>{host.name}</strong>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.78)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{host.state}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}