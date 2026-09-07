"use client";

/**
 * UniversalAccountDropdown — one shared account menu for every role.
 * Calls existing switch-role / companion-profile APIs; does not duplicate
 * authorization rules in React (Rule 31 ACCOUNT-SHELL, current-schema mode).
 */

import { useEffect, useRef, useState, useCallback, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ActiveProfileIdentity } from "@/lib/account/resolveActiveProfileIdentity";
import {
  resolveAccountShellCapabilities,
  resolveAccountHubDestination,
} from "@/lib/account/resolveAccountShellCapabilities";
import { clearPrivateClientAccountCache } from "@/lib/account/clearPrivateClientAccountCache";
import { selfPublicPath } from "@/lib/identity/PublicProfileRuntime";

export interface UniversalAccountDropdownProps {
  identity: ActiveProfileIdentity;
  open: boolean;
  onClose: () => void;
  anchorRight?: number;
  anchorTop?: number;
}

interface CompanionOffer {
  isFree: boolean;
  price: number;
  currency: string;
}

const rowStyle: CSSProperties = {
  display: "flex",
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.04em",
  color: "#fff",
  textDecoration: "none",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  textAlign: "left",
  alignItems: "center",
  gap: 8,
};

const ACCOUNT_MENU_IDLE_CLOSE_MS = 20_000;

