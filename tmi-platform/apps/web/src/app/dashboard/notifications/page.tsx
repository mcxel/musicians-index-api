"use client";
import { useState } from "react";
import Link from "next/link";

const ACCENT = "#A78BFA";

const STATS = [
  { label: "Sent Today",    value: "8,412",  color: "#A78BFA" },
  { label: "Delivered",     value: "97.2%",  color: "#00FFFF" },
  { label: "Opened",        value: "41.8%",  color: "#FFD700" },
  { label: "Clicked",       value: "14.3%",  color: "#34D399" },
];

const RECENT_NOTIFS = [
  { type: "BATTLE",   msg: "⚔️ Battle starts in 5 min — Dirty Dozens #6",   sent: "2h ago",   audience: "Registered fighters", count: 312 },
  { type: "TIP",      msg: "💰 You received a $25 tip from SkyFan94",        sent: "4h ago",   audience: "Artist: @wavetek",    count: 1   },
  { type: "SYSTEM",   msg: "🔴 Live stream starting NOW — Main Stage",       sent: "6h ago",   audience: "All fans + subs",     count: 4821 },
  { type: "PROMO",    msg: "🎁 Flash giveaway — Win TMI Diamond for 24h",    sent: "12h ago",  audience: "Active users",        count: 2104 },
  { type: "MAGAZINE", msg: "📰 New article: Big KazhDog x TMI Magazine",    sent: "1d ago",   audience: "Magazine subscribers",count: 892  },
  { type: "RANK",     msg: "🏆 You moved up to Rank #14 this week!",        sent: "2d ago",   audience: "Performers (ranked)", count: 47   },
];

const TYPE_COLOR: Record<string, string> = {
  BATTLE: "#FF2DAA", TIP: "#34D399", SYSTEM: "#00FFFF", PROMO: "#FFD700", MAGAZINE: "#A78BFA", RANK: "#FF9500",
};

const CHANNELS = [
  { label: "Push Notifications", icon: "📱", enabled: true,  count: "7,841 devices" },
  { label: "In-App Alerts",      icon: "🔔", enabled: true,  count: "4,821 users"   },
  { label: "Email Digest",       icon: "📧", enabled: true,  count: "3,290 subs"    },
  { label: "SMS Alerts",         icon: "💬", enabled: false, count: "—"             },
  { label: "Discord Webhook",    icon: "🎮", enabled: true,  count: "#tmi-updates"  },
];

export default function NotificationsDashboardPage() {
  const [toast, setToast] = useState("");
  const [channels, setChannels] = useState(CHANNELS.map(c => ({ ...c })));

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }
  function toggleChannel(i: number) {
    setChannels(prev => prev.map((c, idx) => idx === i ? { ...c, enabled: !c.enabled } : c));
    showToast(`${channels[i]?.label} ${channels[i]?.enabled ? "disabled" : "enabled"}`);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(167,139,250,0.25)", padding: "11px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800 }}>ADMIN — NOTIFICATIONS</div>
          <div style={{ fontSize: 14, fontWeight: 900 }}>🔔 Notification Center</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => showToast("Compose notification modal")} style={{ fontSize: 10, fontWeight: 800, color: "#000", background: ACCENT, border: "none", padding: "6px 16px", borderRadius: 6, cursor: "pointer" }}>+ SEND</button>
          <Link href="/dashboard/admin" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>← Admin</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: `${s.color}08`, border: `1px solid ${s.color}25`, borderRadius: 10, padding: "14px 16px", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color, borderRadius: "10px 10px 0 0" }} />
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginTop: 2 }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {toast && <div style={{ marginBottom: 16, padding: "10px 16px", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 8, fontSize: 12, color: ACCENT }}>{toast}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
          {/* Recent notifications */}
          <div>
            <div style={{ fontSize: 10, color: ACCENT, fontWeight: 800, letterSpacing: "0.15em", marginBottom: 12 }}>RECENT NOTIFICATIONS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {RECENT_NOTIFS.map((n, i) => {
                const tc = TYPE_COLOR[n.type] ?? "#888";
                return (
                  <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 16px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center" }}>
                    <span style={{ fontSize: 8, fontWeight: 900, padding: "3px 8px", borderRadius: 10, background: `${tc}15`, color: tc, letterSpacing: "0.1em" }}>{n.type}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{n.msg}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{n.audience} · {n.sent}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: tc }}>{n.count.toLocaleString()}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>recipients</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Channel config */}
          <div>
            <div style={{ fontSize: 10, color: ACCENT, fontWeight: 800, letterSpacing: "0.15em", marginBottom: 12 }}>DELIVERY CHANNELS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {channels.map((c, i) => (
                <div key={c.label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${c.enabled ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.06)"}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 18 }}>{c.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{c.label}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{c.count}</div>
                  </div>
                  <button onClick={() => toggleChannel(i)} style={{ padding: "5px 12px", fontSize: 9, fontWeight: 900, borderRadius: 6, border: "none", cursor: "pointer", background: c.enabled ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.06)", color: c.enabled ? "#34D399" : "rgba(255,255,255,0.35)" }}>
                    {c.enabled ? "ON" : "OFF"}
                  </button>
                </div>
              ))}
            </div>
            <Link href="/dashboard/email" style={{ display: "block", marginTop: 12, padding: "10px 0", textAlign: "center", background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 8, fontSize: 11, fontWeight: 700, color: ACCENT, textDecoration: "none" }}>
              → Email Dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
