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

// Real admin emails (HARDCODED_ADMINS in lib/auth/UserStore.ts) mapped to
// their workspace identity. Workspace is ALWAYS resolved from the authenticated
// session — never from the ?workspace= URL parameter (security slice).
const EMAIL_TO_WORKSPACE_ROLE: Record<string, WorkspaceRole> = {
  "berntmusic33@gmail.com": "marcel",
  "justin@themusiciansindex.com": "justin",
  "rjking42@icloud.com": "justin",
  "jay@themusiciansindex.com": "jaypaul",
  "bjmtherapper1@gmail.com": "jaypaul",
};

type SessionState = "loading" | "resolved" | "denied";

export default function WorkspaceManager() {
  // null = session fetch still in flight (never default to any workspace)
  const [activeRole, setActiveRole] = useState<WorkspaceRole | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { user?: { email?: string } } | null) => {
        if (cancelled) return;
        const email = data?.user?.email?.trim().toLowerCase() ?? "";
        const role = EMAIL_TO_WORKSPACE_ROLE[email] ?? null;
        if (role) {
          setActiveRole(role);
          setSessionState("resolved");
        } else {
          setSessionState("denied");
        }
      })
      .catch(() => {
        if (!cancelled) setSessionState("denied");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeWorkspace = useMemo(() => {
    const resolvedRole = activeRole ?? "marcel";
    const raw = WORKSPACE_CONFIGS[resolvedRole];
    const filtered = filterWorkspaceByPermissions(raw, resolvedRole);

    const roleBadges = (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {listPermissions(resolvedRole).map((permission) => (
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
        }}
      >
        <div>ACCESS DENIED</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
          Your session is not authorized for this workspace.
        </div>
      </div>
    );
  }

  if (sessionState === "loading" || !activeRole) {
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