export default function UniversalAccountDropdown({
  identity,
  open,
  onClose,
  anchorRight = 12,
  anchorTop = 56,
}: UniversalAccountDropdownProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [switchingRole, setSwitchingRole] = useState<string | null>(null);
  const [provisioningProfile, setProvisioningProfile] = useState<string | null>(null);
  const [companionOffers, setCompanionOffers] = useState<Record<"FAN" | "PERFORMER", CompanionOffer> | null>(null);

  const caps = resolveAccountShellCapabilities({
    ownedRoles: identity.ownedRoles,
    activeRole: identity.activeRole,
  });

  const resetIdleTimer = useCallback(() => {
    if (!open) return;
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      onClose();
    }, ACCOUNT_MENU_IDLE_CLOSE_MS);
  }, [open, onClose]);

  // Cleanup idle timer on unmount
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (open) {
      resetIdleTimer();
    } else if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, [open, resetIdleTimer]);

  useEffect(() => {
    if (!open) return;
    fetch("/api/account/companion-profile", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { offers?: Record<"FAN" | "PERFORMER", CompanionOffer> } | null) => {
        if (d?.offers) setCompanionOffers(d.offers);
      })
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      } else {
        resetIdleTimer();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else {
        resetIdleTimer();
      }
    };
    const onInteraction = () => resetIdleTimer();

    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);

    const panel = panelRef.current;
    if (panel) {
      panel.addEventListener("mousemove", onInteraction);
      panel.addEventListener("touchstart", onInteraction);
      panel.addEventListener("focusin", onInteraction);
    }

    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
      if (panel) {
        panel.removeEventListener("mousemove", onInteraction);
        panel.removeEventListener("touchstart", onInteraction);
        panel.removeEventListener("focusin", onInteraction);
      }
    };
  }, [open, onClose, resetIdleTimer]);

  // Close on route change
  useEffect(() => {
    if (!open) return;
    const onRouteChange = () => onClose();
    window.addEventListener("popstate", onRouteChange);
    // Next.js router events are omitted here, but standard navigation via router.push
    // inside this component triggers onClose() manually before navigating.
    return () => {
      window.removeEventListener("popstate", onRouteChange);
    };
  }, [open, onClose]);

  if (!open) return null;

  const publicPath = selfPublicPath({
    userId: identity.accountUserId,
    role: identity.activeRole,
    username: identity.publicHandle ?? null,
  });

  const handleRoleHubClick = async (targetRole: "FAN" | "PERFORMER") => {
    const dest = resolveAccountHubDestination(targetRole);

    // ACCOUNT-ROUTE-01: If already in target role, navigate directly without redundant API switch call
    if (caps.activeModeLabel.toUpperCase() === targetRole.toUpperCase()) {
      onClose();
      localStorage.setItem("tmi_last_workspace", targetRole.toLowerCase());
      router.push(dest);
      router.refresh();
      return;
    }

    if (switchingRole) return;
    setSwitchingRole(targetRole);
    try {
      const res = await fetch("/api/auth/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: targetRole }),
      });
      const data = (await res.json()) as { ok?: boolean; hubUrl?: string };
      if (res.ok && data.ok) {
        onClose();
        localStorage.setItem("tmi_last_workspace", targetRole.toLowerCase());
        const targetDest = data.hubUrl ?? dest;
        router.push(targetDest);
        router.refresh();
      }
    } catch {
      /* keep open */
    } finally {
      setSwitchingRole(null);
    }
  };

  const addCompanionProfile = async (targetProfile: "FAN" | "PERFORMER") => {
    if (provisioningProfile) return;
    setProvisioningProfile(targetProfile);
    try {
      const res = await fetch("/api/account/companion-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetProfile, switchToNewProfile: true }),
      });
      const data = (await res.json()) as { ok?: boolean; hubUrl?: string };
      if (res.ok && data.ok) {
        onClose();
        localStorage.setItem("tmi_last_workspace", targetProfile === "PERFORMER" ? "performer" : "fan");
        const dest = data.hubUrl ?? resolveAccountHubDestination(targetProfile);
        router.push(dest);
        router.refresh();
      }
    } catch {
      /* keep open */
    } finally {
      setProvisioningProfile(null);
    }
  };

  const handleLogout = async () => {
    onClose();
    clearPrivateClientAccountCache();
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      /* noop */
    }
    clearPrivateClientAccountCache();
    window.location.href = "/auth";
  };

  const offer = caps.companionOfferTarget ? companionOffers?.[caps.companionOfferTarget] : null;
  const priceLabel = offer ? (offer.isFree ? "FREE" : `$${(offer.price / 100).toFixed(2)}`) : "";

  return (
    <div
      ref={panelRef}
      data-testid="tmi-universal-account-dropdown"
      data-tmi-account-menu-panel="1"
      data-profile-kind={identity.profileKind}
      role="menu"
      style={{
        position: "fixed",
        top: anchorTop,
        right: anchorRight,
        width: "min(320px, calc(100vw - 16px))",
        maxHeight: "min(80vh, 560px)",
        overflowY: "auto",
        zIndex: 100000,
        background: "rgba(8, 8, 20, 0.98)",
        border: "1px solid rgba(255,45,170,0.35)",
        borderRadius: 12,
        boxShadow: "0 18px 48px rgba(0,0,0,0.55)",
        fontFamily: "inherit",
      }}
      onClick={() => resetIdleTimer()}
      onMouseEnter={() => resetIdleTimer()}
      onFocus={() => resetIdleTimer()}
    >
      <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.16em", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
          ACTIVE PROFILE
        </div>
        <div data-testid="tmi-active-profile-name" style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
          {identity.publicDisplayName}
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>
          {caps.activeModeLabel} mode
          {identity.publicHandle ? ` · @${identity.publicHandle}` : ""}
        </div>
        {identity.profileKind === "ACCOUNT_FALLBACK" && (
          <div
            data-testid="tmi-account-fallback-honesty"
            style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 6, lineHeight: 1.35 }}
          >
            One account identity (shared name/photo). Separate Fan/Performer profile names are not available yet.
          </div>
        )}
      </div>

      {caps.canSwitchFanPerformer && (
        <div style={{ padding: 10, borderBottom: "1px solid rgba(255,255,255,0.08)" }} data-testid="tmi-role-switch-row">
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
            SWITCH PROFILE
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {(["FAN", "PERFORMER"] as const).map((role) => (
              <button
                key={role}
                type="button"
                disabled={!!switchingRole}
                data-testid={`tmi-switch-to-${role.toLowerCase()}`}
                onClick={() => void handleRoleHubClick(role)}
                style={{
                  ...rowStyle,
                  justifyContent: "center",
                  flex: 1,
                  padding: "8px 6px",
                  fontSize: 10,
                  color: role === "FAN" ? "#00FFFF" : "#FF2DAA",
                  border: `1px solid ${role === "FAN" ? "rgba(0,255,255,0.3)" : "rgba(255,45,170,0.3)"}`,
                  background:
                    caps.activeModeLabel === role
                      ? role === "FAN"
                        ? "rgba(0,255,255,0.12)"
                        : "rgba(255,45,170,0.12)"
                      : "transparent",
                }}
              >
                {switchingRole === role ? "…" : role}
                {caps.activeModeLabel === role ? " · active" : ""}
              </button>
            ))}
          </div>
        </div>
      )}

      {caps.isAdmin && (
        <div style={{ padding: "6px 10px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Link
            href="/admin/overseer"
            onClick={onClose}
            data-testid="tmi-menu-admin-hub"
            style={{
              ...rowStyle,
              justifyContent: "center",
              border: "1px solid rgba(255,215,0,0.35)",
              background: "rgba(255,215,0,0.08)",
              color: "#FFD700",
              fontSize: 10,
              fontWeight: 900,
            }}
          >
            ADMIN HUB
          </Link>
        </div>
      )}

      {caps.companionOfferTarget && (
        <div style={{ padding: 10, borderBottom: "1px solid rgba(255,255,255,0.08)" }} data-testid="tmi-companion-cta"
          data-companion-container={caps.companionOfferTarget === "PERFORMER" ? "tmi-companion-add-performer" : "tmi-companion-add-fan"}>
          <button
            type="button"
            disabled={!!provisioningProfile || !companionOffers}
            data-testid={`tmi-btn-add-${caps.companionOfferTarget.toLowerCase()}`}
            data-companion-prompt={caps.companionOfferTarget === "PERFORMER" ? "tmi-btn-add-performer-free" : "tmi-btn-add-fan-free"}
            onClick={() => void addCompanionProfile(caps.companionOfferTarget!)}
            style={{
              ...rowStyle,
              justifyContent: "center",
              background: caps.companionOfferTarget === "PERFORMER" ? "#FF2DAA" : "#00FFFF",
              color: "#050510",
              fontSize: 10,
              fontWeight: 900,
            }}
          >
            {provisioningProfile
              ? "ADDING…"
              : `ADD ${caps.companionOfferTarget} ${priceLabel}`.trim()}
          </button>
        </div>
      )}

      {/* Contextual Tier Upgrade Link */}
      <div style={{ padding: "6px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link
          href={caps.activeModeLabel === "PERFORMER" ? "/pricing?role=performer" : "/pricing?role=fan"}
          onClick={onClose}
          data-testid={caps.activeModeLabel === "PERFORMER" ? "tmi-upgrade-performer-link" : "tmi-upgrade-fan-link"}
          style={{
            display: "block",
            textAlign: "center",
            padding: "6px 10px",
            borderRadius: 6,
            background: caps.activeModeLabel === "PERFORMER" ? "rgba(255,215,0,0.12)" : "rgba(0,255,255,0.12)",
            border: `1px solid ${caps.activeModeLabel === "PERFORMER" ? "#FFD700" : "#00FFFF"}44`,
            color: caps.activeModeLabel === "PERFORMER" ? "#FFD700" : "#00FFFF",
            fontSize: 9.5,
            fontWeight: 900,
            letterSpacing: "0.08em",
            textDecoration: "none",
          }}
        >
          {caps.activeModeLabel === "PERFORMER" ? "★ UPGRADE PERFORMER PROFILE" : "★ UPGRADE FAN PROFILE"}
        </Link>
      </div>
      <div style={{ padding: "6px 8px" }}>
        <Link href={publicPath} onClick={onClose} data-testid="tmi-menu-view-profile" style={rowStyle}>
          View Profile
        </Link>
        <Link href="/notifications" onClick={onClose} data-testid="tmi-menu-notifications" style={rowStyle}>
          Notifications
        </Link>
        <Link href="/settings?section=privacy" onClick={onClose} data-testid="tmi-menu-settings-privacy" style={rowStyle}>
          Settings & Privacy
        </Link>
        <Link href="/settings/billing" onClick={onClose} data-testid="tmi-menu-billing" style={rowStyle}>
          Subscription & Billing
        </Link>
        <Link href="/help" onClick={onClose} data-testid="tmi-menu-help" style={rowStyle}>
          Help & Support
        </Link>
        <button type="button" data-testid="tmi-menu-logout" onClick={() => void handleLogout()} style={{ ...rowStyle, color: "#FF3B5C" }}>
          Logout
        </button>
      </div>
    </div>
  );
}
