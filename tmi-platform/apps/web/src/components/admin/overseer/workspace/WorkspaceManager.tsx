"use client";

import { useEffect, useMemo, useState } from "react";

import OverseerFlightDeck, {
  type ShellPanel,
  type ShellWorkspaceDefinition,
} from "@/components/admin/OverseerFlightDeck";
import { WORKSPACE_CONFIGS } from "./WorkspaceConfigs";
import { filterWorkspaceByPermissions, listPermissions } from "./WorkspacePermissions";
import type { WorkspacePanelConfig, WorkspaceRole } from "./WorkspaceSchema";
import { getWorkspaceWidgetComponent } from "./WorkspaceWidgetRegistry";
import { livingOsCommandBus } from "@/lib/os/livingOsCommandBus";
import { resolveWorkspaceFromSession } from "@/lib/auth/workspaceSecurity";

const toShellPanels = (panels: WorkspacePanelConfig[]): ShellPanel[] =>
  panels.map((panel) => {
    const Widget = getWorkspaceWidgetComponent(panel.widget);

    return {
      id: panel.id,
      title: panel.title,
      accent: panel.accent,
      statusLabel: panel.statusLabel,
      fixedHeight: panel.fixedHeight,
      flex: panel.flex,
      fullscreenKey: panel.fullscreenKey,
      requiredPermission: panel.requiredPermission,
      content: <Widget />,
    };
  });

type SessionState = "loading" | "resolved" | "denied";

export default function WorkspaceManager() {
  // null = session fetch still in flight (never default to any workspace)
  const [activeRole, setActiveRole] = useState<WorkspaceRole | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>("loading");
  const [denyReason, setDenyReason] = useState("Your session is not authorized for this workspace.");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { user?: { email?: string } } | null) => {
        if (cancelled) return;
        // Never read ?workspace= — Security Stability Slice A
        const resolved = resolveWorkspaceFromSession({
          email: data?.user?.email,
          workspaceQuery: null,
        });
        if (resolved.ok) {
          setActiveRole(resolved.role);
          setSessionState("resolved");
        } else {
          setDenyReason(resolved.reason);
          setSessionState("denied");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDenyReason("Session lookup failed — workspace denied.");
          setSessionState("denied");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeWorkspace = useMemo(() => {
    if (!activeRole) return null;
    const raw = WORKSPACE_CONFIGS[activeRole];
    const filtered = filterWorkspaceByPermissions(raw, activeRole);

    const roleBadges = (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {listPermissions(activeRole).map((permission) => (
          <button
            key={permission}
            type="button"
            onClick={() =>
              livingOsCommandBus.dispatch({
                type: "DRAWER_OPENED",
                category: "navigation",
                role: "admin",
                payload: { requiredPermission: permission },
              })
            }
            style={{
              border: "1px solid rgba(0,255,255,0.3)",
              borderRadius: 999,
              padding: "2px 7px",
              fontSize: 8,
              fontWeight: 700,
              color: "#8CF9FF",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              background: "rgba(0,255,255,0.07)",
              whiteSpace: "nowrap",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {permission}
          </button>
        ))}
      </div>
    );

    const shellWorkspace: ShellWorkspaceDefinition = {
      title: filtered.title,
      ribbon: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 10px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 10 }}>{filtered.subtitle}</div>
          {roleBadges}
          <span
            style={{
              marginLeft: "auto",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#FFD700",
              border: "1px solid rgba(255,215,0,0.35)",
              borderRadius: 999,
              padding: "3px 10px",
            }}
          >
            Session workspace: {filtered.label}
          </span>
        </div>
      ),
      leftRail: toShellPanels(filtered.leftRail),
      center: toShellPanels(filtered.center),
      rightRail: toShellPanels(filtered.rightRail),
      bottom: toShellPanels(filtered.bottom),
      dockButtons: filtered.dockButtons,
    };

    return shellWorkspace;
  }, [activeRole]);

  if (sessionState === "denied") {
    return (
      <div
        data-overseer-workspace-root
        data-http-status="403"
        role="alert"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#05020a",
          color: "#FF4444",
          fontSize: 12,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          flexDirection: "column",
          gap: 12,
          padding: 24,
          textAlign: "center",
        }}
      >
        <div>403 FORBIDDEN</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "none", maxWidth: 420 }}>
          {denyReason}
        </div>
      </div>
    );
  }

  if (sessionState === "loading" || !activeRole || !activeWorkspace) {
    return (
      <div
        data-overseer-workspace-root
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#05020a",
          color: "rgba(255,255,255,0.5)",
          fontSize: 12,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        LOADING WORKSPACE…
      </div>
    );
  }

  return (
    <div
      data-overseer-workspace-root
      style={{
        minHeight: "100vh",
        height: "auto",
        maxHeight: "none",
        overflow: "visible",
        background: "#05020a",
      }}
    >
      <OverseerFlightDeck workspace={activeWorkspace} />
    </div>
  );
}
