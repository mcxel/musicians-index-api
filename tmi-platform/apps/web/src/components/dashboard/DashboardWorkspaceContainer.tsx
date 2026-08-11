"use client";

/**
 * DashboardWorkspaceContainer
 * ─────────────────────────────────────────────────────────────────────────────
 * Role-shell isolation (P0 mobile visual cert):
 *   FAN | PERFORMER | ADMIN are mutually exclusive — only ONE shell mounts.
 *   Never horizontal siblings, display:none keep-alives, swipe carousels, or
 *   translateX role tracks. Swipe must never expose Overseer/Admin.
 *
 * Activation:
 *   1. Top-bar / RoleSwitcher (explicit button only)
 *   2. Keyboard: Ctrl/Cmd+1 Fan, +2 Performer (Admin → /admin/overseer route)
 *   3. Session restore from localStorage (validated against role access)
 *
 * Admin is a separate authorized route (/admin/overseer), not an in-dashboard
 * sibling panel. Rule 20: no fake states — loading shown until chunk ready.
 */

import { useCallback, useEffect, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { useTmiSession } from "@/hooks/SessionContext";
import FanHQShell from "@/components/fan/FanHQShell";
import GlobalErrorBoundary from "@/components/system/GlobalErrorBoundary";

export type DashboardWorkspace = "fan" | "performer" | "admin";

const LS_KEY = "tmi_last_workspace";

function isValidWorkspace(s: unknown): s is DashboardWorkspace {
  return s === "fan" || s === "performer" || s === "admin";
}

function useLazyComponent<T>(
  loader: () => Promise<{ default: T }>,
  enabled: boolean,
): T | null {
  const [Comp, setComp] = useState<T | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    loader()
      .then((m) => {
        if (!cancelled) setComp(() => m.default as T);
      })
      .catch((err) => {
        console.warn("[WorkspaceLoader] Chunk load deferred", err);
        if (!cancelled) {
          window.setTimeout(() => setAttempt((n) => n + 1), 400);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, loader, attempt]);

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
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
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
    default: ComponentType<{ performerId: string; displayName: string }>;
  }>;

function PerformerWorkspacePanel({
  performerId,
  displayName,
}: {
  performerId: string;
  displayName: string;
}) {
  const PerformerHub = useLazyComponent(performerLoader, true);
  if (!PerformerHub) return <WorkspaceLoader label="Performer" />;
  return <PerformerHub performerId={performerId} displayName={displayName} />;
}

interface SessionData {
  authenticated: boolean;
  user?: { id?: string; name?: string; role?: string };
}

export default function DashboardWorkspaceContainer() {
  const router = useRouter();
  const { userId, userName } = useTmiSession();

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

  const showFan = ["FAN", "ADMIN", "SUPERADMIN"].includes(sessionRole);
  const showPerformer = ["PERFORMER", "ARTIST", "BAND", "ADMIN", "SUPERADMIN"].includes(
    sessionRole,
  );
  const showAdmin = ["ADMIN", "SUPERADMIN"].includes(sessionRole);

  /** In-dashboard shells only — admin never co-mounted here. */
  const [active, setActive] = useState<"fan" | "performer">("fan");
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    if (!sessionRole || restored) return;
    setRestored(true);
    const saved = localStorage.getItem(LS_KEY);
    if (saved === "admin" && showAdmin) {
      router.replace("/admin/overseer");
      return;
    }
    if (saved === "performer" && showPerformer) {
      setActive("performer");
      return;
    }
    if (saved === "fan" && showFan) {
      setActive("fan");
      return;
    }
    if (!showFan && showPerformer) setActive("performer");
    else setActive("fan");
  }, [sessionRole, restored, showFan, showPerformer, showAdmin, router]);

  useEffect(() => {
    localStorage.setItem(LS_KEY, active);
  }, [active]);

  const switchWorkspace = useCallback(
    (ws: DashboardWorkspace) => {
      if (ws === "admin") {
        if (!showAdmin) return;
        localStorage.setItem(LS_KEY, "admin");
        router.push("/admin/overseer");
        return;
      }
      if (ws === "fan" && !showFan) return;
      if (ws === "performer" && !showPerformer) return;
      setActive(ws);
    },
    [showFan, showPerformer, showAdmin, router],
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const ws = (e as CustomEvent<{ workspace: DashboardWorkspace }>).detail?.workspace;
      if (isValidWorkspace(ws)) switchWorkspace(ws);
    };
    window.addEventListener("tmi:workspace-switch", handler);
    return () => window.removeEventListener("tmi:workspace-switch", handler);
  }, [switchWorkspace]);

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

  return (
    <div
      data-dashboard-container
      data-active-workspace={active}
      style={{
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        background: "#050510",
        position: "relative",
        overflowX: "clip",
      }}
    >
      {/* Mutually exclusive mount — never Fan+Performer+Admin siblings */}
      {active === "fan" ? (
        <div
          data-workspace="fan"
          style={{ width: "100%", maxWidth: "100%", minWidth: 0 }}
        >
          <GlobalErrorBoundary context="Fan Command Center">
            <FanHQShell fanId={userId} fanDisplayName={userName} />
          </GlobalErrorBoundary>
        </div>
      ) : null}

      {active === "performer" && showPerformer ? (
        <div
          data-workspace="performer"
          style={{ width: "100%", maxWidth: "100%", minWidth: 0 }}
        >
          <GlobalErrorBoundary context="Performer Command Center">
            <PerformerWorkspacePanel performerId={userId} displayName={userName} />
          </GlobalErrorBoundary>
        </div>
      ) : null}
    </div>
  );
}
