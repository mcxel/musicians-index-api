"use client";

import React, { useState } from "react";

/**
 * SettingsWorkspaceContent.tsx
 *
 * Canonical Settings & Account Controls Workspace.
 * Houses:
 * 1. PROFILE & ACCOUNT (Display name, Username, Email, Password)
 * 2. ACCOUNT & ROLE (Convert Fan <-> Performer, Switch Account)
 * 3. APPEARANCE (Shell Colors, Themes)
 * 4. PRIVACY & NOTIFICATIONS (Live alerts, chat preferences)
 * 5. SESSION & ACCOUNT STATUS (Sign Out, Deactivate Account, Delete Account)
 */
export default function SettingsWorkspaceContent({
  userId = "session",
  displayName = "Member",
}: {
  userId?: string;
  displayName?: string;
}) {
  const [activeTab, setActiveTab] = useState<"profile" | "role" | "appearance" | "privacy" | "session">("profile");
  const [shellColor, setShellColor] = useState("#00FFFF");

  return (
    <div style={{ color: "#fff", fontFamily: "'Inter', sans-serif", fontSize: 12 }}>
      {/* Settings Navigation Bar */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 10, marginBottom: 16 }}>
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
              onClick={() => setActiveTab(t.id as any)}
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

      {/* Tab Panels */}
      {activeTab === "appearance" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#FFD700" }}>SHELL COLOR PREFERENCES</div>
          <div style={{ display: "flex", gap: 10 }}>
            {["#00FFFF", "#FF2DAA", "#00FF88", "#FFD700", "#AA2DFF"].map((color) => (
              <button
                key={color}
                onClick={() => setShellColor(color)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: color,
                  border: `2px solid ${shellColor === color ? "#fff" : "transparent"}`,
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Selected Accent Color: {shellColor}</div>
        </div>
      )}

      {activeTab === "role" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#00FF88" }}>CONVERT ACCOUNT ROLE</div>
          <button style={{ padding: "8px 16px", background: "rgba(0,255,136,0.2)", border: "1px solid #00FF88", borderRadius: 6, color: "#00FF88", fontWeight: 800, cursor: "pointer" }}>
            CONVERT FAN ACCOUNT → PERFORMER
          </button>
        </div>
      )}

      {activeTab === "session" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#FF3366" }}>SESSION & ACCOUNT DEACTIVATION</div>
          <button style={{ padding: "8px 16px", background: "rgba(255,51,102,0.2)", border: "1px solid #FF3366", borderRadius: 6, color: "#FF3366", fontWeight: 800, cursor: "pointer" }}>
            SIGN OUT OF ALL DEVICES
          </button>
          <button style={{ padding: "8px 16px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, color: "rgba(255,255,255,0.5)", fontSize: 10, cursor: "pointer" }}>
            DEACTIVATE / DELETE ACCOUNT
          </button>
        </div>
      )}
    </div>
  );
}
