"use client";

import React, { useState } from "react";

export function ReactionSet({ equippedEmote, disabled }: { equippedEmote?: string | null; disabled?: boolean }) {
  const [current, setCurrent] = useState<string | null>(null);

  function react(r: string) {
    if (disabled) return;
    setCurrent(r);
    setTimeout(() => setCurrent(null), 1200);
  }

  const emoteButtons = ["❤️", "👏", "🔥"];
  return (
    <div className="flex items-center gap-2">
      {emoteButtons.map((e) => (
        <button key={e} onClick={() => react(e)} disabled={disabled} className={`px-2 py-1 rounded ${disabled ? 'bg-gray-700 opacity-60' : 'bg-gray-800'}`}>{e}</button>
      ))}
      {/* Equipped emote as highlighted quick action */}
      {equippedEmote && (
        <button onClick={() => react('✨ ' + equippedEmote)} disabled={disabled} className={`px-2 py-1 rounded ${disabled ? 'bg-gray-700 opacity-60' : 'bg-yellow-500'}`}>{equippedEmote}</button>
      )}
      {current && <div className="ml-2 text-xl animate-pop">{current}</div>}
    </div>
  );
}
