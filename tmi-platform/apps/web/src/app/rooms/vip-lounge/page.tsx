import ArenaEventShell from "@/components/live/ArenaEventShell";
import Link from "next/link";

export default function VIPLoungePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 20px",
        background: "rgba(0,0,0,0.9)", borderBottom: "1px solid rgba(255,215,0,0.25)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <Link href="/rooms" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none", letterSpacing: "0.1em" }}>
          ← ROOMS
        </Link>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.28em", color: "#FFD700" }}>👑 VIP LOUNGE</div>
        <span style={{ marginLeft: "auto", fontSize: 9, color: "#FFD700", fontWeight: 700 }}>EXCLUSIVE ACCESS</span>
      </div>
      <ArenaEventShell roomId="vip-lounge" eventType="live-show" mode="audience" />
      <div style={{ maxWidth: 860, margin: "28px auto 0", padding: "0 20px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.24em", color: "rgba(255,215,0,0.5)", marginBottom: 14 }}>
          VIP PERKS ACTIVE
        </div>
        {[
          { perk: "Backstage Access", desc: "Direct access to artist green rooms", icon: "🎭" },
          { perk: "Priority Queue", desc: "Skip the line in all battle queues", icon: "⚡" },
          { perk: "Private Chat", desc: "Direct message any artist on platform", icon: "💬" },
          { perk: "Early Drops", desc: "Hear new releases 24h before anyone", icon: "🎵" },
          { perk: "Merch Discount", desc: "30% off all artist merchandise", icon: "🛍️" },
        ].map(p => (
          <div key={p.perk} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 18px", marginBottom: 8,
            background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 10,
          }}>
            <div style={{ fontSize: 22 }}>{p.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#FFD700" }}>{p.perk}</div>
              <div style={{ fontSize: 10, color: "#888" }}>{p.desc}</div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00FF88" }} />
          </div>
        ))}
      </div>
    </main>
  );
}
