"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { PersonaSwitcher } from "@/components/hud/PersonaSwitcher";

interface SessionUser {
  id: string;
  name?: string;
  email: string;
  role: string;
  xp?: number;
}

export function TMIGlobalHUD() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [notifCount, setNotifCount] = useState(3);
  const [msgCount, setMsgCount] = useState(1);
  const [isLive, setIsLive] = useState(false);
  const [hudHovered, setHudHovered] = useState(false);
  const isHome = pathname === '/home/1' || pathname === '/';

  const goBackSafe = () => {
    if (typeof window !== 'undefined' && window.history.length > 2) {
      router.back();
      return;
    }
    router.push('/home/1');
  };

  useEffect(() => {
    // Check session
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((data: { authenticated?: boolean; user?: SessionUser }) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (pathname?.startsWith('/home')) {
      setExpanded(false);
    }
  }, [pathname]);

  // Only render when logged in
  if (!user) return null;
  if (pathname?.startsWith('/admin')) return null;

  const xp = user.xp ?? 0;
  const xpTier = xp >= 5000 ? "DIAMOND" : xp >= 3000 ? "PLATINUM" : xp >= 2000 ? "GOLD" : xp >= 1000 ? "SILVER" : xp >= 500 ? "PRO" : "FREE";
  const xpMax = 5000;
  const xpPct = Math.min(100, (xp / xpMax) * 100);

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 16,
          top: "auto",
          zIndex: 1000,
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, rgba(0,255,255,0.9), rgba(170,45,255,0.5) 55%, rgba(0,0,0,0.96) 100%)",
          border: "1px solid rgba(0,255,255,0.55)",
          color: "#00FFFF",
          fontSize: 14,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 22px rgba(0,255,255,0.3), 0 0 40px rgba(170,45,255,0.18)",
        }}
        aria-label="Open HUD"
      >
        ●
      </button>
    );
  }

  return (
    <div
      onMouseEnter={() => {
        setHudHovered(true);
        setExpanded(true);
      }}
      onMouseLeave={() => {
        setHudHovered(false);
        setExpanded(false);
      }}
      style={{
        position: "fixed",
        bottom: 20,
        right: 16,
        top: "auto",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      {/* Main HUD bar */}
      <div
        style={{
          pointerEvents: "all",
          background: "rgba(5,5,16,0.96)",
          border: "1px solid rgba(0,255,255,0.25)",
          borderRadius: 12,
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
          minWidth: 260,
          maxWidth: 320,
        }}
      >
        {/* Back + Home nav */}
        {!isHome && (
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <button
              onClick={goBackSafe}
              title="Go back"
              aria-label="Go back"
              style={{
                width: 28, height: 28, borderRadius: 7,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 700,
              }}
            >‹</button>
            <Link
              href="/home/1"
              title="Home"
              aria-label="Home"
              style={{
                width: 28, height: 28, borderRadius: 7,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                textDecoration: "none", fontSize: 13,
                color: "rgba(255,255,255,0.5)",
              }}
            >⌂</Link>
          </div>
        )}

        {/* Persona Switcher (compact) */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <PersonaSwitcher userId={user.id} currentRole={user.role} compact />
        </div>

        {/* Notification bell */}
        <Link
          href="/notifications"
          style={{
            position: "relative",
            width: 32,
            height: 32,
            borderRadius: 8,
            background: notifCount > 0 ? "rgba(255,45,170,0.12)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${notifCount > 0 ? "rgba(255,45,170,0.4)" : "rgba(255,255,255,0.08)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            textDecoration: "none",
            flexShrink: 0,
          }}
          onClick={() => setNotifCount(0)}
          aria-label="Notifications"
        >
          🔔
          {notifCount > 0 && (
            <span style={{
              position: "absolute",
              top: -4, right: -4,
              width: 16, height: 16,
              borderRadius: "50%",
              background: "#FF2DAA",
              fontSize: 8,
              fontWeight: 800,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {notifCount}
            </span>
          )}
        </Link>

        {/* Messages */}
        <Link
          href="/messages"
          style={{
            position: "relative",
            width: 32,
            height: 32,
            borderRadius: 8,
            background: msgCount > 0 ? "rgba(0,255,255,0.1)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${msgCount > 0 ? "rgba(0,255,255,0.3)" : "rgba(255,255,255,0.08)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            textDecoration: "none",
            flexShrink: 0,
          }}
          onClick={() => setMsgCount(0)}
          aria-label="Messages"
        >
          💬
          {msgCount > 0 && (
            <span style={{
              position: "absolute",
              top: -4, right: -4,
              width: 16, height: 16,
              borderRadius: "50%",
              background: "#00FFFF",
              fontSize: 8,
              fontWeight: 800,
              color: "#050510",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {msgCount}
            </span>
          )}
        </Link>

        {/* Live indicator */}
        <button
          onClick={() => setIsLive((v) => !v)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: isLive ? "rgba(255,45,170,0.15)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${isLive ? "rgba(255,45,170,0.5)" : "rgba(255,255,255,0.08)"}`,
            cursor: "pointer",
            fontSize: 10,
            fontWeight: 800,
            color: isLive ? "#FF2DAA" : "rgba(255,255,255,0.3)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Go live"
        >
          {isLive ? "🔴" : "⚫"}
        </button>

        {/* Collapse */}
        <button
          onClick={() => setExpanded(false)}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.3)",
            fontSize: 10,
            flexShrink: 0,
          }}
          aria-label="Collapse HUD"
        >
          ▶
        </button>
      </div>

      {/* XP bar — hidden by default, visible on HUD hover */}
      <div
        style={{
          pointerEvents: hudHovered ? "all" : "none",
          opacity: hudHovered ? 1 : 0,
          transform: hudHovered ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 200ms ease, transform 200ms ease",
          background: "rgba(5,5,16,0.9)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 10,
          padding: "8px 12px",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.1em" }}>XP</span>
          <span style={{ fontSize: 9, color: "#FFD700", fontWeight: 800 }}>{xpTier}</span>
        </div>
        <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${xpPct}%`, height: "100%", background: "linear-gradient(90deg,#AA2DFF,#FF2DAA)", borderRadius: 2 }} />
        </div>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginTop: 4, textAlign: "right" }}>{xp.toLocaleString()} / {xpMax.toLocaleString()} XP</div>
      </div>
    </div>
  );
}

export default TMIGlobalHUD;
