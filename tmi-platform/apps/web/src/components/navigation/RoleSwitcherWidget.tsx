"use client";

/**
 * RoleSwitcherWidget
 *
 * A compact toggle button that opens/closes a floating panel.
 * The panel lists every role the current account holds.
 * Clicking a role tile switches the active role and navigates to that hub.
 *
 * Rules:
 *  - Only renders if the user holds 2+ roles (invisible otherwise)
 *  - Panel is dismissable via ESC, backdrop click, or the toggle button
 *  - Calls POST /api/auth/switch-role → sets tmi_role cookie → navigates
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useRouter } from "next/navigation";

// ─── Role metadata ────────────────────────────────────────────────────────────

interface RoleDef {
  id: string;
  label: string;
  icon: string;
  color: string;
  hubUrl: string;
}

const ROLE_DEFS: RoleDef[] = [
  { id: "ADMIN",      label: "ADMIN DECK",     icon: "⚡", color: "#FFD700", hubUrl: "/admin" },
  { id: "PERFORMER",  label: "PERFORMER HUB",  icon: "🎤", color: "#FF2DAA", hubUrl: "/hub/performer" },
  { id: "ARTIST",     label: "ARTIST HUB",     icon: "🎙️", color: "#FF2DAA", hubUrl: "/hub/artist" },
  { id: "BAND",       label: "BAND HUB",       icon: "🎸", color: "#AA2DFF", hubUrl: "/hub/performer" },
  { id: "FAN",        label: "FAN HUB",        icon: "🎵", color: "#00FFFF", hubUrl: "/hub/fan" },
  { id: "USER",       label: "FAN HUB",        icon: "🎵", color: "#00FFFF", hubUrl: "/hub/fan" },
  { id: "MEMBER",     label: "FAN HUB",        icon: "🎵", color: "#00FFFF", hubUrl: "/hub/fan" },
  { id: "VENUE",      label: "VENUE HUB",      icon: "🏟️", color: "#00D4FF", hubUrl: "/hub/venue" },
  { id: "PROMOTER",   label: "PROMOTER HUB",   icon: "📣", color: "#FF6B35", hubUrl: "/hub/promoter" },
  { id: "SPONSOR",    label: "SPONSOR HUB",    icon: "🤝", color: "#C0C0C0", hubUrl: "/hub/sponsor" },
  { id: "ADVERTISER", label: "ADVERTISER HUB", icon: "📊", color: "#E5E4E2", hubUrl: "/hub/advertiser" },
  { id: "WRITER",     label: "WRITER HUB",     icon: "✍️", color: "#A3E635", hubUrl: "/hub/writer" },
  { id: "STAFF",      label: "STAFF DECK",     icon: "🛡️", color: "#F59E0B", hubUrl: "/admin" },
];

function getRoleDef(role: string): RoleDef {
  return (
    ROLE_DEFS.find((d) => d.id === role.toUpperCase()) ?? {
      id: role,
      label: role,
      icon: "👤",
      color: "#888",
      hubUrl: "/home/1",
    }
  );
}

// ─── Keyframe styles ──────────────────────────────────────────────────────────

const CSS = `
@keyframes tmiRSWIn {
  from { opacity: 0; transform: translateY(-10px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}
@keyframes tmiRSWTileIn {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes tmiRSWSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes tmiRSWGlow {
  0%,100% { box-shadow: 0 0 0 0 currentColor; }
  50%     { box-shadow: 0 0 0 8px transparent; }
}
`;

// ─── Main component ───────────────────────────────────────────────────────────

interface RoleSwitcherWidgetProps {
  /** Accent color used for the trigger button (matches surrounding UI). */
  accentColor?: string;
  /** Label shown on the trigger button. */
  buttonLabel?: string;
}

