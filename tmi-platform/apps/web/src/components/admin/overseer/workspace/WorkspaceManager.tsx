"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import CanonOverseerShell, { type ShellPanel, type ShellWorkspaceDefinition } from "@/components/admin/CanonOverseerShell";
import { WORKSPACE_CONFIGS } from "./WorkspaceConfigs";
import { filterWorkspaceByPermissions, listPermissions } from "./WorkspacePermissions";
import type { WorkspacePanelConfig, WorkspaceRole } from "./WorkspaceSchema";
import { getWorkspaceWidgetComponent } from "./WorkspaceWidgetRegistry";

const ROLE_ORDER: WorkspaceRole[] = ["marcel", "bigace", "jaypaul", "justin", "michaelcharlie", "legal"];

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

  const setRoleAndPersist = (role: WorkspaceRole) => {
    setActiveRole(role);
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    next.set("workspace", role);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const activeWorkspace = useMemo(() => {
    const raw = WORKSPACE_CONFIGS[activeRole];
    const filtered = filterWorkspaceByPermissions(raw, activeRole);

    // Compact single-line ribbon — the title already appears in the "Admin OS"
    // status bar above the shell, so this only needs to add the subtitle and
    // permission badges, not repeat the title at full size.
    const roleBadges = (
      <div style={{ display: "flex", flexWrap: "nowrap", overflowX: "auto", gap: 5 }}>
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
              flexShrink: 0,
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
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", flexWrap: "wrap" }}>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 10, whiteSpace: "nowrap" }}>{filtered.subtitle}</div>
          {roleBadges}
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
    <div style={{ minHeight: "100vh", background: "#05020a" }}>
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "6px 10px",
          borderBottom: "1px solid rgba(255,215,0,0.25)",
          background: "linear-gradient(180deg, rgba(22,12,18,0.96), rgba(10,6,12,0.96))",
          flexWrap: "wrap",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        {ROLE_ORDER.map((role) => {
          const isActive = role === activeRole;
          const label = WORKSPACE_CONFIGS[role].label;
          return (
            <button
              key={role}
              type="button"
              onClick={() => setRoleAndPersist(role)}
              style={{
                borderRadius: 999,
                border: isActive ? "1px solid rgba(255,215,0,0.85)" : "1px solid rgba(255,255,255,0.16)",
                background: isActive
                  ? "linear-gradient(180deg, rgba(255,215,0,0.86), rgba(201,129,20,0.9))"
                  : "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
                color: isActive ? "#170b04" : "rgba(255,255,255,0.82)",
                fontSize: 11,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <CanonOverseerShell workspace={activeWorkspace} />
    </div>
  );
}
