"use client";

/**
 * UniversalCommandController.tsx — Universal Persona Switcher & Command Display Hub
 * The Musician's Index | BerntoutGlobal LLC
 *
 * Mounts in the bottom-left sticky dock of Overseer Flight Deck.
 * Replaces the legacy `admin-concierge-dock-trigger`.
 *
 * Provides:
 * 1. Triad Persona Switching (ADMIN <-> FAN <-> PERFORMER) via canonical `performPersonaSwitch`
 * 2. Display Launcher & Presentation Routing (Send Revenue, Bots, Health to Panel or Monitor)
 * 3. Monitor Attachment & Display-Only Quick Mode
 * 4. Account Settings & Sign Out
 */

import { useState, useRef, useEffect } from "react";
import { performPersonaSwitch, type PersonaSwitchRole } from "@/lib/auth/performPersonaSwitch";
import type { AttachedMonitorCount } from "@/lib/admin/AdminMonitorLayoutResolver";

export interface UniversalCommandControllerProps {
  currentPersona?: string;
  activeMonitorCount?: AttachedMonitorCount;
  onSetMonitorCount?: (count: AttachedMonitorCount) => void;
  onLaunchPresentation?: (presentationId: string, target: "LEFT" | "RIGHT" | "EXPAND" | "MONITOR_B") => void;
}

