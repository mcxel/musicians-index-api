"use client";

/**
 * AccountCommandMenu — anchored identity overlay (P0).
 * Opens on avatar/initial click without navigation — preserves live/media state.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DiamondTierBadge, type TierLevel } from "@/components/profile/DiamondTierBadge";
import {
  formatPublicMemberId,
  publicKindFromDbRole,
  selfPublicPath,
} from "@/lib/identity/PublicProfileRuntime";

const DUAL_ROLE_SWITCHER_ENABLED =
  process.env.NEXT_PUBLIC_DUAL_ROLE_SWITCHER === "true";

const ADMIN_ROLES = new Set(["ADMIN", "STAFF", "SUPERADMIN"]);

interface SessionIdentity {
  userId: string;
  displayName: string;
  email: string;
  username: string | null;
  artistSlug: string | null;
  role: string;
  activeRole: string;
  tier: string;
  avatarUrl: string | null;
}

interface AccountCommandMenuProps {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  tier?: TierLevel;
  accentColor?: string;
  /** Compact trigger: avatar/initial only (Command Center top nav). */
  compact?: boolean;
  trigger?: ReactNode;
}

function mapSessionTier(raw: string | null | undefined): TierLevel {
  switch ((raw ?? "").toUpperCase()) {
    case "DIAMOND":
      return "diamond";
    case "PLATINUM":
    case "GOLD":
      return "gold";
    case "RUBY":
    case "SILVER":
      return "RUBY";
    default:
      return "free";
  }
}

function accountModeLabel(activeRole: string): string {
  const r = activeRole.toUpperCase();
  if (r === "FAN" || r === "MEMBER" || r === "USER") return "Fan Mode";
  if (r === "PERFORMER" || r === "ARTIST" || r === "BAND") return "Performer Mode";
  if (r === "ADMIN" || r === "STAFF") return "Administration Mode";
  if (r === "VENUE") return "Venue Mode";
  if (r === "SPONSOR") return "Sponsor Mode";
  if (r === "ADVERTISER") return "Advertiser Mode";
  if (r === "PROMOTER") return "Promoter Mode";
  return `${r.charAt(0)}${r.slice(1).toLowerCase()} Mode`;
}

function publicIdLabel(role: string): string {
  const kind = publicKindFromDbRole(role);
  if (kind === "performer") return "PUBLIC ARTIST ID";
  if (kind === "fan") return "PUBLIC FAN ID";
  return "PUBLIC MEMBER ID";
}

const menuLinkStyle: CSSProperties = {
  display: "block",
  padding: "9px 12px",
  borderRadius: 8,
  fontSize: 11,
  fontWeight: 700,
  color: "#fff",
  textDecoration: "none",
  letterSpacing: "0.04em",
};

