"use client";
import Link from "next/link";

const T = {
  void: "#0D0520", deep: "#150830", card: "#1E0D3E", raised: "#2A1452",
  cyan: "#00E5FF", gold: "#FFB800", pink: "#FF2D78", teal: "#00C896",
  text: "#FFFFFF", text2: "#C8A8E8", text3: "#7A5F9A",
  display: "'Bebas Neue', Impact, sans-serif",
  heading: "'Oswald', 'Arial Narrow', sans-serif",
  body: "'Inter', sans-serif",
};

interface HUDPanelProps {
  title: string;
  color: string;
  items: Array<{ label: string; value: string | number; status?: "ok" | "warn" | "err" }>;
  href: string;
}

function HUDPanel({ title, color, items, href }: HUDPanelProps) {
  const statusColor = { ok: T.teal, warn: T.gold, err: T.pink };
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{ background: T.card, border: `1px solid ${color}44`, borderTop: `3px solid ${color}`, borderRadius: 10, padding: 16, cursor: "pointer", height: "100%" }}>
        <div style={{ fontFamily: T.heading, fontSize: 10, color, letterSpacing: 2, marginBottom: 12 }}>{title}</div>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
            <span style={{ fontFamily: T.heading, fontSize: 11, color: T.text2 }}>{item.label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {item.status && <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor[item.status] }} />}
              <span style={{ fontFamily: T.display, fontSize: 16, color }}>{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </Link>
  );
}

export default function AdminCommandCenter() {
  return (
    <div style={{ background: T.void, minHeight: "100vh", color: T.text, fontFamily: T.body }}>

      {/* ── TOP BAR ── */}
      <div style={{ background: T.deep, borderBottom: `2px solid ${T.pink}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: T.heading, fontSize: 10, color: T.pink, letterSpacing: 3 }}>BERNTOUTGLOBAL LLC</div>
          <div style={{ fontFamily: T.display, fontSize: 22, color: T.gold, letterSpacing: 2 }}>⚡ ADMIN COMMAND CENTER</div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.teal, boxShadow: `0 0 8px ${T.teal}` }} />
          <span style={{ fontFamily: T.heading, fontSize: 11, color: T.teal, letterSpacing: 1 }}>ALL SYSTEMS NOMINAL</span>
        </div>
      </div>

      <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>

        {/* ── PLATFORM STAT STRIP ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 24 }}>
          {[["LIVE ROOMS", "—", T.cyan], ["ACTIVE USERS", "—", T.gold], ["THIS WEEK REV", "$—", T.teal], ["CAMPAIGNS", "—", T.purple || "#7B2FBE"], ["BOTS RUNNING", "—", T.pink], ["SYSTEM HEALTH", "100%", T.teal]].map(([label, val, color]) => (
            <div key={label} style={{ background: T.card, border: `1px solid ${color}33`, borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontFamily: T.heading, fontSize: 9, color: T.text3, letterSpacing: 1.5, marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: T.display, fontSize: 22, color }}>{val}</div>
            </div>
          ))}
        </div>

        {/* ── 6-PANEL HUD GRID ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
          <HUDPanel title="⚡ PLATFORM HEALTH" color={T.teal} href="/admin/health" items={[
            { label: "API Server", value: "OK", status: "ok" },
            { label: "Database", value: "OK", status: "ok" },
            { label: "Redis Cache", value: "OK", status: "ok" },
            { label: "WebSocket", value: "OK", status: "ok" },
            { label: "CDN / R2", value: "OK", status: "ok" },
          ]} />
          <HUDPanel title="💰 OWNER FINANCE" color={T.gold} href="/admin/finance/profit" items={[
            { label: "Gross This Week", value: "$0.00" },
            { label: "Platform Net", value: "$0.00" },
            { label: "Distributable", value: "$0.00" },
            { label: "Marcel (A)", value: "$0.00" },
            { label: "Jay Paul (B)", value: "$0.00" },
          ]} />
          <HUDPanel title="📢 CAMPAIGNS" color={T.cyan} href="/admin/campaigns" items={[
            { label: "Active", value: "—" },
            { label: "Pending Approval", value: "—", status: "warn" },
            { label: "Expiring (7d)", value: "—" },
            { label: "Ad Fill Rate", value: "—%" },
            { label: "House Ad Rate", value: "—%" },
          ]} />
          <HUDPanel title="🤖 BOT STATUS" color={T.pink} href="/admin/bots" items={[
            { label: "cover-generator", value: "Running", status: "ok" },
            { label: "sponsor-matching", value: "Running", status: "ok" },
            { label: "billing-integrity", value: "Running", status: "ok" },
            { label: "fraud-sentinel", value: "Running", status: "ok" },
            { label: "owner-finance", value: "Pending", status: "warn" },
          ]} />
          <HUDPanel title="🛡 MODERATION" color={"#C8A8E8"} href="/admin/moderation" items={[
            { label: "Reports Queue", value: "—" },
            { label: "Pending Review", value: "—", status: "warn" },
            { label: "Auto-resolved", value: "—" },
            { label: "Escalated", value: "—" },
            { label: "Avg Response", value: "—h" },
          ]} />
          <HUDPanel title="🏆 DISCOVERY" color={T.teal} href="/admin/analytics" items={[
            { label: "0-Viewer Artists", value: "—" },
            { label: "Position 1 Check", value: "PASS", status: "ok" },
            { label: "Weekly Rankings", value: "Active", status: "ok" },
            { label: "Crown Winner", value: "—" },
            { label: "Contest Open", value: "—" },
          ]} />
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div style={{ fontFamily: T.display, fontSize: 18, color: T.gold, letterSpacing: 2, marginBottom: 16 }}>QUICK ACTIONS</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            ["/admin/finance/profit", "💰 APPROVE PROFIT DIST", T.gold],
            ["/admin/campaigns", "📢 REVIEW CAMPAIGNS", T.cyan],
            ["/admin/moderation", "🛡 MODERATION QUEUE", "#C8A8E8"],
            ["/admin/bots", "🤖 BOT DASHBOARD", T.pink],
            ["/admin/feature-flags", "🚩 FEATURE FLAGS", T.teal],
            ["/admin/emergency", "🚨 EMERGENCY STOP", T.pink],
          ].map(([href, label, color]) => (
            <Link key={label} href={href} style={{ padding: "8px 16px", border: `1px solid ${color}55`, color, fontFamily: T.heading, fontSize: 11, letterSpacing: 1, textDecoration: "none", borderRadius: 6 }}>
              {label}
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
