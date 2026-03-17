"use client";

import React, { useEffect, useState } from "react";
import { getLoadout } from "../lib/inventoryState";
import { InventoryPanel } from "./InventoryPanel";
import { PreviewProp } from "./PreviewProp";

export function AvatarCreator() {
  const [loadout, setLoadout] = useState(getLoadout());

  useEffect(() => {
    function onLoadout(e: any) {
      setLoadout(e.detail || getLoadout());
    }
    window.addEventListener('bb:loadout:changed', onLoadout as EventListener);
    return () => window.removeEventListener('bb:loadout:changed', onLoadout as EventListener);
  }, []);

  return (
    <div className="bg-gray-900 p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-3">Avatar Creation Center</h2>
      <p className="text-gray-300 text-sm mb-4">Create or upload a face photo to generate a bobblehead avatar.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-800 rounded">
          <div className="aspect-square bg-black/40 flex items-center justify-center text-white text-2xl">Camera Preview</div>
          <div className="mt-3 flex gap-2">
            <button className="px-3 py-2 bg-orange-500 rounded">Capture</button>
            <button className="px-3 py-2 bg-gray-700 rounded">Upload Photo</button>
            <button className="px-3 py-2 bg-gray-700 rounded">Manual Builder</button>
          </div>
        </div>

        <div className="p-4 bg-gray-800 rounded">
          <h3 className="font-semibold mb-2">Preview</h3>
          <div className="aspect-square bg-black/30 rounded flex items-center justify-center text-white relative">
            <div>360° Preview</div>
            {/* Prop preview (compact) */}
            <div className="absolute bottom-2 right-2">
              {/* show equipped prop preview if available */}
              {/* preview object stored to sessionStorage by the preview button */}
              <PreviewProp />
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-2">AI-assisted generation + manual tweaks (name, outfit, accessories).</p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {
                const preview = { name: 'You', outfit: 'default', equipped: loadout };
                try { sessionStorage.setItem('previewAvatar', JSON.stringify(preview)); } catch (e) {}
                window.location.href = '/room/bar-stage';
              }}
              className="px-3 py-2 bg-green-600 rounded"
            >
              Preview in Venue
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <InventoryPanel onEquip={() => { const l = getLoadout(); setLoadout(l); }} />
        </div>
      </div>
    </div>
  );
}
