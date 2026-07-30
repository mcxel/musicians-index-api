"use client";

/**
 * DashboardWorkspaceContainer
 * ─────────────────────────────────────────────────────────────────────────────
 * The permanent dashboard home. All three workspaces (Fan / Performer / Admin)
 * are rendered simultaneously — only the active one is visible (display:block).
 * This preserves all workspace state (monitors, layouts, open panels) across
 * workspace switches with zero page refresh.
 *
 * Workspace activation methods:
 *   1. Top-bar workspace switcher (TMIWorkspaceSwitcher dispatches custom events)
 *   2. Keyboard shortcuts: Ctrl/Cmd+1 (Fan), +2 (Performer), +3 (Admin)
 *   3. Mobile: horizontal swipe (≥60px)
 *   4. Session restore: last active workspace persisted to localStorage
 *
 * Rule 20 compliance: no fake states — loading shown honestly until lazy
 * workspace chunk is ready; empty states never fabricate data.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useTmiSession } from "@/hooks/SessionContext";
import FanHQShell from "@/components/fan/FanHQShell";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DashboardWorkspace = "fan" | "performer" | "admin";

const LS_KEY = "tmi_last_workspace";

function isValidWorkspace(s: unknown): s is DashboardWorkspace {
  return s === "fan" || s === "performer" || s === "admin";
}

// ─── Lazy workspace loaders ──────────────────────────────────────────────────
// Each workspace chunk loads once on first visit, then stays mounted (hidden).

function useLazyComponent<T>(
  loader: () => Promise<{ default: T }>,
  enabled: boolean
): T | null {
  const [Comp, setComp] = useState<T | null>(null);
  const loaded = useRef(false);
  useEffect(() => {
    if (!enabled || loaded.current) return;
    loaded.current = true;
    loader().then((m) => setComp(() => m.default as T));
  }, [enabled, loader]);
  return Comp;
}

function WorkspaceLoader({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "80vh",
        flexDirection: "column",
        gap: 16,
        color: "#00f0ff",
        fontFamily: "'Courier New', monospace",
        fontSize: 13,
        letterSpacing: "0.12em",
      }}
    >
      <div style={{ fontSize: 28 }}>⚡</div>
      <div>Loading {label} Workspace…</div>
    </div>
  );
}

const performerLoader = () =>
  import("@/components/performer/PerformerCommandCenter") as Promise<{
    default: React.ComponentType<{ performerId: string; displayName: string }>;
  }>;

const adminLoader = () =>
  import("@/components/admin/overseer/workspace/WorkspaceManager") as Promise<{
    default: React.ComponentType;
  }>;

// ─── Workspace panels ────────────────────────────────────────────────────────

function PerformerWorkspacePanel({
  shouldLoad,
  performerId,
  displayName,
}: {
  shouldLoad: boolean;
  performerId: string;
  displayName: string;
}) {
  const PerformerHub = useLazyComponent(performerLoader, shouldLoad);
  if (!PerformerHub) return <WorkspaceLoader label="Performer" />;
  return <PerformerHub performerId={performerId} displayName={displayName} />;
}

function AdminWorkspacePanel({ shouldLoad }: { shouldLoad: boolean }) {
  const AdminHub = useLazyComponent(adminLoader, shouldLoad);
  if (!AdminHub) return <WorkspaceLoader label="Administration" />;
  return <AdminHub />;
}

// ─── Main container ──────────────────────────────────────────────────────────

interface SessionData {
  authenticated: boolean;
  user?: { id?: string; name?: string; role?: string };
}

export default function DashboardWorkspaceContainer() {
  const { userId, userName } = useTmiSession();

  // Role from session API (switcher uses same endpoint — browser caches it)
  const [sessionRole, setSessionRole] = useState<string>("");
  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d: SessionData) => {
        if (d.authenticated && d.user?.role) {
          setSessionRole(d.user.role.toUpperCase());
        }
      })
      .catch(() => {});
  }, []);

  const showFan      = ["FAN", "ADMIN", "SUPERADMIN"].includes(sessionRole);
  const showPerformer = ["PERFORMER", "ARTIST", "BAND", "ADMIN", "SUPERADMIN"].includes(
    sessionRole
  );
  const showAdmin = ["ADMIN", "SUPERADMIN"].includes(sessionRole);

  // Active workspace state — initialise to fan, restore from localStorage once role is known
  const [active, setActive] = useState<DashboardWorkspace>("fan");
  const [restored, setRestored] = useState(false);

  // Restore last workspace (after role is determined so we can validate access)
  useEffect(() => {
    if (!sessionRole || restored) return;
    setRestored(true);
    const saved = localStorage.getItem(LS_KEY);
    if (isValidWorkspace(saved)) {
      if (saved === "fan"       && !showFan)      { /* fall through to role default */ }
      else if (saved === "performer" && !showPerformer) { /* fall through */ }
      else if (saved === "admin"    && !showAdmin)    { /* fall through */ }
      else { setActive(saved); return; }
    }
    // No valid saved value — default to role-appropriate landing
    if (!showFan && showPerformer) setActive("performer");
    else if (!showFan && !showPerformer && showAdmin) setActive("admin");
    // else stay on "fan"
  }, [sessionRole, restored, showFan, showPerformer, showAdmin]);

  // Persist active workspace whenever it changes
  useEffect(() => {
    localStorage.setItem(LS_KEY, active);
  }, [active]);

  const switchWorkspace = useCallback(
    (ws: DashboardWorkspace) => {
      if (ws === "fan"       && !showFan)      return;
      if (ws === "performer" && !showPerformer) return;
      if (ws === "admin"    && !showAdmin)    return;
      setActive(ws);
    },
    [showFan, showPerformer, showAdmin]
  );

  // Listen for external switch events from TMIWorkspaceSwitcher
  useEffect(() => {
    const handler = (e: Event) => {
      const ws = (e as CustomEvent<{ workspace: DashboardWorkspace }>).detail?.workspace;
      if (isValidWorkspace(ws)) switchWorkspace(ws);
    };
    window.addEventListener("tmi:workspace-switch", handler);
    return () => window.removeEventListener("tmi:workspace-switch", handler);
  }, [switchWorkspace]);

  // Keyboard shortcuts: Ctrl/Cmd + 1 (fan), 2 (performer), 3 (admin)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key === "1" && showFan) {
        e.preventDefault();
        switchWorkspace("fan");
      } else if (e.key === "2" && showPerformer) {
        e.preventDefault();
        switchWorkspace("performer");
      } else if (e.key === "3" && showAdmin) {
        e.preventDefault();
        switchWorkspace("admin");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [switchWorkspace, showFan, showPerformer, showAdmin]);

  // Mobile swipe (left = next workspace, right = previous)
  const touchStartX = useRef<number | null>(null);
  const workspaceOrder = (
    ["fan" as const, ...(showPerformer ? ["performer" as const] : []), ...(showAdmin ? ["admin" as const] : [])]
  );

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
      touchStartX.current = null;
      if (Math.abs(dx) < 60) return;
      const idx = workspaceOrder.indexOf(active);
      if (dx < 0 && idx < workspaceOrder.length - 1) {
        switchWorkspace(workspaceOrder[idx + 1]);
      } else if (dx > 0 && idx > 0) {
        switchWorkspace(workspaceOrder[idx - 1]);
      }
    },
    [active, workspaceOrder, switchWorkspace]
  );

  // Track which panels have been loaded at least once (so we never unmount them)
  const [performerLoaded, setPerformerLoaded] = useState(false);
  const [adminLoaded, setAdminLoaded] = useState(false);

  useEffect(() => {
    if (active === "performer" && showPerformer) setPerformerLoaded(true);
    if (active === "admin" && showAdmin) setAdminLoaded(true);
  }, [active, showPerformer, showAdmin]);

  return (
    <div
      data-dashboard-container
      style={{ minHeight: "100vh", background: "#050510", position: "relative" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Fan Workspace (always mounted — default) ── */}
      <div
        data-workspace="fan"
        style={{ display: active === "fan" ? "block" : "none" }}
        aria-hidden={active !== "fan"}
      >
        <FanHQShell fanId={userId} fanDisplayName={userName} />
      </div>

      {/* ── Performer Workspace (lazy-mounted on first visit, kept alive) ── */}
      {(showPerformer && (active === "performer" || performerLoaded)) && (
        <div
          data-workspace="performer"
          style={{ display: active === "performer" ? "block" : "none" }}
          aria-hidden={active !== "performer"}
        >
          <PerformerWorkspacePanel
            shouldLoad={active === "performer" || performerLoaded}
            performerId={userId}
            displayName={userName}
          />
        </div>
      )}

      {/* ── Administration Workspace (lazy-mounted on first visit, kept alive) ── */}
      {(showAdmin && (active === "admin" || adminLoaded)) && (
        <div
          data-workspace="admin"
          style={{ display: active === "admin" ? "block" : "none" }}
          aria-hidden={active !== "admin"}
        >
          <AdminWorkspacePanel shouldLoad={active === "admin" || adminLoaded} />
        </div>
      )}
    </div>
  );
}
