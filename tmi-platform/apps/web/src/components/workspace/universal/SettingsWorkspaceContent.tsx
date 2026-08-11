"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeEngine } from "@/lib/design/ThemeEngine";
import RoleSwitcherWidget from "@/components/navigation/RoleSwitcherWidget";

const SHELL_THEMES: { id: string; color: string; label: string }[] = [
  { id: "electric-ocean", color: "#00FFFF", label: "Cyan" },
  { id: "inferno", color: "#FF2DAA", label: "Fuchsia" },
  { id: "emerald-empire", color: "#00FF88", label: "Green" },
  { id: "sunset-boulevard", color: "#FFD700", label: "Gold" },
  { id: "neon-royal", color: "#AA2DFF", label: "Purple" },
];

/**
 * Canonical Settings drawer — Shell Colors live here only (not Operating Centers rail).
 */
export default function SettingsWorkspaceContent({
  userId = "session",
  displayName = "Member",
}: {
  userId?: string;
  displayName?: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "role" | "appearance" | "privacy" | "session">("profile");
  const [activeTheme, setActiveTheme] = useState(() => ThemeEngine.getActiveId());

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      router.push("/login");
    }
  };

  return (
    <div style={{ color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: 12 }}>
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { id: "profile", label: "PROFILE & ACCOUNT" },
          { id: "role", label: "ROLE & SWITCH" },
          { id: "appearance", label: "SHELL COLORS & THEME" },
          { id: "privacy", label: "PRIVACY & NOTIFS" },
          { id: "session", label: "SESSION & DEACTIVATION" },
        ].map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: `1px solid ${active ? "#00FFFF" : "transparent"}`,
                background: active ? "rgba(0,229,255,0.15)" : "transparent",
                color: active ? "#00FFFF" : "rgba(255,255,255,0.6)",
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 9,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === "profile" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#00FFFF" }}>PROFILE & ACCOUNT</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
            Display name: <strong>{displayName}</strong>
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>User ID: {userId}</div>
          <Link href="/settings" style={{ fontSize: 10, color: "#00FFFF" }}>
            Open full account settings →
          </Link>
        </div>
      )}

      {activeTab === "appearance" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#FFD700" }}>SHELL COLOR PREFERENCES</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {SHELL_THEMES.map(({ id, color, label }) => (
              <button
                key={id}
                type="button"
                title={label}
                onClick={() => {
                  ThemeEngine.apply(id);
                  setActiveTheme(id);
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: color,
                  border: `2px solid ${activeTheme === id ? "#fff" : "transparent"}`,
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
            Active theme: {activeTheme} · saved on this device
          </div>
        </div>
      )}

      {activeTab === "role" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#00FF88" }}>CONVERT ACCOUNT ROLE</div>
          <Link
            href="/onboarding/performer"
            style={{
              display: "inline-block",
              padding: "8px 16px",
              background: "rgba(0,255,136,0.2)",
              border: "1px solid #00FF88",
              borderRadius: 6,
              color: "#00FF88",
              fontWeight: 800,
              textDecoration: "none",
              fontSize: 10,
            }}
          >
            CONVERT FAN → PERFORMER
          </Link>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#AA2DFF", marginTop: 8 }}>SWITCH ACCOUNT</div>
          <RoleSwitcherWidget accentColor="#AA2DFF" />
        </div>
      )}

      {activeTab === "privacy" && (
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
          Live alert toggles and color picker deferred — honest empty until notification prefs API wired.
        </div>
      )}

      {activeTab === "session" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#FF3366" }}>SESSION & ACCOUNT DEACTIVATION</div>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            style={{
              padding: "8px 16px",
              background: "rgba(255,51,102,0.2)",
              border: "1px solid #FF3366",
              borderRadius: 6,
              color: "#FF3366",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            SIGN OUT
          </button>
          <Link
            href="/account-recovery"
            style={{
              display: "inline-block",
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 6,
              color: "rgba(255,255,255,0.5)",
              fontSize: 10,
              textDecoration: "none",
            }}
          >
            DEACTIVATE / DELETE ACCOUNT
          </Link>
        </div>
      )}
    </div>
  );
}
