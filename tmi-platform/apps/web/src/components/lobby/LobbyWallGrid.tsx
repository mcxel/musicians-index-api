// LEGACY — zero production importers as of 2026-08-12 (confirmed via full-codebase
// import search). Superseded by LiveLobbyWallGrid.tsx, the canonical full-page
// Live Lobby Wall. Not deleted in case another concurrent tool has plans for it.

import React from "react";

export function LobbyWallGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-zinc-950">
      {/* Layout: 3 live windows per row enforced */}
      {children}
    </div>
  );
}