"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { getRoleStats, type DashboardStat } from "@/lib/stats/DashboardStatsEngine";

interface MeUser { id: string; email: string; name?: string; role: string; }

const ACCENT = "#FF2DAA";

const QUICK_LINKS = [
  { label: "New Article",       icon: "✏️", href: "/editorial/write",       color: ACCENT,    desc: "Start writing" },
  { label: "Writer Hub",        icon: "🗞️", href: "/hub/writer",            color: "#AA2DFF", desc: "Full editorial control" },
  { label: "My Drafts",         icon: "📝", href: "/editorial/drafts",       color: "#00FFFF", desc: "In-progress articles" },
  { label: "Magazine",          icon: "📰", href: "/magazine",               color: "#FFD700", desc: "Live TMI magazine" },
  { label: "Article Health",    icon: "🔍", href: "/admin/articles",        color: "#00FF88", desc: "Sync status" },
  { label: "Editorial Desk",    icon: "🗂️", href: "/editorial",             color: ACCENT,    desc: "Full editorial suite" },
  { label: "Contributors",      icon: "👥", href: "/editorial/contributors", color: "#AA2DFF", desc: "Writer roster" },
  { label: "Analytics",         icon: "📊", href: "/editorial/analytics",    color: "#00FFFF", desc: "Reads, shares, engagement" },
];

const CONTENT_PIPELINE = [
  { label: "Drafts",   count: 3, href: "/editorial/drafts",   color: "#64748b" },
  { label: "Review",   count: 1, href: "/editorial/review",   color: "#FFD700" },
  { label: "Approved", count: 1, href: "/editorial/approved", color: "#00FF88" },
  { label: "Live",     count: 17, href: "/magazine",          color: "#00FFFF" },
];

export default function WriterDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleStats, setRoleStats] = useState<DashboardStat[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store", credentials: "include" });
        if (res.status === 401 || res.status === 403) { router.replace("/auth"); return; }
        const data = await res.json() as { authenticated: boolean; user?: MeUser };
        if (!data.authenticated || !data.user) { router.replace("/auth"); return; }
        setUser(data.user);
        setRoleStats(getRoleStats("writer"));
      } catch { router.replace("/auth"); } finally { setLoading(false); }
    };
    void load();
  }, [router]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#050510", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: ACCENT, fontSize: 13, letterSpacing: 4, fontWeight: 700 }}>LOADING WRITER DASHBOARD...</span>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ background: "rgba(0,0,0,0.8)", borderBottom: "1px solid rgba(255,45,170,0.2)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800 }}>WRITER DASHBOARD</div>
          <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2 }}>{user?.name ?? user?.email?.split("@")[0] ?? "Writer"}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/hub/writer" style={{ fontSize: 10, color: ACCENT, border: "1px solid rgba(255,45,170,0.3)", padding: "5px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>WRITER HUB</Link>
          <Link href="/editorial" style={{ fontSize: 10, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.25)", padding: "5px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>EDITORIAL</Link>
          <Link href="/settings" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.1)", padding: "5px 12px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>SETTINGS</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Stats */}
        {roleStats.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 32 }}>
            {roleStats.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${s.color}30`, borderRadius: 12, padding: "18px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color }} />
                <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 3, letterSpacing: "0.1em" }}>{s.label.toUpperCase()}</div>
                <div style={{ fontSize: 9, color: s.deltaPositive ? "#00FF88" : "#FF4444", marginTop: 2 }}>{s.delta}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA hero */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ background: "linear-gradient(135deg, rgba(255,45,170,0.12), rgba(170,45,255,0.08))", border: "1.5px solid rgba(255,45,170,0.3)", borderRadius: 16, padding: "24px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: ACCENT, fontWeight: 800, marginBottom: 6 }}>✏️ PUBLISH TODAY</div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>Shape the Culture. Tell the Story.</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>Write and publish to TMI Magazine. Reach thousands of music fans.</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <Link href="/editorial/write" style={{ padding: "12px 24px", background: `linear-gradient(90deg,${ACCENT},#AA2DFF)`, borderRadius: 9, color: "#fff", fontWeight: 900, fontSize: 13, textDecoration: "none", whiteSpace: "nowrap" }}>NEW ARTICLE</Link>
            <Link href="/magazine" style={{ padding: "12px 18px", background: "rgba(255,45,170,0.1)", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 9, color: ACCENT, fontWeight: 800, fontSize: 13, textDecoration: "none", whiteSpace: "nowrap" }}>VIEW MAGAZINE</Link>
          </div>
        </motion.div>

        {/* Quick links */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 14 }}>QUICK ACTIONS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 10 }}>
            {QUICK_LINKS.map((l, i) => (
              <motion.div key={l.href} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.04 }}>
                <Link href={l.href} style={{ display: "flex", flexDirection: "column", gap: 4, padding: "14px 16px", background: `${l.color}08`, border: `1px solid ${l.color}25`, borderRadius: 10, textDecoration: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{l.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: l.color, letterSpacing: "0.1em" }}>{l.label}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{l.desc}</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Content pipeline */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,45,170,0.12)", borderRadius: 14, padding: "20px" }}>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: ACCENT, fontWeight: 800, marginBottom: 14 }}>CONTENT PIPELINE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {CONTENT_PIPELINE.map((p) => (
              <Link key={p.label} href={p.href} style={{ textAlign: "center", padding: "16px 12px", background: `${p.color}10`, border: `1px solid ${p.color}30`, borderRadius: 10, textDecoration: "none" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: p.color }}>{p.count}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>{p.label}</div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
