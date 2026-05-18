"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SessionData {
  authenticated: boolean;
  user: { id: string; email: string } | null;
  role: string;
  tier: string;
}

const TIER_LABEL: Record<string, string> = {
  DIAMOND: "💎 DIAMOND",
  GOLD: "🥇 GOLD",
  PRO: "⚡ PRO",
  FREE: "🎵 FREE",
};

const ROLE_COLOR: Record<string, string> = {
  performer: "#FF2DAA",
  artist: "#AA2DFF",
  fan: "#00FFFF",
  promoter: "#FFD700",
  admin: "#FF4444",
  user: "#00FFFF",
};

export default function MyProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store", credentials: "include" })
      .then((r) => r.json())
      .then((d: SessionData) => {
        if (!d.authenticated) {
          router.replace("/auth?next=/profile");
          return;
        }
        setSession(d);
      })
      .catch(() => router.replace("/auth?next=/profile"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "#060410", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 800 }}>LOADING PROFILE…</div>
      </main>
    );
  }

  if (!session) return null;

  const role = (session.role ?? "user").toLowerCase();
  const tier = (session.tier ?? "FREE").toUpperCase();
  const email = session.user?.email ?? "";
  const displayName = email.split("@")[0] ?? "User";
  const accentColor = ROLE_COLOR[role] ?? "#00FFFF";

  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(180deg, ${accentColor}14 0%, transparent 100%)`,
        borderBottom: `1px solid ${accentColor}22`,
        padding: "40px 24px 28px",
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {/* Avatar + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 16 }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: `${accentColor}22`, border: `2px solid ${accentColor}66`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, fontWeight: 900, color: accentColor,
              flexShrink: 0,
            }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 4px", letterSpacing: "-0.3px" }}>
                {displayName}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
                  color: accentColor, textTransform: "uppercase",
                  background: `${accentColor}18`, border: `1px solid ${accentColor}44`,
                  borderRadius: 4, padding: "2px 7px",
                }}>
                  {role}
                </span>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.5)", textTransform: "uppercase",
                }}>
                  {TIER_LABEL[tier] ?? tier}
                </span>
              </div>
            </div>
          </div>

          {/* Primary CTA — Enter Room */}
          <Link
            href="/rooms/world-dance-party"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "14px 28px", borderRadius: 28,
              background: `linear-gradient(135deg, ${accentColor}28, rgba(0,0,0,0))`,
              border: `1px solid ${accentColor}55`,
              color: accentColor, fontWeight: 900, fontSize: 14,
              textDecoration: "none", letterSpacing: "0.06em",
              marginBottom: 12,
            }}
          >
            🎵 Enter World Dance Party
          </Link>
        </div>
      </div>

      {/* Quick nav grid */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
          {[
            { label: "Dashboard", icon: "📊", href: role === "fan" || role === "user" ? "/dashboard/fan" : "/dashboard/artist", accent: "#00FFFF" },
            { label: "Messages", icon: "💬", href: "/messages", accent: "#FF2DAA" },
            { label: "Friends", icon: "👥", href: "/friends", accent: "#00FF88" },
            { label: "Rewards", icon: "🏆", href: "/rewards", accent: "#FFD700" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "14px 16px", borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                border: `1px solid rgba(255,255,255,0.07)`,
                color: "#fff", textDecoration: "none",
                transition: "border-color 0.15s",
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Role-specific profile link */}
        {(role === "performer" || role === "artist") && (
          <Link
            href={`/profile/performer/${displayName.toLowerCase().replace(/\s+/g, "-")}`}
            style={{
              display: "block", padding: "14px 20px", borderRadius: 12,
              background: "rgba(255,45,170,0.06)", border: "1px solid rgba(255,45,170,0.25)",
              color: "#FF2DAA", textDecoration: "none", fontSize: 13, fontWeight: 700,
              marginBottom: 12,
            }}
          >
            🎤 View Performer Profile →
          </Link>
        )}

        {/* Live rooms */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 12 }}>
            Live Rooms
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { name: "World Dance Party", href: "/rooms/world-dance-party", live: true, count: "2.8K", accent: "#FF2DAA" },
              { name: "Cypher Arena", href: "/rooms/cypher", live: true, count: "892", accent: "#AA2DFF" },
              { name: "Front Row", href: "/rooms/front-row", live: false, count: "—", accent: "#00FFFF" },
            ].map((room) => (
              <Link
                key={room.name}
                href={room.href}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px", borderRadius: 10,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                  color: "#fff", textDecoration: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {room.live && (
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "#00FF88", boxShadow: "0 0 6px #00FF88",
                      flexShrink: 0, display: "inline-block",
                    }} />
                  )}
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{room.name}</span>
                </div>
                <span style={{ fontSize: 11, color: room.live ? room.accent : "rgba(255,255,255,0.3)", fontWeight: 700 }}>
                  {room.live ? `${room.count} live` : "offline"}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Settings footer */}
        <div style={{ paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 8 }}>
          <Link href="/settings" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textDecoration: "none", fontWeight: 600 }}>Settings</Link>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
          <Link href="/api/auth/logout" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textDecoration: "none", fontWeight: 600 }}>Sign Out</Link>
        </div>
      </div>
    </main>
  );
}
