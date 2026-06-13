"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ROLES = [
  { id: "fan",        label: "Fan",        icon: "🎉", color: "#00FFFF",  desc: "Watch, vote, collect, compete" },
  { id: "artist",     label: "Artist",     icon: "🎨", color: "#FF2DAA",  desc: "Release music, go live, earn" },
  { id: "performer",  label: "Performer",  icon: "🎤", color: "#AA2DFF",  desc: "Battle, perform, headline" },
  { id: "sponsor",    label: "Sponsor",    icon: "🤝", color: "#FFD700",  desc: "Brand rewards and campaigns" },
  { id: "advertiser", label: "Advertiser", icon: "📢", color: "#FF9500",  desc: "Run ads on TMI surfaces" },
  { id: "venue",      label: "Venue",      icon: "🏟️", color: "#00FF88", desc: "Host events and shows" },
  { id: "writer",     label: "Writer",     icon: "✏️", color: "#FF2DAA",  desc: "Create editorial content" },
  { id: "promoter",   label: "Promoter",   icon: "🎟️", color: "#AA2DFF", desc: "Manage tickets and events" },
];

function roleToDestination(role: string): string {
  if (role === "admin") return "/admin";
  const map: Record<string, string> = {
    artist:     "/dashboard/artist",
    performer:  "/dashboard/performer",
    fan:        "/dashboard/fan",
    sponsor:    "/dashboard/sponsor",
    advertiser: "/dashboard/advertiser",
    venue:      "/dashboard/venue",
    writer:     "/dashboard/writer",
    promoter:   "/dashboard/promoter",
  };
  return map[role] ?? "/hub/fan";
}

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [error, setError] = useState("");

  const roleOnboardingRoute = (roleId: string): string => {
    const map: Record<string, string> = {
      fan: "/onboarding/fan",
      artist: "/onboarding/artist",
      performer: "/onboarding/performer",
      sponsor: "/onboarding/sponsor",
      advertiser: "/onboarding/advertiser",
      venue: "/onboarding/venue",
      promoter: "/onboarding/promoter",
      writer: "/onboarding/writer",
    };
    return map[roleId] ?? "/start";
  };

  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store", credentials: "include" });
        if (!active) return;
        if (!res.ok) { router.replace("/auth?next=%2Fonboarding"); return; }
        const me = await res.json() as { authenticated?: boolean; user?: { role?: string } };
        if (!active) return;
        if (!me.authenticated) { router.replace("/auth?next=%2Fonboarding"); return; }
        const role = (me.user?.role ?? "user").toLowerCase();
        if (role !== "user") {
          router.replace(roleToDestination(role));
          return;
        }
      } catch { /* stay on page */ }
      if (active) setLoading(false);
    };
    void check();
    return () => { active = false; };
  }, [router]);

  const selectRole = (roleId: string) => {
    window.location.href = roleOnboardingRoute(roleId);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#050510", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#00FFFF", fontSize: 13, letterSpacing: 4, fontWeight: 700 }}>LOADING...</span>
      </div>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ maxWidth: 720, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800, marginBottom: 10 }}>WELCOME TO TMI</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>Choose Your Role</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginTop: 10 }}>
            Pick the role that best describes how you'll use the platform.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
          {ROLES.map((r) => (
            <button
              key={r.id}
              disabled={busy}
              onClick={() => void selectRole(r.id)}
              aria-label={`Continue as ${r.label}`}
              style={{
                display: "flex", flexDirection: "column", gap: 8, padding: "20px 16px",
                background: `${r.color}08`, border: `1px solid ${r.color}30`, borderRadius: 14,
                cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1,
                textAlign: "left", transition: "border-color 0.2s",
              }}
            >
              <span style={{ fontSize: 28 }}>{r.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: r.color, letterSpacing: "0.06em" }}>{r.label}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
                {busy && selectedRole === r.id ? "CONNECTING..." : r.desc}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#FF2DAA" }}>{error}</p>
        )}

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
          You can change your role later in account settings.
        </p>
      </div>
    </main>
  );
}
