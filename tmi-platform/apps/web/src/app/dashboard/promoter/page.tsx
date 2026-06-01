"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import LiveMediaWall from "@/components/media/LiveMediaWall";

interface MeUser { id: string; email: string; name?: string; role: string; }

const ACCENT = "#00FF88";

const STATS = [
  { label: "Events Promoted",  value: "0",  icon: "🎪", color: "#00FF88" },
  { label: "Artists Booked",   value: "0",  icon: "🎤", color: "#00FFFF" },
  { label: "Tickets Sold",     value: "0",  icon: "🎟️", color: "#FFD700" },
  { label: "Revenue",          value: "$0", icon: "💵", color: "#AA2DFF" },
];

const PRIMARY_ACTIONS = [
  { label: "PROMOTE EVENT",   icon: "📣", href: "/promoter/events",    color: "#00FF88", desc: "Launch event campaign" },
  { label: "BOOK ARTIST",     icon: "🎤", href: "/booking",            color: "#00FFFF", desc: "Contract performers" },
  { label: "SELL TICKETS",    icon: "🎟️", href: "/tickets",           color: "#FFD700", desc: "Create ticket tiers" },
  { label: "LIVE LOBBY",      icon: "🏟️", href: "/live/rooms",        color: "#AA2DFF", desc: "Open pre-show space" },
  { label: "VENUES",          icon: "🏢", href: "/venues",             color: "#00FF88", desc: "Find partner venues" },
  { label: "ADVERTISING",     icon: "📢", href: "/advertising",        color: "#FF2DAA", desc: "Buy promo placements" },
  { label: "SPONSOR DEALS",   icon: "🤝", href: "/sponsor/campaigns",  color: "#FFD700", desc: "Attach brands to shows" },
  { label: "ANALYTICS",       icon: "📊", href: "/hub/promoter",       color: "#00FFFF", desc: "Reach, conversions, revenue" },
  { label: "LIVE STAGES",     icon: "🎭", href: "/live/stages",        color: "#AA2DFF", desc: "Broadcast stages" },
  { label: "MESSAGES",        icon: "💌", href: "/messages",           color: "#00FF88", desc: "Artist & venue inbox" },
  { label: "INVITE & XP",    icon: "⭐", href: "/account/referrals",  color: "#FF9500", desc: "Earn referral bonus" },
  { label: "SETTINGS",        icon: "⚙️", href: "/settings",          color: "#555",    desc: "Account preferences" },
];

const VENUE_ROUTES = [
  { label: "All Venues",       icon: "🏢", href: "/venues" },
  { label: "Live Lobby",       icon: "🏟️", href: "/live/rooms" },
  { label: "Live Rooms",       icon: "📺", href: "/live/rooms" },
  { label: "Backstage",        icon: "🎪", href: "/live/backstage" },
  { label: "Lobby Wall",       icon: "🎨", href: "/live/lobby-wall" },
  { label: "Live Billboards",  icon: "📡", href: "/live/billboards" },
];

const PLATFORM_LINKS = [
  { label: "HOME RAIL",    icon: "🏠", href: "/home/1",                desc: "Billboard #1",    color: "#00FF88" },
  { label: "ADMIN PANEL",  icon: "👑", href: "/admin/owner-dashboard", desc: "Owner access",    color: "#FFD700" },
  { label: "STORE HUB",    icon: "🛒", href: "/store",                 desc: "TMI global store", color: "#00FFFF" },
  { label: "GIVEAWAYS",    icon: "🎁", href: "/store/giveaways",       desc: "Contest prizes",  color: "#AA2DFF" },
];

