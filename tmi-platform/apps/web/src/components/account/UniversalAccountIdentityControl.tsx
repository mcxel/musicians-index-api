"use client";

/**
 * UniversalAccountIdentityControl — single shared identity circle for the
 * global header (Rule 31 ACCOUNT-SHELL). Photo if available, else accurate
 * initials from ActiveProfileIdentity. Click opens UniversalAccountDropdown.
 *
 * Phase 0 escape law: this is the universal persona/account control — not
 * Admin Concierge, not a role-specific deck chrome. Menu must open reliably
 * on mobile (touch target + z-index + no outside-click race with trigger).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ActiveProfileIdentity } from "@/lib/account/ActiveProfileIdentity";
import { resolveAccountShellCapabilities } from "@/lib/account/resolveAccountShellCapabilities";
import UniversalAccountDropdown from "@/components/account/UniversalAccountDropdown";

export interface UniversalAccountIdentityControlProps {
  /** Optional seed while /api/account/identity loads. */
  fallbackDisplayName?: string;
  fallbackAvatarUrl?: string | null;
  compact?: boolean;
}

function modeColor(activeRole: string): string {
  const r = activeRole.toUpperCase();
  if (r === "FAN" || r === "MEMBER" || r === "USER") return "#00FFFF";
  if (r === "PERFORMER" || r === "ARTIST" || r === "BAND") return "#FF2DAA";
  if (r === "ADMIN" || r === "STAFF" || r === "SUPERADMIN") return "#FFD700";
  return "#888";
}

function readHubShellCookie(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)tmi_hub_shell=([^;]+)/);
  return m?.[1]?.trim().toLowerCase() ?? null;
}

