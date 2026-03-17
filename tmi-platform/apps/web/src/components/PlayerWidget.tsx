"use client";

import React from "react";

interface PlayerWidgetProps {
  title?: string;
}

export function PlayerWidget({ title = "Player Widget" }: PlayerWidgetProps) {
  const categories = ["Featured", "Music", "Talk", "Gaming"];

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 bg-gray-800 rounded">◀</button>
          <button className="px-2 py-1 bg-gray-800 rounded">▶</button>
        </div>
      </div>

      <div className="aspect-video bg-black/40 rounded mb-3 flex items-center justify-center text-white">Video Layer</div>

      <div className="flex gap-2 overflow-x-auto">
        {categories.map((c) => (
          <button key={c} className="px-3 py-1 bg-gray-800 rounded text-sm">{c}</button>
        ))}
      </div>
    </div>
  );
}
