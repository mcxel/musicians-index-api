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

export default function WorkspaceManager() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const workspaceParam = (searchParams?.get("workspace") as WorkspaceRole | null) ?? null;
  const [activeRole, setActiveRole] = useState<WorkspaceRole>("marcel");

  useEffect(() => {
    if (workspaceParam && workspaceParam in WORKSPACE_CONFIGS && workspaceParam !== activeRole) {
      setActiveRole(workspaceParam);
    }
  }, [workspaceParam, activeRole]);

  // Keep URL in sync when landing without ?workspace=
  useEffect(() => {
    if (!workspaceParam) {
      const next = new URLSearchParams(searchParams?.toString() ?? "");
      next.set("workspace", activeRole);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    }
    // intentionally only when workspaceParam missing on mount/change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceParam]);

  const activeWorkspace = useMemo(() => {
    const raw = WORKSPACE_CONFIGS[activeRole];
    const filtered = filterWorkspaceByPermissions(raw, activeRole);

    const roleBadges = (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {listPermissions(activeRole).map((permission) => (
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
            Workspace: {filtered.label} · switch via Admin Concierge
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
