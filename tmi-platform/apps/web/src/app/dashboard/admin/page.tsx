"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface MeUser { id: string; email: string; name?: string; role: string; onboardingState: string; }

const ADMIN_SECTIONS = [
  {
    label: "USER MANAGEMENT",
    color: "#00FFFF",
    links: [
      { label: "All Users",      href: "/admin/users",           emoji: "👥" },
      { label: "Roles & Perms",  href: "/admin/users",           emoji: "🔑" },
      { label: "Bans & Flags",   href: "/admin/moderation",      emoji: "🚫" },
      { label: "Onboarding",     href: "/admin/users",           emoji: "🚀" },
    ],
  },
  {
    label: "REVENUE & BILLING",
    color: "#00FF88",
    links: [
      { label: "Payouts",        href: "/admin/payouts",         emoji: "💸" },
      { label: "Subscriptions",  href: "/admin/payouts",         emoji: "💳" },
      { label: "Stripe Events",  href: "/admin/payouts",         emoji: "⚡" },
      { label: "Revenue Stats",  href: "/dashboard/revenue",     emoji: "📈" },
    ],
  },
  {
    label: "CONTENT & MEDIA",
    color: "#FF2DAA",
    links: [
      { label: "Articles",       href: "/admin/content",         emoji: "📄" },
      { label: "Magazine",       href: "/magazine",              emoji: "📰" },
      { label: "Beats Catalog",  href: "/dashboard/beats",       emoji: "🎵" },
      { label: "Media Queue",    href: "/dashboard/media",       emoji: "🎬" },
    ],
  },
  {
    label: "COMPETITION ENGINE",
    color: "#FFD700",
    links: [
      { label: "Contests",       href: "/admin/contests",        emoji: "🏆" },
      { label: "Battle Arena",   href: "/battles",               emoji: "⚔️" },
      { label: "Leaderboard",    href: "/home/ranking",          emoji: "📊" },
      { label: "Winners",        href: "/winner-hall",           emoji: "🥇" },
    ],
  },
  {
    label: "LIVE & BROADCAST",
    color: "#AA2DFF",
    links: [
      { label: "Live Rooms",     href: "/live/rooms",            emoji: "📺" },
      { label: "Live Stages",    href: "/live/stages",           emoji: "🎤" },
      { label: "Stations",       href: "/admin/stations",        emoji: "📻" },
      { label: "Lobby Wall",     href: "/live/lobby-wall",       emoji: "🏟️" },
    ],
  },
  {
    label: "BOTS & AUTOMATION",
    color: "#FF9500",
    links: [
      { label: "Bot Network",    href: "/admin/bots",            emoji: "🤖" },
      { label: "Bot Dashboard",  href: "/dashboard/bots",        emoji: "⚙️" },
      { label: "Experiments",    href: "/dashboard/experiments", emoji: "🧪" },
      { label: "Feature Flags",  href: "/admin/feature-flags",   emoji: "🚩" },
    ],
  },
  {
    label: "MONETIZATION",
    color: "#00FFFF",
    links: [
      { label: "Sponsors",       href: "/admin/sponsors",        emoji: "🤝" },
      { label: "Advertisers",    href: "/admin/advertisers",     emoji: "📢" },
      { label: "Ad Analytics",   href: "/advertiser/analytics",  emoji: "📊" },
      { label: "Billboard",      href: "/billboard",             emoji: "🏙️" },
    ],
  },
  {
    label: "PLATFORM HEALTH",
    color: "#00FF88",
    links: [
      { label: "System Health",  href: "/dashboard/system-health", emoji: "❤️" },
      { label: "Error Logs",     href: "/dashboard/logs",          emoji: "🔴" },
      { label: "Moderation",     href: "/dashboard/moderation",    emoji: "🛡️" },
      { label: "Analytics",      href: "/admin/analytics",         emoji: "📈" },
    ],
  },
];

const PLATFORM_STATS = [
  { label: "Total Users",     value: "4,821",  icon: "👥", color: "#00FFFF",  delta: "+124 today" },
  { label: "Active Now",      value: "312",    icon: "🟢", color: "#00FF88",  delta: "+18 this hr" },
  { label: "Revenue Today",   value: "$2,140", icon: "💰", color: "#FFD700",  delta: "+$840 vs yesterday" },
  { label: "Live Rooms",      value: "7",      icon: "📺", color: "#FF2DAA",  delta: "3 full, 4 open" },
  { label: "Bots Active",     value: "62",     icon: "🤖", color: "#AA2DFF",  delta: "Phase 1 gate open" },
  { label: "Articles Live",   value: "28",     icon: "📰", color: "#FF9500",  delta: "+3 this week" },
];

