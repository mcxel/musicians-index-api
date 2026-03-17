"use client";

import React from "react";

export function PropSlot({ onToggle, active, equippedName, disabled }: { onToggle: () => void; active: boolean; equippedName?: string | null; disabled?: boolean }) {
  return (
    <div className="bg-gray-900 p-2 rounded flex items-center gap-2">
      <button onClick={() => { if (!disabled) onToggle(); }} disabled={disabled} className={`px-2 py-1 rounded ${disabled ? 'bg-gray-700 opacity-60' : 'bg-purple-600'}`}>{active ? 'Remove Prop' : 'Place Prop'}</button>
      <div className="text-sm text-gray-300">Prop: {equippedName || (active ? 'On Stage' : 'None')}</div>
    </div>
  );
}
