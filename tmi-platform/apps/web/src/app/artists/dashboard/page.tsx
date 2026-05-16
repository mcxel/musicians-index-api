import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artist Dashboard | TMI",
  description: "Manage your TMI artist profile, earnings, bookings, analytics, and content.",
};

const STATS = [
  { label: "Followers",     value: "12,400",  change: "+340",   color: "#FF2DAA", icon: "👥" },
  { label: "Total Earned",  value: "$1,847",  change: "+$247",  color: "#00FF88", icon: "💵" },
  { label: "Room Plays",    value: "84,200",  change: "+4.1K",  color: "#00FFFF", icon: "🎙️" },
  { label: "Beat Sales",    value: "42",      change: "+7",     color: "#FFD700", icon: "🎵" },
  { label: "Tips Received", value: "1,204",   change: "+89",    color: "#AA2DFF", icon: "💸" },
  { label: "XP",            value: "48,200",  change: "+2,100", color: "#FF9500", icon: "⭐" },
];

const QUICK_ACTIONS = [
  { label: "Go Live",           icon: "🎙️", href: "/go-live",       color: "#FF2DAA", cta: "START NOW"    },
  { label: "Upload Beat",       icon: "🎵", href: "/beats",         color: "#00FFFF", cta: "UPLOAD"       },
  { label: "Submit to Mag",     icon: "📰", href: "/submit",        color: "#AA2DFF", cta: "SUBMIT"       },
  { label: "Enter Contest",     icon: "🏆", href: "/contests",      color: "#FFD700", cta: "ENTER NOW"    },
  { label: "Wallet & Payouts",  icon: "💵", href: "/wallet",        color: "#00FF88", cta: "VIEW WALLET"  },
  { label: "Boost Profile",     icon: "🚀", href: "/spotlight",     color: "#FF9500", cta: "BOOST"        },
];

const RECENT_ACTIVITY = [
  { type: "TIP",       text: "@wavetek tipped you 500 credits",      time: "2h ago",  color: "#FF2DAA" },
  { type: "FOLLOWER",  text: "@neonlistener followed you",            time: "4h ago",  color: "#00FFFF" },
  { type: "SALE",      text: "Beat 'Electric Sky' sold — Basic",      time: "1d ago",  color: "#00FF88" },
  { type: "CONTEST",   text: "You qualified for Grand Contest Ep.12", time: "1d ago",  color: "#FFD700" },
  { type: "XP",        text: "+250 XP — 7-day login streak",          time: "2d ago",  color: "#AA2DFF" },
];

const TYPE_ICON: Record<string, string> = { TIP: "💸", FOLLOWER: "👥", SALE: "💵", CONTEST: "🏆", XP: "⭐" };

export default function ArtistDashboardPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ padding: "36px 24px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ width: 56, height: 56, background: "radial-gradient(circle, #FF2DAA40, transparent)", border: "2px solid #FF2DAA40", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🎤</div>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800, marginBottom: 4 }}>ARTIST DASHBOARD</div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Welcome back, Artist</h1>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Season 1 · Active · Level 9 — Virtuoso</div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Link href="/go-live" style={{ display: "inline-block", padding: "10px 22px", fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: "#050510", background: "#FF2DAA", borderRadius: 7, textDecoration: "none" }}>
              🔴 GO LIVE NOW
            </Link>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 24px 0", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10 }}>
        {STATS.map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${s.color}20`, borderRadius: 10, padding: "14px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <span style={{ fontSize: 8, color: "#00FF88", fontWeight: 700 }}>{s.change}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </section>

      <section style={{ maxWidth: 1000, margin: "24px auto 0", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10 }}>
        {QUICK_ACTIONS.map(a => (
          <Link key={a.label} href={a.href} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${a.color}20`, borderRadius: 10, padding: "16px 14px", textAlign: "center" }}>
              <span style={{ fontSize: 22 }}>{a.icon}</span>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#fff", marginTop: 8, marginBottom: 8 }}>{a.label}</div>
              <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.1em", color: "#050510", background: a.color, borderRadius: 4, padding: "3px 8px", display: "inline-block" }}>{a.cta}</div>
            </div>
          </Link>
        ))}
      </section>

      <section style={{ maxWidth: 1000, margin: "28px auto 0", padding: "0 24px", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 14 }}>RECENT ACTIVITY</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 14, minWidth: 20, textAlign: "center" }}>{TYPE_ICON[a.type]}</span>
                <span style={{ flex: 1, fontSize: 10, color: "rgba(255,255,255,0.65)" }}>{a.text}</span>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap" }}>{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 14 }}>QUICK LINKS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "My Beats",          href: "/beats",                color: "#00FFFF" },
              { label: "My Bookings",       href: "/artists/dashboard/bookings", color: "#00FF88" },
              { label: "Territory Map",     href: "/artists/dashboard/territory", color: "#FFD700" },
              { label: "Analytics",         href: "/artists/dashboard",    color: "#FF2DAA" },
              { label: "Fan Club",          href: "/fan-club",             color: "#AA2DFF" },
              { label: "Season Pass",       href: "/season-pass",          color: "#FF9500" },
            ].map(l => (
              <Link key={l.label} href={l.href} style={{ textDecoration: "none", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.02)", border: `1px solid ${l.color}15`, borderRadius: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{l.label}</span>
                <span style={{ fontSize: 12, color: l.color }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