export default function PromoterDashboardPage() {
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
        setUser(data.user);
      } catch { router.replace("/auth"); } finally { setLoading(false); }
    };
    void load();
  }, [router]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#050510", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: ACCENT, fontSize: 13, letterSpacing: 4, fontWeight: 700 }}>LOADING PROMOTER HUB...</span>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(0,255,136,0.2)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800 }}>PROMOTER COMMAND CENTER</div>
          <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2 }}>{user?.name ?? "Promoter"}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/hub/promoter" style={{ fontSize: 10, color: ACCENT, border: "1px solid rgba(0,255,136,0.3)", padding: "5px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>PROMOTER HUB</Link>
          <Link href="/hub/venue" style={{ fontSize: 10, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.25)", padding: "5px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>VENUE HUB</Link>
          <Link href="/settings" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", padding: "5px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>SETTINGS</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 32 }}>
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${s.color}30`, borderRadius: 12, padding: "18px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color }} />
              <div style={{ fontSize: 26, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#555", marginTop: 4, textTransform: "uppercase" }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* CTA hero */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ background: "linear-gradient(135deg, rgba(0,255,136,0.12), rgba(0,255,255,0.07))", border: "1.5px solid rgba(0,255,136,0.35)", borderRadius: 16, padding: "24px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: ACCENT, fontWeight: 800, marginBottom: 6 }}>📣 BUILD THE MOMENT</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>Promote. Book. Sell Out.</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>Run event campaigns, coordinate bookings, drive ticket sales and sponsor deals.</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <Link href="/promoter/events" style={{ padding: "13px 28px", background: `linear-gradient(90deg,${ACCENT},#00FFFF)`, borderRadius: 9, color: "#050510", fontWeight: 900, fontSize: 13, textDecoration: "none", whiteSpace: "nowrap" }}>PROMOTE EVENT</Link>
            <Link href="/hub/promoter" style={{ padding: "13px 20px", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 9, color: ACCENT, fontWeight: 800, fontSize: 13, textDecoration: "none", whiteSpace: "nowrap" }}>FULL CONTROL</Link>
          </div>
        </motion.div>

        {/* Live event screens */}
        <div style={{ marginBottom: 32 }}>
          <LiveMediaWall roomId="promoter-events" title="LIVE EVENT ROOMS · ACTIVE NOW" mode="wall" nodeCount={6} accentColor="#00FF88" enterHref="/live/rooms" />
        </div>

        {/* Primary Actions */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 14 }}>QUICK ACTIONS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: 10 }}>
            {PRIMARY_ACTIONS.map((a, i) => (
              <motion.div key={a.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.04 }}>
                <Link href={a.href} style={{ display: "flex", flexDirection: "column", gap: 4, padding: "14px 16px", background: `${a.color}08`, border: `1px solid ${a.color}25`, borderRadius: 10, textDecoration: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{a.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: a.color, letterSpacing: "0.1em" }}>{a.label}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{a.desc}</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Venue routes + Platform */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
          <div style={{ background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.12)", borderRadius: 14, padding: "20px" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800, marginBottom: 14 }}>VENUE + LIVE ROUTES</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
              {VENUE_ROUTES.map((l) => (
                <Link key={l.href} href={l.href} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 10px", background: "rgba(0,255,136,0.05)", border: "1px solid rgba(0,255,136,0.1)", borderRadius: 7, textDecoration: "none" }}>
                  <span style={{ fontSize: 14 }}>{l.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: ACCENT }}>{l.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.1)", borderRadius: 14, padding: "20px" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#FFD700", fontWeight: 800, marginBottom: 14 }}>PLATFORM CONNECTIONS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PLATFORM_LINKS.map((p) => (
                <Link key={p.href} href={p.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: `${p.color}08`, border: `1px solid ${p.color}20`, borderRadius: 8, textDecoration: "none" }}>
                  <span style={{ fontSize: 20 }}>{p.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: p.color }}>{p.label}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{p.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Referral banner */}
        <div style={{ background: "linear-gradient(135deg, rgba(255,149,0,0.1), rgba(0,255,136,0.06))", border: "1px solid rgba(255,149,0,0.25)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#FF9500", marginBottom: 4 }}>⭐ INVITE & EARN — LAUNCH BONUS ACTIVE (2× XP)</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Refer artists, venues, or fans. Earn XP on each signup. Launch bonus expires Sep 2026.</div>
          </div>
          <Link href="/account/referrals" style={{ padding: "10px 20px", background: "#FF9500", borderRadius: 8, color: "#000", fontWeight: 900, fontSize: 12, textDecoration: "none", whiteSpace: "nowrap" }}>GET LINK</Link>
        </div>

      </div>
    </main>
  );
}
