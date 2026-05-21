"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PersonaSwitcher } from "@/components/hud/PersonaSwitcher";

interface MeUser { id: string; email: string; name?: string; role: string; }

const STATS = [
  { label: "Events This Month", value: "0",  color: "#22c55e" },
  { label: "Tickets Sold",       value: "0",  color: "#00FFFF" },
  { label: "Capacity Used",      value: "0%", color: "#FFD700" },
  { label: "Revenue",            value: "$0", color: "#AA2DFF" },
];

const NAV = [
  { label: "Venue Hub",        href: "/hub/venue" },
  { label: "Booking Calendar", href: "/booking" },
  { label: "Ticketing",        href: "/tickets" },
  { label: "Seat Map",         href: "/seating" },
  { label: "Live Rooms",       href: "/rooms" },
  { label: "Analytics",        href: "/dashboard/venue/analytics" },
  { label: "Sponsor Board",    href: "/advertising" },
  { label: "My Profile",       href: "/profile" },
  { label: "Messages",         href: "/messages" },
  { label: "Settings",         href: "/settings" },
];

export default function VenueDashboardPage() {
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
      <span style={{ color: "#22c55e", fontSize: 13, letterSpacing: 4, fontWeight: 700 }}>LOADING VENUE HUB...</span>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff" }}>
      <div style={{ background: "rgba(0,0,0,0.7)", borderBottom: "1px solid rgba(34,197,94,0.2)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "#22c55e", fontWeight: 800, textTransform: "uppercase" }}>Venue Command Center</div>
          <div style={{ fontSize: 16, fontWeight: 900, marginTop: 2 }}>{user?.name ?? "Venue Operator"}</div>
        </div>
        <PersonaSwitcher currentRole="venue" compact />
      </div>
      <div style={{ padding: "28px 24px 80px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "clamp(24px,4vw,42px)", fontWeight: 900, letterSpacing: 2, margin: 0 }}>VENUE HUB</h1>
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
          <Link key={n.href} href={n.href} style={{
            display: "block", padding: "14px 18px",
            background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)",
            borderRadius: 10, color: "#22c55e", textDecoration: "none", fontWeight: 700, fontSize: 13, letterSpacing: 1,
          }}>
            {n.label} →
          </Link>
        ))}
      </div>

      <div style={{ background: "linear-gradient(135deg,rgba(34,197,94,0.08),rgba(0,255,255,0.06))", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 14, padding: "24px", textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>Build your venue empire on TMI.</div>
        <div style={{ color: "#666", fontSize: 13, marginBottom: 16 }}>Manage bookings, sell tickets, control your live rooms and sponsorships.</div>
        <Link href="/hub/venue" style={{
          display: "inline-block", padding: "12px 32px",
          background: "linear-gradient(90deg,#22c55e,#00FFFF)", borderRadius: 8,
          color: "#05060c", fontWeight: 800, fontSize: 13, textDecoration: "none", letterSpacing: 1,
        }}>
          ENTER VENUE HUB
        </Link>
      </div>
      </div>
    </main>
  );
}
