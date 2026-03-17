"use client";

import React, { useEffect, useState } from "react";
import { getLoadout } from "../lib/inventoryState";

export function CompactLoadout() {
  const [loadout, setLoadout] = useState<any>(getLoadout());

  useEffect(() => {
    function onLoadout(e: any) {
      setLoadout(e.detail || getLoadout());
    }
    window.addEventListener('bb:loadout:changed', onLoadout as EventListener);
    return () => window.removeEventListener('bb:loadout:changed', onLoadout as EventListener);
  }, []);

  return (
    <div className="bg-gray-800 p-2 rounded text-sm">
      <div className="font-semibold">Loadout</div>
      <div className="text-xs text-gray-300">{loadout?.name || 'Default Loadout'}</div>
      <div className="mt-2 flex gap-2">
        <div className="px-2 py-1 bg-black/30 rounded">Prop: {loadout?.prop || 'None'}</div>
        <div className="px-2 py-1 bg-black/30 rounded">Emote: {loadout?.emote || 'None'}</div>
      </div>
    </div>
  );
}
