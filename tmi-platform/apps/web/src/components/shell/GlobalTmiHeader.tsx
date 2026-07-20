"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface GlobalTmiHeaderProps {
  user?: {
    displayName?: string;
    email?: string;
    role?: string;
    avatarUrl?: string;
  } | null;
}

export default function GlobalTmiHeader({ user }: GlobalTmiHeaderProps) {
  const pathname = usePathname();
  const [sessionUser, setSessionUser] = useState(user ?? null);

  useEffect(() => {
    if (user !== undefined) {
      setSessionUser(user);
      return;
    }
    let active = true;
    fetch("/api/auth/session", { cache: "no-store", credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data?.authenticated && data?.user) {
          setSessionUser({
            displayName: data.user.name || data.user.email?.split("@")[0] || "User",
            email: data.user.email,
            role: data.role || data.user.role || "FAN",
            avatarUrl: data.user.avatarUrl,
          });
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user]);

  const navLinks = [
    { label: "1", href: "/home/1", title: "Home 1: Crown Orbit" },
    { label: "1-2", href: "/home/1-2", title: "Home 1-2: Billboard Wall" },
    { label: "2", href: "/home/2", title: "Home 2: Live Lobbies" },
    { label: "3", href: "/home/3", title: "Home 3: Magazine" },
    { label: "4", href: "/home/4", title: "Home 4: Marketplace" },
    { label: "5", href: "/home/5", title: "Home 5: Arena" },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 99999,
        width: "100%",
        background: "rgba(5, 5, 16, 0.95)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255, 45, 170, 0.25)",
        boxSizing: "border-box",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── ROW 1: TMI BRAND & AUTH / ACCOUNT CONTROLS ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 16px",
          minHeight: 48,
          gap: 12,
        }}
      >
        {/* Brand */}
        <Link href="/home/1" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FF2DAA, #AA2DFF)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 13,
              color: "#fff",
              boxShadow: "0 0 10px rgba(255,45,170,0.6)",
            }}
          >
            T
          </div>
          <span style={{ fontSize: 13, fontWeight: 900, color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            TMI <span style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>FLIGHT DECK</span>
          </span>
        </Link>

        {/* Auth or Account Controls (Strictly isolated in right corner) */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {sessionUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Link
                href="/settings/profile"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  textDecoration: "none",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,45,170,0.3)",
                  borderRadius: 20,
                  padding: "4px 10px",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#5b217a,#301042)",
                    border: "1px solid #FF2DAA",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 900,
                    color: "#fff",
                  }}
                >
                  {sessionUser.displayName?.[0]?.toUpperCase() || "U"}
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {sessionUser.displayName}
                </span>
                <span
                  style={{
                    fontSize: 7,
                    fontWeight: 900,
                    color: "#FF2DAA",
                    background: "rgba(255,45,170,0.15)",
                    padding: "1px 5px",
                    borderRadius: 4,
                  }}
                >
                  {sessionUser.role}
                </span>
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Link
                href="/auth"
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#00FFFF",
                  textDecoration: "none",
                  padding: "6px 12px",
                  borderRadius: 6,
                  background: "rgba(0,255,255,0.08)",
                  border: "1px solid rgba(0,255,255,0.25)",
                }}
              >
                LOGIN
              </Link>
              <Link
                href="/signup"
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: "#050510",
                  textDecoration: "none",
                  padding: "6px 12px",
                  borderRadius: 6,
                  background: "linear-gradient(135deg,#FFD700,#FF9500)",
                }}
              >
                SIGN UP
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 2: HOMEPAGE ROTATION NAVIGATION (1, 1-2, 2, 3, 4, 5) ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: "4px 12px 8px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          overflowX: "auto",
        }}
      >
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              title={link.title}
              style={{
                display: "block",
                width: isActive ? 24 : 6,
                height: 6,
                borderRadius: 3,
                background: isActive ? "#FFD700" : "rgba(255,255,255,0.25)",
                boxShadow: isActive ? "0 0 8px rgba(255,215,0,0.7)" : "none",
                transition: "all 0.25s ease",
                flexShrink: 0,
              }}
            />
          );
        })}
      </div>
    </header>
  );
}
