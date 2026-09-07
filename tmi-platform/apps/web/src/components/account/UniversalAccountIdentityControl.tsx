"use client";

/**
 * UniversalAccountIdentityControl — single shared identity circle for the
 * global header (Rule 31 ACCOUNT-SHELL). Photo if available, else accurate
 * initials from ActiveProfileIdentity. Click opens UniversalAccountDropdown.
 *
 * Current-schema compatibility: identity always comes from
 * GET /api/account/identity → ACCOUNT_FALLBACK (no fabricated dual names).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ActiveProfileIdentity } from "@/lib/account/resolveActiveProfileIdentity";
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

export default function UniversalAccountIdentityControl({
  fallbackDisplayName = "Account",
  fallbackAvatarUrl = null,
  compact = true,
}: UniversalAccountIdentityControlProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [identity, setIdentity] = useState<ActiveProfileIdentity | null>(null);
  const [panelPos, setPanelPos] = useState({ top: 56, right: 12 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const hydrate = useCallback(async () => {
    try {
      const res = await fetch("/api/account/identity", {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { identity?: ActiveProfileIdentity };
      if (data.identity) setIdentity(data.identity);
    } catch {
      /* keep fallback */
    }
  }, []);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPanelPos({
      top: Math.round(rect.bottom + 8),
      right: Math.max(8, Math.round(window.innerWidth - rect.right)),
    });
  }, [open]);

  const displayName = identity?.publicDisplayName ?? fallbackDisplayName;
  const avatarUrl = identity?.publicImageUrl ?? fallbackAvatarUrl;
  const initials = identity?.canonicalInitials ?? (displayName.trim()[0]?.toUpperCase() ?? "?");
  const activeRole = identity?.activeRole ?? "FAN";
  const accent = modeColor(activeRole);
  const caps = identity
    ? resolveAccountShellCapabilities({
        ownedRoles: identity.ownedRoles,
        activeRole: identity.activeRole,
      })
    : null;
  const size = compact ? 32 : 40;

  return (
    <div data-testid="tmi-universal-account-identity" style={{ position: "relative", flexShrink: 0 }}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${displayName}`}
        data-testid="tmi-universal-account-trigger"
        data-tmi-account-menu-trigger="1"
        data-profile-kind={identity?.profileKind ?? "ACCOUNT_FALLBACK"}
        data-active-mode={caps?.activeModeLabel ?? activeRole}
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          borderRadius: "50%",
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
              fontSize: compact ? 13 : 15,
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
        createPortal(
          <UniversalAccountDropdown
            identity={
              identity ?? {
                accountUserId: "pending",
                profileKind: "ACCOUNT_FALLBACK",
                activeRole: "FAN",
                ownedRoles: ["FAN"],
                profileComplete: false,
                publicDisplayName: displayName,
                publicHandle: null,
                publicImageUrl: avatarUrl,
                canonicalInitials: initials,
              }
            }
            open={open}
            onClose={() => setOpen(false)}
            anchorTop={panelPos.top}
            anchorRight={panelPos.right}
          />,
          document.body,
        )}
    </div>
  );
}
