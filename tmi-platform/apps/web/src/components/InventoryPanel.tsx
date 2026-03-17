"use client";

import React, { useEffect, useState } from "react";
import { getInventory, getLoadout, equipProp, equipEmote, Item } from "../lib/inventoryState";

export function InventoryPanel({ onEquip }: { onEquip?: () => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loadout, setLoadout] = useState<any>(getLoadout());

  useEffect(() => {
    setItems(getInventory());
    function onChange(e: any) {
      setLoadout(e.detail || getLoadout());
      if (onEquip) onEquip();
    }
    window.addEventListener('bb:loadout:changed', onChange as EventListener);
    return () => window.removeEventListener('bb:loadout:changed', onChange as EventListener);
  }, []);

  const props = items.filter((i) => i.type === 'prop');
  const emotes = items.filter((i) => i.type === 'emote');

  return (
    <div className="bg-gray-900 p-3 rounded space-y-3">
      <div>
        <div className="text-sm font-semibold mb-2">Props</div>
        <div className="flex gap-2 flex-wrap">
          {props.map((p) => (
            <div key={p.id} className="p-2 bg-gray-800 rounded text-xs">
              <div className="font-medium">{p.name}</div>
              <div className="mt-1 flex gap-1">
                <button
                  disabled={!p.owned}
                  onClick={() => { equipProp(p.owned ? p.id : null); setLoadout(getLoadout()); if (onEquip) onEquip(); }}
                  className={`px-2 py-1 rounded ${p.owned ? 'bg-green-600' : 'bg-gray-600 opacity-60'}`}
                >
                  {loadout?.prop === p.id ? 'Equipped' : p.owned ? 'Equip' : 'Locked'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold mb-2">Emotes</div>
        <div className="flex gap-2 flex-wrap">
          {emotes.map((e) => (
            <div key={e.id} className="p-2 bg-gray-800 rounded text-xs">
              <div className="font-medium">{e.name}</div>
              <div className="mt-1 flex gap-1">
                <button
                  disabled={!e.owned}
                  onClick={() => { equipEmote(e.owned ? e.id : null); setLoadout(getLoadout()); if (onEquip) onEquip(); }}
                  className={`px-2 py-1 rounded ${e.owned ? 'bg-green-600' : 'bg-gray-600 opacity-60'}`}
                >
                  {loadout?.emote === e.id ? 'Equipped' : e.owned ? 'Equip' : 'Locked'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