export default function AccountCommandMenu({
  userId,
  displayName,
  avatarUrl: avatarUrlProp,
  tier: tierProp,
  accentColor = "#00FFFF",
  compact = false,
  trigger,
}: AccountCommandMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [identity, setIdentity] = useState<SessionIdentity | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Hydrated session identity wins over parent props (prevents stale FREE tierProp).
  const tier: TierLevel = identity
    ? mapSessionTier(identity.tier)
    : (tierProp ?? "free");
  const resolvedDisplayName = identity?.displayName ?? displayName;
  const avatarUrl = identity?.avatarUrl ?? avatarUrlProp ?? null;
  const initial = resolvedDisplayName?.trim()?.[0]?.toUpperCase() ?? "?";
  const [panelPos, setPanelPos] = useState<{ top: number; right: number }>({
    top: 56,
    right: 12,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const hydrateIdentity = useCallback(async () => {
    setLoading(true);
    try {
      const [sessionRes, profileRes, rolesRes] = await Promise.all([
        fetch("/api/auth/session", { cache: "no-store", credentials: "include" }),
        fetch("/api/profile/self", { cache: "no-store", credentials: "include" }),
        fetch("/api/auth/my-roles", { cache: "no-store", credentials: "include" }),
      ]);

      const sessionData = sessionRes.ok
        ? ((await sessionRes.json()) as {
            authenticated?: boolean;
            tier?: string;
            user?: {
              id?: string;
              name?: string;
              email?: string;
              role?: string;
              activeRole?: string;
              tier?: string;
              avatarUrl?: string | null;
              username?: string | null;
              userRef?: string | null;
            };
          })
        : null;

      const profileData = profileRes.ok
        ? ((await profileRes.json()) as {
            profile?: {
              id?: string;
              email?: string;
              role?: string;
              tier?: string;
              displayName?: string | null;
              avatarUrl?: string | null;
              username?: string | null;
              artistSlug?: string | null;
              stageName?: string | null;
            };
          })
        : null;

      const rolesData = rolesRes.ok
        ? ((await rolesRes.json()) as { roles?: string[]; activeRole?: string | null })
        : { roles: [], activeRole: null };

      const user = sessionData?.authenticated ? sessionData.user : undefined;
      const profile = profileData?.profile;
      const role = (user?.activeRole ?? user?.role ?? profile?.role ?? "USER").toUpperCase();
      const activeRole = (rolesData.activeRole ?? user?.activeRole ?? role).toUpperCase();

      setRoles((rolesData.roles ?? []).map((r) => r.toUpperCase()));
      setIdentity({
        userId: user?.id ?? profile?.id ?? userId,
        displayName: user?.name ?? profile?.displayName ?? displayName,
        // `??` won't fall through on empty-string ""; use || so profile email fills the gap
        email: user?.email || profile?.email || "",
        username: user?.username ?? profile?.username ?? null,
        artistSlug: profile?.artistSlug ?? null,
        role,
        activeRole,
        tier: user?.tier ?? sessionData?.tier ?? profile?.tier ?? "FREE",
        avatarUrl: user?.avatarUrl ?? profile?.avatarUrl ?? null,
      });
    } catch {
      setIdentity({
        userId,
        displayName,
        email: "",
        username: null,
        artistSlug: null,
        role: "USER",
        activeRole: "USER",
        tier: "FREE",
        avatarUrl: avatarUrlProp ?? null,
      });
    } finally {
      setLoading(false);
    }
  }, [avatarUrlProp, displayName, userId]);

  useEffect(() => {
    void hydrateIdentity();
  }, [hydrateIdentity]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPanelPos({
      top: rect.bottom + 8,
      right: Math.max(12, window.innerWidth - rect.right),
    });
  }, [open, compact, resolvedDisplayName]);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (
        panelRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  const resolved = identity ?? {
    userId,
    displayName,
    email: "",
    username: null,
    artistSlug: null,
    role: "USER",
    activeRole: "USER",
    tier: "FREE",
    avatarUrl: avatarUrlProp ?? null,
  };

  const usernameHandle =
    resolved.username?.trim() ||
    resolved.email.split("@")[0] ||
    resolved.userId.slice(0, 8);
  const publicPagePath = selfPublicPath({
    userId: resolved.userId,
    role: resolved.activeRole,
    username: resolved.username,
    artistSlug: resolved.artistSlug,
  });
  const memberId = formatPublicMemberId(
    publicKindFromDbRole(resolved.activeRole),
    resolved.userId,
  );

  const roleSet = new Set(roles.map((r) => r.toUpperCase()));
  const hasFanRole = roleSet.has("FAN") || roleSet.has("MEMBER") || roleSet.has("USER");
  const hasPerformerRole =
    roleSet.has("PERFORMER") || roleSet.has("ARTIST") || roleSet.has("BAND");
  const showDualRoleSwitch =
    DUAL_ROLE_SWITCHER_ENABLED && hasFanRole && hasPerformerRole;
  const showAdminHub =
    ADMIN_ROLES.has(resolved.role) ||
    ADMIN_ROLES.has(resolved.activeRole) ||
    roleSet.has("ADMIN") ||
    roleSet.has("STAFF");

  const dualTargetRole = (() => {
    const active = resolved.activeRole.toUpperCase();
    if (active === "FAN" || active === "MEMBER" || active === "USER") return "PERFORMER";
    return "FAN";
  })();

  const handleDualRoleSwitch = async () => {
    if (switchingRole) return;
    setSwitchingRole(true);
    try {
      const res = await fetch("/api/auth/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: dualTargetRole }),
      });
      const data = (await res.json()) as { ok?: boolean; hubUrl?: string };
      if (res.ok && data.ok) {
        close();
        router.push(data.hubUrl ?? (dualTargetRole === "FAN" ? "/hub/fan" : "/hub/performer"));
        router.refresh();
      }
    } catch {
      /* keep menu open */
    } finally {
      setSwitchingRole(false);
    }
  };

  const handleLogout = async () => {
    close();
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      /* GET fallback below */
    }
    window.location.href = "/auth";
  };

  const panelContent = (
    <div
      ref={panelRef}
      role="menu"
      aria-label="Account menu"
      data-tmi-account-menu-panel="1"
      style={{
        position: "fixed",
        top: panelPos.top,
        right: panelPos.right,
        zIndex: 20001,
        width: 300,
        maxWidth: "calc(100vw - 24px)",
        background: "linear-gradient(160deg, rgba(6,7,13,0.98), rgba(10,6,20,0.99))",
        border: `1px solid ${accentColor}44`,
        borderRadius: 14,
        padding: "14px 10px 10px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Identity header */}
      <div style={{ padding: "4px 12px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={resolved.displayName}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                objectFit: "cover",
                border: `2px solid ${accentColor}66`,
              }}
            />
          ) : (
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${accentColor}, #FF2DAA)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 900,
                color: "#050510",
              }}
            >
              {initial}
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
              {resolved.displayName}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
              @{usernameHandle}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: accentColor, marginBottom: 4 }}>
          {publicIdLabel(resolved.activeRole)} · {memberId}
        </div>
        {resolved.email ? (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", wordBreak: "break-all" }}>
            {resolved.email}
          </div>
        ) : (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Email not shown for this role</div>
        )}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
          <DiamondTierBadge tier={tier} />
          <span style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>
            {accountModeLabel(resolved.activeRole)}
          </span>
        </div>
        <Link
          href={publicPagePath}
          onClick={close}
          style={{
            ...menuLinkStyle,
            marginTop: 10,
            background: `${accentColor}12`,
            border: `1px solid ${accentColor}33`,
            textAlign: "center",
            fontWeight: 900,
            letterSpacing: "0.08em",
          }}
        >
          VIEW MY PUBLIC PAGE
        </Link>
      </div>

      {/* Primary actions */}
      <div style={{ padding: "8px 4px", display: "flex", flexDirection: "column", gap: 2 }}>
        <Link href="/account" onClick={close} style={menuLinkStyle}>
          MY ACCOUNT
        </Link>
        <Link href="/account/subscription" onClick={close} style={menuLinkStyle}>
          ACCOUNT &amp; BILLING
        </Link>
        <Link href="/settings" onClick={close} style={menuLinkStyle}>
          SETTINGS
        </Link>
        <Link href="/settings?section=linked" onClick={close} style={menuLinkStyle}>
          LINKED ACCOUNTS &amp; ACCESS
        </Link>
        {showAdminHub ? (
          <Link href="/admin" onClick={close} style={menuLinkStyle}>
            ADMINISTRATION HUB
          </Link>
        ) : null}
        {showDualRoleSwitch ? (
          <button
            type="button"
            onClick={() => void handleDualRoleSwitch()}
            disabled={switchingRole || loading}
            style={{
              ...menuLinkStyle,
              width: "100%",
              textAlign: "left",
              background: "rgba(255,255,255,0.03)",
              border: "none",
              cursor: switchingRole ? "wait" : "pointer",
              fontFamily: "inherit",
              color: "#FFD700",
            }}
          >
            {switchingRole ? "SWITCHING…" : `FAN ↔ PERFORMER → ${dualTargetRole}`}
          </button>
        ) : null}
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", margin: "4px 0" }} />

      <button
        type="button"
        onClick={() => void handleLogout()}
        style={{
          display: "block",
          width: "100%",
          margin: "4px 4px 0",
          padding: "12px 12px",
          borderRadius: 10,
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: "0.1em",
          color: "#fff",
          background: "rgba(255,59,92,0.22)",
          border: "1px solid rgba(255,59,92,0.55)",
          cursor: "pointer",
          fontFamily: "inherit",
          textAlign: "center",
        }}
      >
        LOG OUT
      </button>
    </div>
  );

  const avatarChip =
    avatarUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={resolvedDisplayName}
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          objectFit: "cover",
          border: `1px solid ${accentColor}55`,
          flexShrink: 0,
        }}
      />
    ) : (
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${accentColor}, #FF2DAA)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 900,
          color: "#050510",
          flexShrink: 0,
        }}
      >
        {initial}
      </div>
    );

  const defaultTrigger = compact ? (
    avatarChip
  ) : (
    trigger ?? avatarChip
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${resolvedDisplayName}`}
        data-tmi-account-menu-trigger="1"
        style={{
          display: "flex",
          alignItems: "center",
          gap: compact ? 8 : 0,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
          fontFamily: "inherit",
          flexShrink: 0,
        }}
      >
        {trigger ?? defaultTrigger}
      </button>
      {mounted &&
        open &&
        createPortal(panelContent, document.body)}
    </>
  );
}