export default function RoleSwitcherWidget({
  accentColor = "#00FFFF",
  buttonLabel,
}: RoleSwitcherWidgetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [switching, setSwitching] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Fetch available roles once on mount
  useEffect(() => {
    fetch("/api/auth/my-roles", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d: { roles?: string[]; activeRole?: string | null }) => {
        setRoles(d.roles ?? []);
        setActiveRole(d.activeRole ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Dismiss on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Dismiss on ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const switchRole = useCallback(
    async (role: string) => {
      if (switching) return;
      setSwitching(role);
      try {
        const res = await fetch("/api/auth/switch-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          setActiveRole(role);
          setOpen(false);
          // Small delay so panel closes before navigation
          setTimeout(() => {
            router.push(data.hubUrl ?? getRoleDef(role).hubUrl);
            router.refresh();
          }, 150);
        }
      } catch {
        // silent — keep panel open
      } finally {
        setSwitching(null);
      }
    },
    [router, switching],
  );

  // Don't render if only one role (nothing to switch between)
  if (!loading && roles.length < 2) return null;

  const currentRole = activeRole ?? roles[0] ?? "USER";
  const currentDef = getRoleDef(currentRole);

  const triggerStyle: CSSProperties = {
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: "0.1em",
    padding: "6px 10px",
    borderRadius: 8,
    cursor: "pointer",
    border: `1px solid ${open ? accentColor : accentColor + "66"}`,
    background: open ? `${accentColor}22` : "rgba(255,255,255,0.04)",
    color: accentColor,
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    gap: 5,
    transition: "all 0.15s ease",
    position: "relative",
  };

  return (
    <>
      <style>{CSS}</style>

      {/* ── Trigger button ── */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={triggerStyle}
        title="Switch active role"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span style={{ fontSize: 12 }}>{currentDef.icon}</span>
        <span>{buttonLabel ?? currentDef.label}</span>
        <span
          style={{
            display: "inline-block",
            transition: "transform 0.2s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            opacity: 0.6,
          }}
        >
          ▾
        </span>
      </button>

      {/* ── Floating panel ── */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Role switcher panel"
          style={{
            position: "fixed",
            top: 54,
            right: 12,
            zIndex: 9999,
            width: 300,
            background:
              "linear-gradient(160deg, rgba(6,7,13,0.98), rgba(10,6,20,0.99))",
            border: `1px solid ${accentColor}44`,
            borderRadius: 14,
            padding: "16px",
            boxShadow: `0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px ${accentColor}22`,
            backdropFilter: "blur(16px)",
            animation: "tmiRSWIn 0.2s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                  color: accentColor,
                }}
              >
                SWITCH ROLE
              </div>
              <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>
                Active:{" "}
                <span style={{ color: currentDef.color }}>
                  {currentDef.label}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 6,
                color: "#666",
                width: 26,
                height: 26,
                cursor: "pointer",
                fontSize: 14,
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Role tiles */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px 0",
                  color: "#555",
                  fontSize: 11,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    animation: "tmiRSWSpin 0.8s linear infinite",
                  }}
                >
                  ⟳
                </span>{" "}
                Loading roles…
              </div>
            ) : (
              roles.map((role, i) => {
                const def = getRoleDef(role);
                const isCurrent =
                  role.toUpperCase() === currentRole.toUpperCase();
                const isSwitching = switching === role;

                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => switchRole(role)}
                    disabled={isCurrent || !!switching}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: `1px solid ${isCurrent ? def.color + "88" : def.color + "33"}`,
                      background: isCurrent
                        ? `${def.color}18`
                        : "rgba(255,255,255,0.03)",
                      color: isCurrent ? def.color : "#ccc",
                      cursor: isCurrent || switching ? "default" : "pointer",
                      textAlign: "left",
                      fontFamily: "inherit",
                      opacity: switching && !isSwitching ? 0.45 : 1,
                      transition: "all 0.15s ease",
                      animation: `tmiRSWTileIn 0.2s ease ${i * 0.05}s both`,
                    }}
                  >
                    {/* Icon */}
                    <span
                      style={{
                        fontSize: 22,
                        lineHeight: 1,
                        animation: isSwitching
                          ? "tmiRSWSpin 0.6s linear infinite"
                          : undefined,
                      }}
                    >
                      {isSwitching ? "⟳" : def.icon}
                    </span>

                    {/* Label + info */}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 900,
                          letterSpacing: "0.08em",
                          color: def.color,
                        }}
                      >
                        {def.label}
                      </div>
                      <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>
                        {def.hubUrl}
                      </div>
                    </div>

                    {/* Status badge */}
                    {isCurrent && (
                      <span
                        style={{
                          fontSize: 8,
                          fontWeight: 900,
                          letterSpacing: "0.1em",
                          color: def.color,
                          border: `1px solid ${def.color}55`,
                          borderRadius: 4,
                          padding: "2px 6px",
                          background: `${def.color}15`,
                        }}
                      >
                        ACTIVE
                      </span>
                    )}
                    {isSwitching && (
                      <span
                        style={{
                          fontSize: 8,
                          fontWeight: 900,
                          letterSpacing: "0.08em",
                          color: "#FFD700",
                        }}
                      >
                        SWITCHING…
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: 12,
              paddingTop: 10,
              borderTop: "1px solid rgba(255,255,255,0.06)",
              fontSize: 9,
              color: "#444",
              letterSpacing: "0.06em",
            }}
          >
            Switching updates your active session and navigates to that hub.
          </div>
        </div>
      )}
    </>
  );
}
