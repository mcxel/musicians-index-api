"use client";

import Link from "next/link";
import HomeFeedObserver from "@/components/admin/HomeFeedObserver";

export default function AdminSimulationPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#090912", color: "#fff", padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Simulation Control</h1>
      <p style={{ opacity: 0.78 }}>Sandbox-only monitoring surface for synthetic users, feeds, and live wiring.</p>
      <div style={{ marginBottom: 14 }}>
        <Link href="/admin" style={{ color: "#facc15", textDecoration: "none" }}>← Back to Overseer Deck</Link>
      </div>
      <HomeFeedObserver title="Simulation Feed Observer" />
      <section style={{
        marginTop: 14,
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: 12,
        padding: 14,
        background: "rgba(255,255,255,0.03)",
      }}>
        <h2 style={{ marginTop: 0 }}>Sandbox Guardrails</h2>
        <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.85 }}>
          <li>TEST mode accounts only</li>
          <li>No live-money execution</li>
          <li>Route + feed checks every cycle</li>
        </ul>
      </section>
    </main>
  );
}
