"use client";

/**
 * AccountCommandMenu — universal account control point.
 * One click opens the full account command menu.
 * Fan ↔ Performer switch, notifications, settings, logout — all in-place.
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

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  priority: "low" | "medium" | "high" | "critical";
  read: boolean;
  ts: number;
  href?: string;
  emoji?: string;
}

export interface AccountCommandMenuProps {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  tier?: TierLevel;
  accentColor?: string;
  compact?: boolean;
  trigger?: ReactNode;
}

function mapSessionTier(raw: string | null | undefined): TierLevel {
  switch ((raw ?? "").toUpperCase()) {
    case "DIAMOND":  return "diamond";
    case "PLATINUM":
    case "GOLD":     return "gold";
    case "RUBY":
    case "SILVER":   return "RUBY";
    default:         return "free";
  }
}

function modeLabel(activeRole: string): string {
  const r = activeRole.toUpperCase();
  if (r === "FAN" || r === "MEMBER" || r === "USER") return "FAN";
  if (r === "PERFORMER" || r === "ARTIST" || r === "BAND") return "PERFORMER";
  if (ADMIN_ROLES.has(r)) return "ADMIN";
  return r.split("_")[0] ?? r;
}

function modeColor(activeRole: string): string {
  const r = activeRole.toUpperCase();
  if (r === "FAN" || r === "MEMBER" || r === "USER") return "#00FFFF";
  if (r === "PERFORMER" || r === "ARTIST" || r === "BAND") return "#FF2DAA";
  if (ADMIN_ROLES.has(r)) return "#FFD700";
  return "#888";
}

function publicIdLabel(role: string): string {
  const kind = publicKindFromDbRole(role);
  if (kind === "performer") return "PUBLIC ARTIST ID";
  if (kind === "fan") return "PUBLIC FAN ID";
  return "PUBLIC MEMBER ID";
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
  transition: "background 0.12s",
};

const CSS = `
@keyframes tmiACMIn {
  from { opacity:0; transform:translateY(-8px) scale(0.97); }
  to   { opacity:1; transform:translateY(0)    scale(1); }
}
@keyframes tmiRoleSpin { to { transform: rotate(360deg); } }
.tmi-acm-panel { animation: tmiACMIn 0.15s ease both; }
.tmi-acm-row:hover { background: rgba(255,255,255,0.05) !important; }
.tmi-acm-row-danger:hover { background: rgba(255,59,92,0.14) !important; }
`;

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  const [open, setOpen]               = useState(false);
  const [mounted, setMounted]         = useState(false);
  const [identity, setIdentity]       = useState<SessionIdentity | null>(null);
  const [roles, setRoles]             = useState<string[]>([]);
  const [loading, setLoading]         = useState(false);
  const [switchingRole, setSwitchingRole] = useState<string | null>(null);
  const [panelPos, setPanelPos]       = useState({ top: 56, right: 12 });
  const [subScreen, setSubScreen]     = useState<"main" | "notifications" | "settings" | "linked-accounts">("main");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifsLoading, setNotifsLoading] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"account" | "color" | "privacy">("account");
  const [activeProfileColor, setActiveProfileColor] = useState(accentColor);
  const [colorSaveStatus, setColorSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  interface LinkedAccount {
    id: string; provider: string; label: string; maskedId: string; canUnlink: boolean;
  }
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [linkedLoading, setLinkedLoading]   = useState(false);
  const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(null);
  const [unlinkError, setUnlinkError]       = useState<string | null>(null);
  const [hasPassword, setHasPassword]       = useState(false);

  const tier: TierLevel = identity ? mapSessionTier(identity.tier) : (tierProp ?? "free");
  const resolvedName    = identity?.displayName ?? displayName;
  const resolvedAvatar  = identity?.avatarUrl ?? avatarUrlProp ?? null;
  const initial         = resolvedName?.trim()?.[0]?.toUpperCase() ?? "?";

  useEffect(() => { setMounted(true); }, []);

  const hydrateIdentity = useCallback(async () => {
    setLoading(true);
    try {
      const [sessionRes, profileRes, rolesRes] = await Promise.all([
        fetch("/api/auth/session",  { cache: "no-store", credentials: "include" }),
        fetch("/api/profile/self",  { cache: "no-store", credentials: "include" }),
        fetch("/api/auth/my-roles", { cache: "no-store", credentials: "include" }),
      ]);
      const s = sessionRes.ok ? (await sessionRes.json() as {
        authenticated?: boolean; tier?: string;
        user?: { id?: string; name?: string; email?: string; role?: string;
          activeRole?: string; tier?: string; avatarUrl?: string | null; username?: string | null; };
      }) : null;
      const p = profileRes.ok ? (await profileRes.json() as {
        profile?: { id?: string; email?: string; role?: string; tier?: string;
          displayName?: string | null; avatarUrl?: string | null;
          username?: string | null; artistSlug?: string | null; };
      }) : null;
      const r = rolesRes.ok ? (await rolesRes.json() as {
        roles?: string[]; activeRole?: string | null;
      }) : { roles: [], activeRole: null };

      const user    = s?.authenticated ? s.user : undefined;
      const profile = p?.profile;
      const role    = (user?.activeRole ?? user?.role ?? profile?.role ?? "USER").toUpperCase();
      const active  = (r.activeRole ?? user?.activeRole ?? role).toUpperCase();

      setRoles((r.roles ?? []).map((x) => x.toUpperCase()));
      setIdentity({
        userId:      user?.id ?? profile?.id ?? userId,
        displayName: user?.name ?? profile?.displayName ?? displayName,
        email:       user?.email || profile?.email || "",
        username:    user?.username ?? profile?.username ?? null,
        artistSlug:  profile?.artistSlug ?? null,
        role, activeRole: active,
        tier: user?.tier ?? s?.tier ?? profile?.tier ?? "FREE",
        avatarUrl: user?.avatarUrl ?? profile?.avatarUrl ?? null,
      });
    } catch {
      setIdentity({
        userId, displayName, email: "", username: null, artistSlug: null,
        role: "USER", activeRole: "USER", tier: "FREE", avatarUrl: avatarUrlProp ?? null,
      });
    } finally { setLoading(false); }
  }, [avatarUrlProp, displayName, userId]);

  useEffect(() => { void hydrateIdentity(); }, [hydrateIdentity]);

  // load linked OAuth providers when that sub-screen opens
  useEffect(() => {
    if (subScreen !== "linked-accounts") return;
    setLinkedLoading(true);
    setUnlinkError(null);
    fetch("/api/account/linked", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { accounts?: LinkedAccount[]; hasPassword?: boolean }) => {
        setLinkedAccounts(d.accounts ?? []);
        setHasPassword(Boolean(d.hasPassword));
      })
      .catch(() => setUnlinkError("Could not load linked accounts."))
      .finally(() => setLinkedLoading(false));
  }, [subScreen]);

  const unlinkProvider = async (provider: string) => {
    setUnlinkingProvider(provider);
    setUnlinkError(null);
    try {
      const res = await fetch("/api/account/linked", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ provider }),
      });
      const d = await res.json() as { ok?: boolean; error?: string; code?: string };
      if (!res.ok) {
        setUnlinkError(d.error ?? "Unlink failed.");
      } else {
        setLinkedAccounts((prev) => prev.filter((a) => a.provider !== provider));
      }
    } catch {
      setUnlinkError("Network error. Try again.");
    } finally {
      setUnlinkingProvider(null);
    }
  };

  // load canonical profile color when settings screen opens
  useEffect(() => {
    if (subScreen !== "settings") return;
    fetch("/api/profile/config", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { config?: { themeColor?: string } }) => {
        if (d.config?.themeColor) setActiveProfileColor(d.config.themeColor);
      })
      .catch(() => {});
  }, [subScreen]);

  // fetch notifications when sub-screen opens
  useEffect(() => {
    if (subScreen !== "notifications") return;
    setNotifsLoading(true);
    fetch("/api/notifications", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { notifications?: Notification[]; unreadCount?: number }) => {
        setNotifications(d.notifications ?? []);
        setUnreadCount(d.unreadCount ?? 0);
      })
      .catch(() => {})
      .finally(() => setNotifsLoading(false));
  }, [subScreen]);

  // fetch unread count on open (badge on the row)
  useEffect(() => {
    if (!open) return;
    fetch("/api/notifications", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { unreadCount?: number }) => setUnreadCount(d.unreadCount ?? 0))
      .catch(() => {});
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPanelPos({ top: rect.bottom + 8, right: Math.max(12, window.innerWidth - rect.right) });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (
        panelRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => { if (!open) setSubScreen("main"); }, [open]);

  const close = () => setOpen(false);

  const resolved = identity ?? {
    userId, displayName, email: "", username: null, artistSlug: null,
    role: "USER", activeRole: "USER", tier: "FREE", avatarUrl: avatarUrlProp ?? null,
  };

  const roleSet     = new Set(roles.map((r) => r.toUpperCase()));
  const hasFan      = roleSet.has("FAN") || roleSet.has("MEMBER") || roleSet.has("USER");
  const hasPerformer = roleSet.has("PERFORMER") || roleSet.has("ARTIST") || roleSet.has("BAND");
  const showSwitch  = hasFan && hasPerformer;
  const showAdmin   =
    ADMIN_ROLES.has(resolved.role) || ADMIN_ROLES.has(resolved.activeRole) ||
    roleSet.has("ADMIN") || roleSet.has("STAFF");

  const activeMode    = modeLabel(resolved.activeRole);
  const activeModeClr = modeColor(resolved.activeRole);

  const usernameHandle =
    resolved.username?.trim() || resolved.email.split("@")[0] || resolved.userId.slice(0, 8);
  const publicPath = selfPublicPath({
    userId: resolved.userId, role: resolved.activeRole,
    username: resolved.username, artistSlug: resolved.artistSlug,
  });
  const memberId = formatPublicMemberId(publicKindFromDbRole(resolved.activeRole), resolved.userId);

  const switchToRole = async (targetRole: string) => {
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
        close();
        const ws = ["PERFORMER","ARTIST","BAND"].includes(targetRole) ? "performer" :
          ADMIN_ROLES.has(targetRole) ? "admin" : "fan";
        localStorage.setItem("tmi_last_workspace", ws);
        setTimeout(() => {
          router.push(data.hubUrl ?? (["PERFORMER","ARTIST","BAND"].includes(targetRole) ? "/hub/performer" : "/hub/fan"));
          router.refresh();
        }, 120);
      }
    } catch { /* keep open */ } finally { setSwitchingRole(null); }
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }), credentials: "include",
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch { /* silent */ }
  };

  const markRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", id }), credentials: "include",
      });
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  const saveProfileColor = async (color: string) => {
    setActiveProfileColor(color);
    setColorSaveStatus("saving");
    try {
      const res = await fetch("/api/profile/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ themeColor: color }),
      });
      setColorSaveStatus(res.ok ? "saved" : "error");
      if (res.ok) setTimeout(() => setColorSaveStatus("idle"), 2200);
    } catch {
      setColorSaveStatus("error");
    }
  };

  const handleLogout = async () => {
    close();
    try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch { /* noop */ }
    window.location.href = "/auth";
  };

  // ── Trigger avatar circle with mode badge ──

  const avatarCircle = (
    <div style={{ position: "relative", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      {resolvedAvatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={resolvedAvatar} alt={resolvedName} style={{
          width: 32, height: 32, borderRadius: "50%", objectFit: "cover",
          border: `2px solid ${open ? activeModeClr : `${activeModeClr}66`}`, transition: "border-color 0.2s",
        }} />
      ) : (
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: `linear-gradient(135deg, ${activeModeClr}cc, #FF2DAA88)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 900, color: "#050510",
          border: `2px solid ${open ? activeModeClr : `${activeModeClr}55`}`, transition: "border-color 0.2s",
        }}>{initial}</div>
      )}
      <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.09em", color: activeModeClr, lineHeight: 1, textShadow: `0 0 6px ${activeModeClr}88` }}>
        {loading ? "…" : activeMode}
      </div>
    </div>
  );

  // ── Notifications sub-screen ──

  const notificationsScreen = (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button type="button" onClick={() => setSubScreen("main")}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 16, cursor: "pointer", padding: 0, lineHeight: 1, fontFamily: "inherit" }}>‹</button>
        <div style={{ flex: 1, fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", color: "rgba(255,255,255,0.7)" }}>
          NOTIFICATIONS{unreadCount > 0 && <span style={{ marginLeft: 6, background: "#FF2DAA", color: "#fff", borderRadius: 999, padding: "1px 5px", fontSize: 8 }}>{unreadCount}</span>}
        </div>
        {unreadCount > 0 && (
          <button type="button" onClick={() => void markAllRead()}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 9, color: "rgba(0,200,255,0.7)", fontFamily: "inherit", letterSpacing: "0.08em" }}>
            MARK ALL READ
          </button>
        )}
      </div>
      <div style={{ maxHeight: 320, overflowY: "auto" }}>
        {notifsLoading && <div style={{ padding: "24px 0", textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Loading…</div>}
        {!notifsLoading && notifications.length === 0 && <div style={{ padding: "28px 16px", textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>No notifications yet.</div>}
        {notifications.map((n) => (
          <div key={n.id} onClick={() => void markRead(n.id)} style={{
            display: "flex", gap: 10, padding: "10px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            background: n.read ? "transparent" : "rgba(255,45,170,0.05)", cursor: "pointer",
          }}>
            <div style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{n.emoji ?? "🔔"}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: n.read ? 500 : 700, color: n.read ? "rgba(255,255,255,0.55)" : "#fff", marginBottom: 2 }}>{n.title}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.body}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", marginTop: 3 }}>{new Date(n.ts).toLocaleTimeString()}</div>
            </div>
            {!n.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF2DAA", flexShrink: 0, marginTop: 4 }} />}
          </div>
        ))}
      </div>
    </div>
  );

  // ── Settings sub-screen ──

  const SHELL_THEMES = [
    { color: "#00FFFF", label: "Cyan" },
    { color: "#FF2DAA", label: "Fuchsia" },
    { color: "#00FF88", label: "Green" },
    { color: "#FFD700", label: "Gold" },
    { color: "#AA2DFF", label: "Purple" },
  ];

  const settingsScreen = (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button type="button" onClick={() => setSubScreen("main")}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 16, cursor: "pointer", padding: 0, lineHeight: 1, fontFamily: "inherit" }}>‹</button>
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", color: "rgba(255,255,255,0.7)" }}>SETTINGS</div>
      </div>
      <div style={{ display: "flex", gap: 4, padding: "10px 14px 0", flexWrap: "wrap" }}>
        {(["account", "color", "privacy"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setSettingsTab(t)} style={{
            padding: "4px 10px", borderRadius: 6,
            border: `1px solid ${settingsTab === t ? "#00FFFF" : "transparent"}`,
            background: settingsTab === t ? "rgba(0,229,255,0.12)" : "transparent",
            color: settingsTab === t ? "#00FFFF" : "rgba(255,255,255,0.5)",
            fontSize: 8, fontWeight: 900, letterSpacing: "0.1em", cursor: "pointer", fontFamily: "inherit",
          }}>
            {t === "account" ? "ACCOUNT" : t === "color" ? "COLORS" : "PRIVACY"}
          </button>
        ))}
      </div>
      <div style={{ padding: "12px 14px 6px", minHeight: 100 }}>
        {settingsTab === "account" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}><strong style={{ color: "#fff" }}>{resolved.displayName}</strong></div>
            {resolved.email && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", wordBreak: "break-all" }}>{resolved.email}</div>}
            <Link href="/settings"                     onClick={close} style={{ fontSize: 10, color: "#00FFFF", textDecoration: "none", marginTop: 4 }}>Open full account settings →</Link>
            <Link href="/settings?section=password"    onClick={close} style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Change email / password →</Link>
            <Link href="/settings?section=sessions"    onClick={close} style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Sessions &amp; devices →</Link>
          </div>
        )}
        {settingsTab === "color" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#FFD700", letterSpacing: "0.1em" }}>
              PROFILE COLOR — dashboard + public page in sync
            </div>
            {/* Quick preset swatches */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {SHELL_THEMES.map(({ color, label }) => (
                <button key={color} type="button" title={label}
                  onClick={() => void saveProfileColor(color)}
                  style={{
                    width: 28, height: 28, borderRadius: "50%", background: color,
                    border: `2px solid ${color === activeProfileColor ? "#fff" : "transparent"}`,
                    cursor: "pointer", outline: "none",
                    boxShadow: color === activeProfileColor ? `0 0 8px ${color}` : "none",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }} />
              ))}
            </div>
            {/* Full-spectrum picker + hex input */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="color"
                value={activeProfileColor.match(/^#[0-9A-Fa-f]{6}$/) ? activeProfileColor : "#00FFFF"}
                onChange={(e) => setActiveProfileColor(e.target.value)}
                onBlur={(e) => void saveProfileColor(e.target.value)}
                title="Full spectrum color picker"
                style={{ width: 36, height: 28, borderRadius: 6, cursor: "pointer", border: "1px solid rgba(255,255,255,0.2)", padding: 1, background: "rgba(255,255,255,0.05)" }}
              />
              <input
                type="text"
                value={activeProfileColor}
                maxLength={7}
                placeholder="#00FFFF"
                onChange={(e) => {
                  const v = e.target.value;
                  setActiveProfileColor(v);
                  if (/^#[0-9A-Fa-f]{6}$/.test(v)) void saveProfileColor(v);
                }}
                style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 6, color: "#fff", fontSize: 11, padding: "4px 8px",
                  width: 80, fontFamily: "monospace", outline: "none",
                }}
              />
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", minWidth: 52,
                color: colorSaveStatus === "saved" ? "#00FF88" : colorSaveStatus === "saving" ? "#00FFFF" : colorSaveStatus === "error" ? "#FF6B6B" : "transparent",
                transition: "color 0.2s",
              }}>
                {colorSaveStatus === "saving" ? "SAVING…" : colorSaveStatus === "saved" ? "SAVED ✓" : colorSaveStatus === "error" ? "ERROR" : ""}
              </span>
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>One color. Dashboard and public profile stay in sync.</div>
          </div>
        )}
        {settingsTab === "privacy" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Link href="/settings?section=privacy"    onClick={close} style={{ fontSize: 10, color: "#00FFFF", textDecoration: "none" }}>Privacy settings →</Link>
            <Link href="/settings?section=notifs"     onClick={close} style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Notification preferences →</Link>
            <Link href="/settings?section=security"   onClick={close} style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Security →</Link>
            <Link href="/settings?section=access"     onClick={close} style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Accessibility →</Link>
          </div>
        )}
      </div>
    </div>
  );

  // ── Linked Accounts sub-screen ──

  const PROVIDER_ICON: Record<string, string> = {
    google: "G", apple: "🍎", spotify: "🎵", facebook: "f",
    twitter: "X", github: "⌥", discord: "💬", tiktok: "♪",
  };

  const linkedAccountsScreen = (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <button type="button" onClick={() => setSubScreen("main")}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 16, cursor: "pointer", padding: 0, lineHeight: 1, fontFamily: "inherit" }}>‹</button>
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", color: "rgba(255,255,255,0.7)" }}>LINKED ACCOUNTS</div>
      </div>
      <div style={{ padding: "10px 14px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        {linkedLoading && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center", padding: "18px 0" }}>Loading…</div>}
        {!linkedLoading && linkedAccounts.length === 0 && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center", padding: "18px 0" }}>
            No external accounts linked.
          </div>
        )}
        {linkedAccounts.map((a) => (
          <div key={a.provider} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
            background: "rgba(255,255,255,0.04)", borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
              {PROVIDER_ICON[a.provider.toLowerCase()] ?? "🔗"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{a.label}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 1, fontFamily: "monospace" }}>{a.maskedId}</div>
            </div>
            <button type="button"
              disabled={!a.canUnlink || unlinkingProvider === a.provider}
              onClick={() => {
                if (!a.canUnlink) return;
                if (!window.confirm(`Unlink ${a.label}? You${hasPassword ? " can still sign in with your password" : " must have another provider to log in"}.`)) return;
                void unlinkProvider(a.provider);
              }}
              style={{
                padding: "4px 9px", borderRadius: 6, fontSize: 8, fontWeight: 900,
                letterSpacing: "0.09em", cursor: a.canUnlink ? "pointer" : "not-allowed",
                border: `1px solid ${a.canUnlink ? "rgba(255,59,92,0.5)" : "rgba(255,255,255,0.1)"}`,
                background: a.canUnlink ? "rgba(255,59,92,0.1)" : "transparent",
                color: a.canUnlink ? "#FF6B6B" : "rgba(255,255,255,0.25)",
                fontFamily: "inherit",
              }}>
              {unlinkingProvider === a.provider ? "…" : "UNLINK"}
            </button>
          </div>
        ))}
        {unlinkError && (
          <div style={{ fontSize: 10, color: "#FF6B6B", padding: "4px 2px", lineHeight: 1.4 }}>{unlinkError}</div>
        )}
        {!hasPassword && !linkedLoading && (
          <div style={{ fontSize: 9, color: "rgba(255,215,0,0.7)", lineHeight: 1.5, marginTop: 4 }}>
            ⚠ No password set. You need at least one provider linked to sign in.
          </div>
        )}
        <Link href="/settings?section=security" onClick={close}
          style={{ fontSize: 10, color: "#00FFFF", textDecoration: "none", marginTop: 6 }}>
          Set or change password →
        </Link>
      </div>
    </div>
  );

  // ── Main screen ──

  const mainScreen = (
    <>
      {/* Identity header */}
      <div style={{ padding: "10px 14px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
          {resolvedAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resolvedAvatar} alt={resolved.displayName} style={{
              width: 44, height: 44, borderRadius: "50%", objectFit: "cover",
              border: `2px solid ${activeModeClr}66`,
            }} />
          ) : (
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: `linear-gradient(135deg, ${activeModeClr}cc, #FF2DAA88)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 900, color: "#050510",
            }}>{initial}</div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>{resolved.displayName}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>@{usernameHandle}</div>
            {resolved.email && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2, wordBreak: "break-all" }}>{resolved.email}</div>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <DiamondTierBadge tier={tier} />
          <span style={{ fontSize: 9, fontWeight: 800, color: activeModeClr, letterSpacing: "0.1em" }}>{modeLabel(resolved.activeRole)} MODE</span>
        </div>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginTop: 6, letterSpacing: "0.06em" }}>
          {publicIdLabel(resolved.activeRole)} · {memberId}
        </div>
      </div>

      {/* Account Mode switcher */}
      {showSwitch && (
        <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.16em", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>ACCOUNT MODE</div>
          <div style={{ display: "flex", gap: 6 }}>
            {(["FAN", "PERFORMER"] as const).map((m) => {
              const isCurrent = activeMode === m;
              const clr = m === "FAN" ? "#00FFFF" : "#FF2DAA";
              const isSwitching = switchingRole === m;
              return (
                <button key={m} type="button"
                  disabled={isCurrent || !!switchingRole}
                  onClick={() => !isCurrent && void switchToRole(m)}
                  style={{
                    flex: 1, padding: "8px 12px", borderRadius: 8,
                    border: `1px solid ${isCurrent ? clr : `${clr}44`}`,
                    background: isCurrent ? `${clr}1a` : "rgba(0,0,0,0.3)",
                    color: isCurrent ? clr : "rgba(255,255,255,0.5)",
                    fontSize: 10, fontWeight: 900, letterSpacing: "0.12em",
                    cursor: isCurrent ? "default" : switchingRole ? "wait" : "pointer",
                    fontFamily: "inherit",
                    boxShadow: isCurrent ? `0 0 10px ${clr}33` : "none",
                    transition: "all 0.15s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  }}>
                  {isSwitching
                    ? <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", border: `2px solid ${clr}44`, borderTopColor: clr, animation: "tmiRoleSpin 0.6s linear infinite" }} />
                    : (isCurrent ? "✓ " : "")}
                  {m}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginTop: 6, letterSpacing: "0.06em" }}>Currently: {activeMode}</div>
        </div>
      )}

      {/* Navigation rows */}
      <div style={{ padding: "6px 4px", display: "flex", flexDirection: "column", gap: 0 }}>
        <Link href={publicPath} onClick={close} className="tmi-acm-row" style={rowStyle}>
          VIEW MY PUBLIC PROFILE
        </Link>
        <Link href="/account" onClick={close} className="tmi-acm-row" style={rowStyle}>
          MY ACCOUNT
        </Link>
        <button type="button" className="tmi-acm-row" onClick={() => setSubScreen("settings")} style={rowStyle}>
          SETTINGS
          <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.35 }}>›</span>
        </button>
        <button type="button" className="tmi-acm-row" onClick={() => setSubScreen("notifications")} style={rowStyle}>
          NOTIFICATIONS
          {unreadCount > 0 && (
            <span style={{ marginLeft: 6, background: "#FF2DAA", color: "#fff", borderRadius: 999, padding: "1px 6px", fontSize: 9, fontWeight: 900 }}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.35 }}>›</span>
        </button>
        <Link href="/account/subscription" onClick={close} className="tmi-acm-row" style={rowStyle}>
          ACCOUNT &amp; BILLING
        </Link>
        <button type="button" className="tmi-acm-row" onClick={() => setSubScreen("linked-accounts")} style={rowStyle}>
          LINKED ACCOUNTS &amp; ACCESS
          <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.35 }}>›</span>
        </button>
        {showAdmin && (
          <>
            <div style={{ height: 1, background: "rgba(255,215,0,0.15)", margin: "4px 12px" }} />
            <Link href="/admin" onClick={close} className="tmi-acm-row" style={{ ...rowStyle, color: "#FFD700" }}>
              ⚡ ADMINISTRATION HUB
            </Link>
          </>
        )}
      </div>

      {/* Logout */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "8px 4px 2px" }}>
        <button type="button" onClick={() => void handleLogout()} className="tmi-acm-row-danger" style={{
          ...rowStyle, width: "100%", justifyContent: "center",
          background: "rgba(255,59,92,0.12)", border: "1px solid rgba(255,59,92,0.35)",
          borderRadius: 10, color: "#FF6B6B", fontWeight: 900,
        }}>
          LOG OUT
        </button>
      </div>
    </>
  );

  // ── Panel ──

  const panelContent = (
    <div
      ref={panelRef}
      role="menu"
      aria-label="Account menu"
      data-tmi-account-menu-panel="1"
      className="tmi-acm-panel"
      style={{
        position: "fixed", top: panelPos.top, right: panelPos.right, zIndex: 20001,
        width: 300, maxWidth: "calc(100vw - 24px)",
        background: "linear-gradient(160deg, rgba(6,7,13,0.98), rgba(10,6,20,0.99))",
        border: `1px solid ${activeModeClr}44`,
        borderRadius: 14, overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0,0,0,0.7), 0 0 20px rgba(0,0,0,0.4)",
        backdropFilter: "blur(18px)",
        paddingBottom: 8,
      }}
    >
      <style>{CSS}</style>
      {subScreen === "notifications"    ? notificationsScreen :
       subScreen === "settings"         ? settingsScreen :
       subScreen === "linked-accounts"  ? linkedAccountsScreen :
       mainScreen}
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu — ${resolvedName}`}
        data-tmi-account-menu-trigger="1"
        style={{
          display: "flex", alignItems: "center", gap: compact ? 6 : 0,
          background: "transparent", border: "none", cursor: "pointer",
          padding: 0, fontFamily: "inherit", flexShrink: 0,
        }}
      >
        {trigger ?? avatarCircle}
        {compact && !trigger && (
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.04em" }}>
            {resolvedName}
          </span>
        )}
      </button>
      {mounted && open && createPortal(panelContent, document.body)}
    </>
  );
}
