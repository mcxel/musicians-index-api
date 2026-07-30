"use client";

import React from "react";

export interface BottomCommandDockProps {
  activeWorkspace: string | null;
  onToggleWorkspace: (workspaceId: string) => void;
}

export default function BottomCommandDock({
  activeWorkspace,
  onToggleWorkspace,
}: BottomCommandDockProps) {
  const workspaces = [
    { id: "AVATAR", label: "👤 Avatar Studio", icon: "👤" },
    { id: "MAGAZINE", label: "📖 Magazine", icon: "📖" },
    { id: "PLAYLIST", label: "🎵 Playlist", icon: "🎵" },
    { id: "MEMORY_WALL", label: "🖼️ Memory Wall", icon: "🖼️" },
    { id: "INVENTORY", label: "🎒 Inventory", icon: "🎒" },
    { id: "ANALYTICS", label: "📊 Analytics", icon: "📊" },
    { id: "REVENUE", label: "💰 Revenue", icon: "💰" },
  ];

  return (
    <footer className="h-16 bg-black/90 backdrop-blur-xl border-t border-cyan-500/30 px-6 flex items-center justify-between z-40">
      {/* Mini Player / Quick Controls */}
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold text-sm hover:bg-cyan-500/30 transition">
          ▶
        </button>
        <div>
          <div className="text-xs font-bold text-white">Marcel Monday Showcase</div>
          <div className="text-[10px] text-white/50">Live Arena Track · 128 BPM</div>
        </div>
      </div>

      {/* Concierge Workspaces Chevron Bar */}
      <div className="flex items-center gap-2">
        {workspaces.map((ws) => (
          <button
            key={ws.id}
            onClick={() => onToggleWorkspace(ws.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
              activeWorkspace === ws.id
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-400 shadow-lg shadow-cyan-500/20"
                : "bg-white/5 text-white/70 border-white/10 hover:bg-white/15"
            }`}
          >
            {ws.label}
          </button>
        ))}
      </div>

      {/* System Utilities */}
      <div className="flex items-center gap-2">
        <button className="px-3 py-1.5 bg-white/5 hover:bg-white/15 border border-white/10 rounded-lg text-xs font-bold text-white/70">
          ⚙️ Settings
        </button>
      </div>
    </footer>
  );
}
