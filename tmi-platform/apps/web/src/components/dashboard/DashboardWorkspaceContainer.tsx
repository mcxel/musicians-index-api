"use client";

/**
 * DashboardWorkspaceContainer
 * Role gateway only — resolves session then redirects to /hub/fan|performer.
 * Does not mount FanShell/PerformerShell (canonical HQ is on hub routes).
 */

import AuthenticatedRoleBoundary from "@/components/auth/AuthenticatedRoleBoundary";

export type DashboardWorkspace = "fan" | "performer" | "admin";

export default function DashboardWorkspaceContainer() {
  return <AuthenticatedRoleBoundary mode="auto" />;
}