export default function UniversalAccountIdentityControl({
  fallbackDisplayName = "Account",
  fallbackAvatarUrl = null,
  compact = true,
}: UniversalAccountIdentityControlProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [identity, setIdentity] = useState<ActiveProfileIdentity | null>(null);
  const [myRoles, setMyRoles] = useState<string[]>([]);
  const [identityError, setIdentityError] = useState(false);
  const [panelPos, setPanelPos] = useState<{ top: number; left?: number; right?: number }>({
    top: 56,
    right: 12,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const hydrate = useCallback(async () => {
    try {
      const [idRes, rolesRes] = await Promise.all([
        fetch("/api/account/identity", {
          cache: "no-store",
          credentials: "include",
        }),
        fetch("/api/auth/my-roles", {
          cache: "no-store",
          credentials: "include",
        }),
      ]);
      if (idRes.ok) {
        const data = (await idRes.json()) as { identity?: ActiveProfileIdentity };
        if (data.identity) setIdentity(data.identity);
      }
      if (rolesRes.ok) {
        const data = (await rolesRes.json()) as { ok?: boolean; roles?: string[] };
        if (data.ok === false) {
          setIdentityError(true);
        } else {
          setMyRoles((data.roles ?? []).map((r) => String(r).toUpperCase()));
        }
      } else {
        setIdentityError(true);
      }
    } catch {
      setIdentityError(true);
    }
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (open) void hydrate();
  }, [hydrate, open]);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vw = typeof window !== "undefined" ? window.innerWidth : 390;
    const vh = typeof window !== "undefined" ? window.innerHeight : 844;
    const isMobile = vw <= 640;
    const panelWidth = Math.min(320, vw - 16);

    const top = Math.min(
      Math.round(rect.bottom + 8),
      Math.max(8, vh - 120),
    );

    if (isMobile) {
      // Collision-aware mobile placement: clamp within safe margins [8px, vw - 8px]
      const left = Math.max(8, Math.round((vw - panelWidth) / 2));
      setPanelPos({ top, left });
    } else {
      // Desktop: place inward toward the side with sufficient clearance
      const spaceRight = vw - rect.left;
      if (spaceRight >= panelWidth + 8) {
        setPanelPos({ top, left: Math.max(8, Math.round(rect.left)) });
      } else {
        setPanelPos({ top, right: Math.max(8, Math.round(vw - rect.right)) });
      }
    }
  }, [open]);

  const mergedIdentity = useMemo((): ActiveProfileIdentity | null => {
    if (!identity && myRoles.length === 0) return null;
    const base: ActiveProfileIdentity = identity ?? {
      accountUserId: "pending",
      profileKind: "ACCOUNT_FALLBACK",
      activeRole: "FAN",
      ownedRoles: ["FAN"],
      profileComplete: false,
      publicDisplayName: fallbackDisplayName,
      publicHandle: null,
      publicImageUrl: fallbackAvatarUrl,
      canonicalInitials: fallbackDisplayName.trim()[0]?.toUpperCase() ?? "?",
    };
    const ownedRoles = Array.from(
      new Set([...(base.ownedRoles ?? []).map((r) => r.toUpperCase()), ...myRoles]),
    );
    // Admin oversight: navigate-only keeps permanent ADMIN role but tmi_hub_shell
    // marks the active experience — reflect that so FAN/PERFORMER highlight correctly.
    const shell = readHubShellCookie();
    let activeRole = base.activeRole;
    const isAdminCapable = ownedRoles.some((r) =>
      ["ADMIN", "STAFF", "SUPERADMIN"].includes(r),
    );
    if (isAdminCapable && shell === "fan") activeRole = "FAN";
    if (isAdminCapable && shell === "performer") activeRole = "PERFORMER";
    if (isAdminCapable && shell === "admin") activeRole = "ADMIN";
    return { ...base, ownedRoles, activeRole };
  }, [identity, myRoles, fallbackDisplayName, fallbackAvatarUrl]);

  const displayName = mergedIdentity?.publicDisplayName ?? fallbackDisplayName;
  const avatarUrl = mergedIdentity?.publicImageUrl ?? fallbackAvatarUrl;
  const initials =
    mergedIdentity?.canonicalInitials ?? (displayName.trim()[0]?.toUpperCase() ?? "?");
  const activeRole = mergedIdentity?.activeRole ?? "FAN";
  const accent = modeColor(activeRole);
  const caps = mergedIdentity
    ? resolveAccountShellCapabilities({
        ownedRoles: mergedIdentity.ownedRoles,
        activeRole: mergedIdentity.activeRole,
      })
    : null;
  // Mobile escape law: never shrink below a reliable touch target.
  const size = compact ? 40 : 44;

  return (
    <div
      data-testid="tmi-universal-account-identity"
      data-tmi-universal-account-escape="1"
      style={{ position: "relative", flexShrink: 0, zIndex: 70 }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${displayName}`}
        data-testid="tmi-universal-account-trigger"
        data-tmi-account-menu-trigger="1"
        data-profile-kind={mergedIdentity?.profileKind ?? "ACCOUNT_FALLBACK"}
        data-active-mode={caps?.activeModeLabel ?? activeRole}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen((v) => !v);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 44,
          height: 44,
          padding: 0,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          borderRadius: "50%",
          touchAction: "manipulation",
        }}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={displayName}
            data-testid="tmi-universal-account-avatar"
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              objectFit: "cover",
              border: `2px solid ${open ? accent : `${accent}66`}`,
              transition: "border-color 0.2s",
            }}
          />
        ) : (
          <div
            data-testid="tmi-universal-account-initials"
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${accent}cc, #FF2DAA88)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: compact ? 14 : 16,
              fontWeight: 900,
              color: "#050510",
              border: `2px solid ${open ? accent : `${accent}55`}`,
              transition: "border-color 0.2s",
            }}
          >
            {initials}
          </div>
        )}
      </button>

      {mounted &&
        open &&
        mergedIdentity &&
        createPortal(
          <UniversalAccountDropdown
            identity={mergedIdentity}
            open={open}
            onClose={() => setOpen(false)}
            anchorTop={panelPos.top}
            anchorLeft={panelPos.left}
            anchorRight={panelPos.right}
            rolesUnavailable={identityError}
          />,
          document.body,
        )}
    </div>
  );
}
