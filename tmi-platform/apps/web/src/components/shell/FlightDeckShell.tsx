"use client";

import React, { useState } from "react";
import BottomCommandDock from "./BottomCommandDock";
import WorkspacePortal from "./WorkspacePortal";

export interface FlightDeckShellProps {
  children: React.ReactNode;
  activeExperienceId?: string;
  userRole?: "FAN" | "PERFORMER" | "ADMIN";
}

export default function FlightDeckShell({
  children,
  activeExperienceId = "fan-lobby",
  userRole = "FAN",
}: FlightDeckShellProps) {
  const [activeWorkspace, setActiveWorkspace] = useState<string | null>(null);

  return (
    <div className="relative w-screen h-screen bg-slate-950 text-white overflow-hidden flex flex-col justify-between">
      {/* Top OS Status Bar */}
      <header className="h-10 bg-black/80 backdrop-blur-md border-b border-cyan-500/20 px-6 flex items-center justify-between text-xs font-mono z-30">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-extrabold text-cyan-400 tracking-widest">TMI-OS :: FLIGHT DECK</span>
          <span className="text-white/40">|</span>
          <span className="text-white/70">ACTIVE: {activeExperienceId.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-white/60">
          <span>ROLE: {userRole}</span>
          <span className="text-emerald-400">CIR: 98 (IRON)</span>
          <span className="text-cyan-400">FPS: 60</span>
        </div>
      </header>

      {/* Primary Experience Viewport (16:9 Screen Protection) */}
      <main className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center">
        {children}
      </main>

      {/* Expandable Concierge Workspace Portal */}
      <WorkspacePortal
        isOpen={activeWorkspace !== null}
        workspaceId={activeWorkspace}
        onClose={() => setActiveWorkspace(null)}
      />

      {/* Standardized Bottom Command Dock */}
      <BottomCommandDock
        activeWorkspace={activeWorkspace}
        onToggleWorkspace={(wsId) => setActiveWorkspace(activeWorkspace === wsId ? null : wsId)}
      />
    </div>
  );
}
