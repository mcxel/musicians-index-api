"use client";

import React from "react";

export default function LoadingSkeletonShell() {
  return (
    <div className="w-full h-screen bg-neutral-950 flex flex-col p-6 animate-pulse select-none font-sans justify-between">
      {/* HUD Top Bar Simulator */}
      <div className="w-full h-12 rounded-xl bg-neutral-900 border border-neutral-800/60" />
      
      {/* Central Viewport Split Simulator */}
      <div className="flex-1 w-full my-6 grid grid-cols-2 gap-6">
        <div className="h-full rounded-2xl bg-neutral-900/40 border border-neutral-800/40" />
        <div className="h-full rounded-2xl bg-neutral-900/40 border border-neutral-800/40" />
      </div>

      {/* Control Footer Deck Simulator */}
      <div className="w-full h-16 rounded-xl bg-neutral-900 border border-neutral-800/60 flex items-center px-4">
        <div className="w-24 h-4 rounded bg-neutral-800" />
      </div>
    </div>
  );
}