export default function UniversalCommandController({
  currentPersona = "ADMIN",
  activeMonitorCount = 4,
  onSetMonitorCount,
  onLaunchPresentation,
}: UniversalCommandControllerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState<string | null>(null);
  const [switchError, setSwitchError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  const handlePersonaSwitch = async (role: PersonaSwitchRole) => {
    if (switchingRole) return;
    setSwitchingRole(role);
    setSwitchError(null);
    try {
      const result = await performPersonaSwitch(role);
      if (result.ok && result.hubUrl) {
        window.location.href = result.hubUrl;
        return;
      }
      setSwitchError(result.error ?? "Failed to switch persona.");
    } catch {
      setSwitchError("Network error switching persona.");
    } finally {
      setSwitchingRole(null);
    }
  };

  return (
    <div
      ref={menuRef}
      style={{ position: "relative", display: "inline-block" }}
      data-testid="universal-command-controller"
      data-persona={currentPersona}
    >
      {/* Dock Trigger Button */}
      <button
        type="button"
        data-testid="universal-command-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "8px 16px",
          background: "linear-gradient(180deg, #5b217a 0%, #200b2e 100%)",
          border: isOpen ? "2px solid #00FFFF" : "2px solid #D4AF37",
          borderRadius: 10,
          color: isOpen ? "#00FFFF" : "#ffe3a3",
          fontWeight: 900,
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          cursor: "pointer",
          boxShadow: isOpen
            ? "0 0 16px rgba(0,255,255,0.4)"
            : "0 3px 10px rgba(0,0,0,0.6)",
          transition: "all 160ms ease",
        }}
        title="Universal Account / Persona / Command Display Center"
      >
        <span style={{ fontSize: 13 }}>⚡</span>
        <span>{currentPersona}</span>
        <span style={{ fontSize: 9, opacity: 0.7 }}>{isOpen ? "▼" : "▲"}</span>
      </button>

      {/* Upward Flying Command Palette */}
      {isOpen ? (
        <div
          data-testid="command-palette-flyout"
          style={{
            position: "absolute",
            bottom: "calc(100% + 10px)",
            left: 0,
            width: 340,
            maxWidth: "92vw",
            background: "linear-gradient(180deg, #0d0f22 0%, #060712 100%)",
            border: "2px solid #D4AF37",
            borderRadius: 12,
            boxShadow: "0 12px 36px rgba(0,0,0,0.85), 0 0 24px rgba(212,175,55,0.25)",
            padding: 12,
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            animation: "tmiRSWIn 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255,215,0,0.25)",
              paddingBottom: 8,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  color: "#FFD700",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                Command & Display Center
              </span>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>
                ACTIVE PERSONA: {currentPersona}
              </div>
            </div>
            <button
              type="button"
              data-testid="command-flyout-close-btn"
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              ✕
            </button>
          </div>

          {/* Section 1: Triad Persona Switcher */}
          <div>
            <div
              style={{
                fontSize: 7.5,
                fontWeight: 900,
                color: "#00FFFF",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Switch Account Persona
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              <button
                type="button"
                data-testid="persona-switch-admin"
                onClick={() => handlePersonaSwitch("ADMIN")}
                disabled={switchingRole !== null || currentPersona === "ADMIN"}
                style={personaTile(currentPersona === "ADMIN", "#FFD700")}
              >
                <span style={{ fontSize: 14 }}>⚡</span>
                <span style={{ fontSize: 8, fontWeight: 900 }}>ADMIN</span>
              </button>

              <button
                type="button"
                data-testid="persona-switch-fan"
                onClick={() => handlePersonaSwitch("FAN")}
                disabled={switchingRole !== null}
                style={personaTile(false, "#00FFFF")}
              >
                <span style={{ fontSize: 14 }}>🎵</span>
                <span style={{ fontSize: 8, fontWeight: 900 }}>
                  {switchingRole === "FAN" ? "Switching..." : "FAN HUB"}
                </span>
              </button>

              <button
                type="button"
                data-testid="persona-switch-performer"
                onClick={() => handlePersonaSwitch("PERFORMER")}
                disabled={switchingRole !== null}
                style={personaTile(false, "#FF2DAA")}
              >
                <span style={{ fontSize: 14 }}>🎤</span>
                <span style={{ fontSize: 8, fontWeight: 900 }}>
                  {switchingRole === "PERFORMER" ? "Switching..." : "PERFORMER"}
                </span>
              </button>
            </div>
            {switchError ? (
              <div style={{ color: "#ff4444", fontSize: 8, marginTop: 4 }}>{switchError}</div>
            ) : null}
          </div>

          {/* Section 2: Display Routing & Launching */}
          <div>
            <div
              style={{
                fontSize: 7.5,
                fontWeight: 900,
                color: "#AA2DFF",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Quick Presentation Routing
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
              <button
                type="button"
                onClick={() => onLaunchPresentation?.("revenue", "EXPAND")}
                style={commandLaunchBtn("#FFD700")}
              >
                <span>💰 REVENUE</span>
                <span style={{ fontSize: 7, opacity: 0.7 }}>EXPAND</span>
              </button>
              <button
                type="button"
                onClick={() => onLaunchPresentation?.("bots", "EXPAND")}
                style={commandLaunchBtn("#00FFFF")}
              >
                <span>🤖 BOT INTEL</span>
                <span style={{ fontSize: 7, opacity: 0.7 }}>EXPAND</span>
              </button>
              <button
                type="button"
                onClick={() => onLaunchPresentation?.("sentinel", "RIGHT")}
                style={commandLaunchBtn("#FF4444")}
              >
                <span>🛡️ SECURITY</span>
                <span style={{ fontSize: 7, opacity: 0.7 }}>RIGHT RAIL</span>
              </button>
              <button
                type="button"
                onClick={() => onLaunchPresentation?.("accounts", "RIGHT")}
                style={commandLaunchBtn("#AA2DFF")}
              >
                <span>🔗 LINKER</span>
                <span style={{ fontSize: 7, opacity: 0.7 }}>RIGHT RAIL</span>
              </button>
            </div>
          </div>

          {/* Section 3: Monitor Count / Display-Only Mode */}
          {onSetMonitorCount ? (
            <div>
              <div
                style={{
                  fontSize: 7.5,
                  fontWeight: 900,
                  color: "#FFD700",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Monitor Elasticity (Attached: {activeMonitorCount})
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => onSetMonitorCount(0)}
                  style={monitorCountBtn(activeMonitorCount === 0)}
                  title="Collapse monitors; rise operational display deck"
                >
                  DISPLAY (0)
                </button>
                {([1, 2, 4, 8] as AttachedMonitorCount[]).map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => onSetMonitorCount(count)}
                    style={monitorCountBtn(activeMonitorCount === count)}
                  >
                    {count}M
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Section 4: Account Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: 8,
            }}
          >
            <a
              href="/admin/settings"
              style={{
                fontSize: 8.5,
                color: "rgba(255,255,255,0.6)",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              ⚙️ Settings
            </a>
            <a
              href="/api/auth/logout" data-canonical-logout="1"
              style={{
                fontSize: 8.5,
                color: "#ff6b6b",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Sign Out
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function personaTile(active: boolean, accent: string) {
  return {
    display: "flex" as const,
    flexDirection: "column" as const,
    alignItems: "center" as const,
    gap: 4,
    padding: "8px 4px",
    borderRadius: 8,
    border: active ? `2px solid ${accent}` : `1px solid ${accent}40`,
    background: active ? `${accent}20` : "rgba(0,0,0,0.4)",
    color: active ? accent : "#fff",
    cursor: active ? "default" as const : "pointer" as const,
    transition: "all 140ms ease",
  };
}

function commandLaunchBtn(accent: string) {
  return {
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    padding: "5px 8px",
    borderRadius: 6,
    border: `1px solid ${accent}40`,
    background: "rgba(0,0,0,0.35)",
    color: accent,
    fontSize: 8,
    fontWeight: 800,
    cursor: "pointer" as const,
    transition: "all 120ms ease",
  };
}

function monitorCountBtn(active: boolean) {
  return {
    padding: "3px 7px",
    borderRadius: 4,
    border: active ? "1px solid #00FFFF" : "1px solid rgba(255,215,0,0.3)",
    background: active ? "rgba(0,255,255,0.2)" : "rgba(0,0,0,0.4)",
    color: active ? "#00FFFF" : "#FFD700",
    fontSize: 7.5,
    fontWeight: 900,
    cursor: "pointer" as const,
  };
}
