"use client";

/**
 * ProfileQuickPanel
 * ─────────────────────────────────────────────────────────────────────────────
 * Slide-up glassmorphic bottom-sheet that appears when the user taps their
 * profile icon on the fan dashboard header. Replaces the old full-page
 * navigation to /profile/fan/[id].
 *
 * Contains: avatar + name + tier, key stats, and action buttons that either
 * open inline canisters (Avatar, Inventory, Memory Wall) or navigate to
 * specific routes (Settings, Notifications, Messages, full Profile, Logout).
 *
 * Rule 14: every button resolves to a real destination.
 * Rule 20: no fake data — stats come from gamification engine.
 * Rule 26: Fan-only (avatar + inventory visible here per identity policy).
 */

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGamificationEngine } from "@/hooks/useGamificationEngine";
import { useTmiSession } from "@/hooks/SessionContext";

interface ProfileQuickPanelProps {
  fanId: string;
  open: boolean;
  onClose: () => void;
  /** Called when user taps "Avatar" — parent opens avatar canister */
  onOpenAvatar?: () => void;
  /** Called when user taps "Inventory" — parent opens inventory canister */
  onOpenInventory?: () => void;
  /** Called when user taps "Memory Wall" — parent opens memory wall canister */
  onOpenMemoryWall?: () => void;
}

const C = {
  bg: "rgba(6,4,20,0.96)",
  border: "rgba(0,240,255,0.18)",
  cyan: "#00FFFF",
  fuchsia: "#FF2DAA",
  gold: "#FFD700",
  purple: "#AA2DFF",
  text: "#e2e8f0",
  muted: "rgba(255,255,255,0.45)",
} as const;

function tierColor(tier: string): string {
  switch (tier.toUpperCase()) {
    case "DIAMOND": return C.cyan;
    case "PLATINUM": return "#E5E4E2";
    case "GOLD": return C.gold;
    case "SILVER": return "#C0C0C0";
    case "RUBY": return C.fuchsia;
    case "PRO": return C.purple;
    default: return "rgba(255,255,255,0.4)";
  }
}

export default function ProfileQuickPanel({
  fanId,
  open,
  onClose,
  onOpenAvatar,
  onOpenInventory,
  onOpenMemoryWall,
}: ProfileQuickPanelProps) {
  const router = useRouter();
  const { totalXp, walletCredits, currentLevel } = useGamificationEngine();
  const { userName } = useTmiSession();
  const panelRef = useRef<HTMLDivElement>(null);

  // Dismiss on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const go = useCallback(
    (path: string) => {
      onClose();
      router.push(path);
    },
    [onClose, router]
  );

  const handleLogout = useCallback(async () => {
    onClose();
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // ignore
    }
    router.push("/");
  }, [onClose, router]);

  if (!open) return null;

  const displayName = userName || fanId || "Fan";
  const tier = "FREE"; // TODO: wire real tier from session when available
  const initial = displayName.charAt(0).toUpperCase();

  const actions = [
    {
      icon: "👤",
      label: "My Profile",
      sub: "Public profile",
      onClick: () => go(`/profile/fan/${fanId}`),
    },
    {
      icon: "🎨",
      label: "Avatar",
      sub: "Customize your look",
      onClick: () => { onClose(); onOpenAvatar?.(); },
    },
    {
      icon: "🎒",
      label: "Inventory",
      sub: "Items & collectibles",
      onClick: () => { onClose(); onOpenInventory?.(); },
    },
    {
      icon: "📸",
      label: "Memory Wall",
      sub: "Your moments",
      onClick: () => { onClose(); onOpenMemoryWall?.(); },
    },
    {
      icon: "💬",
      label: "Messages",
      sub: "DMs & threads",
      onClick: () => go("/messages"),
    },
    {
      icon: "🔔",
      label: "Notifications",
      sub: "Alerts & updates",
      onClick: () => go("/notifications"),
    },
    {
      icon: "⚙️",
      label: "Settings",
      sub: "Account & privacy",
      onClick: () => go("/settings"),
    },
    {
      icon: "⭐",
      label: "Rewards",
      sub: "XP & achievements",
      onClick: () => go("/rewards"),
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleBackdropClick}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
          zIndex: 999998,
          WebkitBackdropFilter: "blur(4px)",
        }}
        aria-hidden="true"
      />

      {/* Slide-up panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Profile quick menu"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 999999,
          background: C.bg,
          border: `1.5px solid ${C.border}`,
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.7), 0 0 60px rgba(0,240,255,0.06)",
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
          animation: "panelSlideUp 0.22s cubic-bezier(0.2,0.8,0.2,1)",
          maxHeight: "88dvh",
          overflowY: "auto",
        }}
      >
        <style>{`
          @keyframes panelSlideUp {
            from { transform: translateY(100%); opacity: 0.4; }
            to   { transform: translateY(0);    opacity: 1;   }
          }
        `}</style>

        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.18)" }} />
        </div>

        {/* ── Profile header ── */}
        <div style={{ padding: "12px 20px 16px", display: "flex", alignItems: "center", gap: 14 }}>
          {/* Avatar circle */}
          <div style={{
            width: 54, height: 54, borderRadius: "50%",
            background: "linear-gradient(135deg,#AA2DFF,#FF2DAA)",
            border: `2px solid ${C.fuchsia}`,
            boxShadow: `0 0 16px rgba(255,45,170,0.3)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 900, color: "#fff",
            flexShrink: 0,
          }}>
            {initial}
          </div>

          {/* Name + tier */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayName}
            </div>
            <div style={{
              display: "inline-block",
              marginTop: 3,
              fontSize: 9, fontWeight: 900,
              letterSpacing: "0.1em",
              color: tierColor(tier),
              border: `1px solid ${tierColor(tier)}`,
              borderRadius: 4,
              padding: "2px 7px",
            }}>
              {tier}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close profile menu"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "50%",
              width: 32, height: 32,
              color: C.muted,
              fontSize: 16,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* ── Stats strip ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          marginBottom: 4,
        }}>
          {[
            { label: "XP", value: totalXp.toLocaleString(), color: C.purple },
            { label: "LEVEL", value: String(currentLevel.level), color: C.gold },
            { label: "COINS", value: String(walletCredits), color: C.cyan },
          ].map((s) => (
            <div key={s.label} style={{ padding: "10px 6px", textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 8, color: C.muted, letterSpacing: "0.08em", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Action grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, padding: "8px 12px 8px" }}>
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 12px",
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10,
                cursor: "pointer",
                color: C.text,
                textAlign: "left",
                margin: 2,
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{action.icon}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {action.label}
                </div>
                <div style={{ fontSize: 9, color: C.muted, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {action.sub}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ── Upgrade CTA (if FREE tier) ── */}
        {tier === "FREE" && (
          <div style={{ padding: "0 14px 8px" }}>
            <button
              onClick={() => go("/upgrade")}
              style={{
                width: "100%",
                padding: "12px",
                background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)",
                border: "none",
                borderRadius: 10,
                color: "#fff",
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.06em",
                cursor: "pointer",
              }}
            >
              ⭐ UPGRADE TO PRO
            </button>
          </div>
        )}

        {/* ── Log out ── */}
        <div style={{ padding: "4px 14px 12px" }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "11px",
              background: "rgba(255,68,68,0.08)",
              border: "1px solid rgba(255,68,68,0.2)",
              borderRadius: 10,
              color: "rgba(255,120,120,0.9)",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.06em",
              cursor: "pointer",
            }}
          >
            🚪 LOG OUT
          </button>
        </div>
      </div>
    </>
  );
}
