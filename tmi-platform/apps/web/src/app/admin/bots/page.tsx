"use client";

/**
 * Admin Bots Hub — Rule 20: no fabricated RUNNING/jobsToday roster.
 * Live telemetry lives on Bot Live Observer.
 */

import Link from "next/link";

const LINKS = [
  { href: "/admin/bots/observe", label: "Bot Live Observer", desc: "POV switcher · soft-launch + duty telemetry", color: "#FF2DAA" },
  { href: "/admin/bots/roster", label: "Roster", desc: "Duty registry surfaces", color: "#00FFFF" },
  { href: "/admin/bots/tasks", label: "Tasks", desc: "Bot task board", color: "#FFD700" },
  { href: "/admin/bots/governance", label: "Governance", desc: "Safety + policy", color: "#AA2DFF" },
  { href: "/admin/runtime-check", label: "Runtime Check", desc: "Certification health", color: "#00FF88" },
];

export default function AdminBotsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "28px 22px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <Link href="/admin" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        <div style={{ fontSize: 10, letterSpacing: "0.28em", color: "#FF2DAA", fontWeight: 800, marginTop: 16 }}>ADMIN · BOTS</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "8px 0 8px" }}>Bot Operations</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 28, maxWidth: 560, lineHeight: 1.5 }}>
          Soft-launch bots activate via <code style={{ color: "#00FFFF" }}>activateSoftLaunchBots</code>. Watch real status and room POV on the Live Observer — no demo pulses.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                display: "block",
                padding: 16,
                borderRadius: 12,
                border: `1px solid ${l.color}40`,
                background: `${l.color}0c`,
                textDecoration: "none",
                color: "#fff",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 900, color: l.color, letterSpacing: "0.08em" }}>{l.label}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 6 }}>{l.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
