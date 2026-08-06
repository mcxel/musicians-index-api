"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import OverseerFlightDeck, {
  type ShellPanel,
  type ShellWorkspaceDefinition,
} from "@/components/admin/OverseerFlightDeck";
import { WORKSPACE_CONFIGS } from "./WorkspaceConfigs";
import { filterWorkspaceByPermissions, listPermissions } from "./WorkspacePermissions";
import type { WorkspacePanelConfig, WorkspaceRole } from "./WorkspaceSchema";
import { getWorkspaceWidgetComponent } from "./WorkspaceWidgetRegistry";

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
      content: <Widget />,
    };
  });

// Real admin emails (HARDCODED_ADMINS in lib/auth/UserStore.ts) mapped to
// their workspace identity. Workspace is ALWAYS resolved from the authenticated
// session — never from the ?workspace= URL parameter, which is untrusted user
// input and could allow any admin to view another admin's workspace by simply
// editing the URL.
const EMAIL_TO_WORKSPACE_ROLE: Record<string, WorkspaceRole> = {
  "berntmusic33@gmail.com": "marcel",
  "justin@themusiciansindex.com": "justin",
  "rjking42@icloud.com": "justin",
  "jay@themusiciansindex.com": "jaypaul",
  "bjmtherapper1@gmail.com": "jaypaul", // Jay Paul's real login email (confirmed 2026-08-04)
};

type SessionState = "loading" | "resolved" | "denied";

export default function WorkspaceManager() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // null = session fetch still in flight (never default to any workspace)
  const [activeRole, setActiveRole] = useState<WorkspaceRole | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>("loading");

  // Security: workspace is ALWAYS derived from the authenticated session.
  // The ?workspace= URL param is ignored as an input — it may only be written
  // by this component after session resolution (for URL display / back-button).
  // An admin cannot see another admin's workspace by editing the URL.
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
          // Email not in the admin mapping — show access denied.
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

  // Enforce URL reflects the session-resolved role.
  // If someone lands with ?workspace=other-person, this corrects the URL.
  useEffect(() => {
    if (!activeRole) return;
    const urlParam = searchParams?.get("workspace");
    if (urlParam !== activeRole) {
      const next = new URLSearchParams(searchParams?.toString() ?? "");
      next.set("workspace", activeRole);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    }
    // Only run when activeRole resolves — not on every searchParams change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRole]);

  const activeWorkspace = useMemo(() => {
    // Fallback only feeds this memo while activeRole is still resolving
    // (session fetch in flight); the render below shows a loading state
    // activeRole is null only while session fetch is in flight — the render
    // below returns a loading state in that case, so this memo is not consumed.
    const resolvedRole = activeRole ?? "marcel";
    const raw = WORKSPACE_CONFIGS[resolvedRole];
    const filtered = filterWorkspaceByPermissions(raw, resolvedRole);

    const roleBadges = (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {listPermissions(resolvedRole).map((permission) => (
          <span
            key={permission}
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
            }}
          >
            {permission}
          </span>
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
            Workspace: {filtered.label}
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
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Your session is not authorized for this workspace.</div>
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
      {/* Role pills removed from top — use Admin Concierge → Workspaces */}
      <OverseerFlightDeck workspace={activeWorkspace} />
    </div>
  );
}
