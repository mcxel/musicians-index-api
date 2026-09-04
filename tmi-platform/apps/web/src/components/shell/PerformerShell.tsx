"use client";

/**
 * PerformerShell — standalone Performer root experience.
 * Owns Go Live, WebRTC/camera, venues, commerce — no fan-avatar shell.
 */

import PerformerCommandCenter from "@/components/performer/PerformerCommandCenter";

export interface PerformerShellProps {
  performerId: string;
  displayName: string;
}

export default function PerformerShell({ performerId, displayName }: PerformerShellProps) {
  return (
    <div data-shell="PerformerShell" data-role-shell="PERFORMER" data-canonical-shell="performer" style={{ minHeight: "100vh", width: "100%" }}>
      <PerformerCommandCenter performerId={performerId} displayName={displayName} />
    </div>
  );
}
