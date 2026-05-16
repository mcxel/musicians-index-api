import React from "react";

export function LobbyWallGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-zinc-950">
      {/* Layout: 3 live windows per row enforced */}
      {children}
    </div>
  );
}