const ADMIN_ROLES = ["admin", "staff", "ADMIN", "STAFF"];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store", credentials: "include" });
        if (res.status === 401 || res.status === 403) { router.replace("/auth"); return; }
        const data = await res.json() as { authenticated: boolean; user?: MeUser };
        if (!data.authenticated || !data.user) { router.replace("/auth"); return; }
        if (!ADMIN_ROLES.includes(data.user.role)) { router.replace("/dashboard"); return; }
        setUser(data.user);
      } catch { router.replace("/auth"); } finally { setLoading(false); }
    };
    void load();
  }, [router]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#050510", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#FF9500", fontSize: 13, letterSpacing: 4, fontWeight: 700 }}>LOADING ADMIN HUB...</span>
    </div>
  );

  if (!user) return null;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: "rgba(0,0,0,0.9)", borderBottom: "1px solid rgba(255,149,0,0.3)", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#FF9500", fontWeight: 800 }}>TMI ADMIN COMMAND CENTER</div>
          <div style={{ fontSize: 15, fontWeight: 900, marginTop: 1 }}>{user.name ?? user.email}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/admin/owner-dashboard" style={{ fontSize: 10, color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)", padding: "5px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>👑 OWNER DASHBOARD</Link>
          <Link href="/admin/analytics" style={{ fontSize: 10, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.25)", padding: "5px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>📊 ANALYTICS</Link>
          <Link href="/home/1" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", padding: "5px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>← SITE</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>

        {/* Platform Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 28 }}>
          {PLATFORM_STATS.map(s => (
            <div key={s.label} style={{ background: `${s.color}08`, border: `1px solid ${s.color}25`, borderRadius: 12, padding: "16px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color }} />
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 3 }}>{s.label}</div>
              <div style={{ fontSize: 9, color: s.color, opacity: 0.6, marginTop: 2 }}>{s.delta}</div>
            </div>
          ))}
        </div>

        {/* CTA hero */}
        <div style={{ background: "linear-gradient(135deg,rgba(255,149,0,0.12),rgba(255,215,0,0.06))", border: "1.5px solid rgba(255,149,0,0.3)", borderRadius: 14, padding: "20px 24px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FF9500", fontWeight: 800, marginBottom: 6 }}>👑 PLATFORM OPERATIONS</div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>Admin Command Center</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 5 }}>Full platform control — users, revenue, content, bots, live, billing.</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <Link href="/admin/owner-dashboard" style={{ padding: "11px 22px", background: "linear-gradient(90deg,#FF9500,#FFD700)", borderRadius: 8, color: "#000", fontWeight: 900, fontSize: 12, textDecoration: "none" }}>OWNER DECK</Link>
            <Link href="/admin/users" style={{ padding: "11px 18px", background: "rgba(255,149,0,0.1)", border: "1px solid rgba(255,149,0,0.3)", borderRadius: 8, color: "#FF9500", fontWeight: 800, fontSize: 12, textDecoration: "none" }}>MANAGE USERS</Link>
          </div>
        </div>

        {/* Admin Sections Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, marginBottom: 28 }}>
          {ADMIN_SECTIONS.map(section => (
            <div key={section.label} style={{ background: `${section.color}05`, border: `1px solid ${section.color}18`, borderRadius: 12, padding: "16px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: section.color }} />
              <div style={{ fontSize: 9, color: section.color, fontWeight: 800, letterSpacing: "0.2em", marginBottom: 10 }}>{section.label}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {section.links.map(l => (
                  <Link key={l.href + l.label} href={l.href} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", background: `${section.color}08`, border: `1px solid ${section.color}15`, borderRadius: 7, textDecoration: "none", fontSize: 12, fontWeight: 600, color: "#fff" }}>
                    <span style={{ fontSize: 15 }}>{l.emoji}</span>
                    <span style={{ color: section.color }}>{l.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Session Info */}
        <div style={{ background: "rgba(255,149,0,0.04)", border: "1px solid rgba(255,149,0,0.15)", borderRadius: 12, padding: "20px 24px" }}>
          <div style={{ fontSize: 10, color: "#FF9500", fontWeight: 800, letterSpacing: "0.2em", marginBottom: 14 }}>ACTIVE SESSION</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {[
              ["Role", user.role],
              ["Email", user.email],
              ["Name", user.name ?? "—"],
              ["User ID", user.id.slice(0, 16) + "..."],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", wordBreak: "break-all" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
