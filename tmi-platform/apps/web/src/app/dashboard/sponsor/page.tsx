"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface MeUser { id: string; email: string; name?: string; role: string; }

const STATS = [
  { label: "Active Campaigns", value: "0", color: "#00FFFF" },
  { label: "Total Impressions", value: "0", color: "#FF2DAA" },
  { label: "Events Sponsored", value: "0", color: "#FFD700" },
  { label: "Monthly Spend", value: "$0", color: "#AA2DFF" },
];

const NAV = [
  { label: "Campaigns", href: "/sponsor/campaigns" },
  { label: "Rooms & Shows", href: "/sponsor/rooms" },
  { label: "Contests", href: "/sponsor/contests" },
  { label: "Analytics", href: "/sponsor/analytics" },
  { label: "Contracts", href: "/sponsor/contracts" },
  { label: "Payments", href: "/sponsor/payments" },
];

export default function SponsorDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/users/me", { cache: "no-store", credentials: "include" });
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
      <span style={{ color: "#00FFFF", fontSize: 13, letterSpacing: 4, fontWeight: 700 }}>LOADING SPONSOR HUB...</span>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#FF2DAA", fontWeight: 800, marginBottom: 4 }}>SPONSOR COMMAND CENTER</div>
        <h1 style={{ fontSize: "clamp(24px,4vw,42px)", fontWeight: 900, letterSpacing: 2, margin: 0 }}>SPONSOR HUB</h1>
        {user?.name && <div style={{ color: "#666", fontSize: 13, marginTop: 6 }}>Welcome back, {user.name}</div>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 28 }}>
        {STATS.map((s) => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${s.color}30`, borderRadius: 10, padding: "16px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color }} />
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, letterSpacing: 2, color: "#555", marginTop: 4, textTransform: "uppercase" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, marginBottom: 36 }}>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} style={{ display: "block", padding: "14px 18px", background: "rgba(0,255,255,0.04)", border: "1px solid rgba(0,255,255,0.15)", borderRadius: 10, color: "#00FFFF", textDecoration: "none", fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>
            {n.label} →
          </Link>
        ))}
      </div>

      <div style={{ background: "linear-gradient(135deg,rgba(255,45,170,0.08),rgba(0,255,255,0.06))", border: "1px solid rgba(255,45,170,0.2)", borderRadius: 14, padding: "24px", textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>Ready to get your brand on stage?</div>
        <div style={{ color: "#666", fontSize: 13, marginBottom: 16 }}>Sponsor live events, battles, and release parties seen by thousands of fans.</div>
        <Link href="/sponsor/payments" style={{ display: "inline-block", padding: "12px 32px", background: "linear-gradient(90deg,#FF2DAA,#AA2DFF)", borderRadius: 8, color: "#fff", fontWeight: 800, fontSize: 13, textDecoration: "none", letterSpacing: 1 }}>
          VIEW PACKAGES
        </Link>
      </div>
    </main>
  );
}