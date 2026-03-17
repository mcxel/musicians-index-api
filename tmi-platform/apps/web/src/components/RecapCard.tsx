"use client";

import React, { useEffect, useState } from "react";
import { getLoadout } from "../lib/inventoryState";
import { sendRecapTask, RecapItem } from "../lib/toolOrchestrator";

type Recap = {
  id: string;
  room: string;
  timestamp: string;
  prop?: string | null;
  emote?: string | null;
  latestTip?: string | null;
  latestChat?: string | null;
};

const RECAPS_KEY = 'bb_recaps_v1';

function readRecaps(): Recap[] {
  try {
    const raw = sessionStorage.getItem(RECAPS_KEY);
    if (raw) return JSON.parse(raw) as Recap[];
  } catch (e) {}
  return [];
}

function saveRecap(r: Recap) {
  const arr = readRecaps();
  arr.unshift(r);
  try { sessionStorage.setItem(RECAPS_KEY, JSON.stringify(arr)); } catch (e) {}
  try { window.dispatchEvent(new CustomEvent('bb:recap:saved', { detail: r })); } catch (e) {}
}

export function RecapCard({ room = 'Bar Stage' }: { room?: string }) {
  const [latestTip, setLatestTip] = useState<string | null>(null);
  const [latestChat, setLatestChat] = useState<string | null>(null);
  const [loadout, setLoadout] = useState<any>(getLoadout());

  useEffect(() => {
    try { const lt = sessionStorage.getItem('bb_latest_tip'); if (lt) setLatestTip(lt); } catch (e) {}
    try { const lc = sessionStorage.getItem('bb_latest_chat'); if (lc) setLatestChat(lc); } catch (e) {}

    function onTip(e: any) { setLatestTip(String(e?.detail?.amount || '')); }
    function onChat(e: any) { setLatestChat(e?.detail?.text || null); }
    function onLoadout(e: any) { setLoadout(e.detail || getLoadout()); }

    window.addEventListener('bb:tip', onTip as EventListener);
    window.addEventListener('bb:chat:latest', onChat as EventListener);
    window.addEventListener('bb:loadout:changed', onLoadout as EventListener);

    return () => {
      window.removeEventListener('bb:tip', onTip as EventListener);
      window.removeEventListener('bb:chat:latest', onChat as EventListener);
      window.removeEventListener('bb:loadout:changed', onLoadout as EventListener);
    };
  }, []);

  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const recap: Recap = {
      id: String(Date.now()),
      room,
      timestamp: new Date().toISOString(),
      prop: loadout?.prop || null,
      emote: loadout?.emote || null,
      latestTip: latestTip || null,
      latestChat: latestChat || null,
    };
    saveRecap(recap);
    
    // Wire up to tool orchestrator for potential AI processing
    setSaving(true);
    try {
      const recapItems: RecapItem[] = [
        {
          id: recap.id,
          title: `${recap.room} Recap`,
          body: `Prop: ${recap.prop || 'None'}, Emote: ${recap.emote || 'None'}, Tip: ${recap.latestTip || 'None'}`,
          timestamp: Date.now()
        }
      ];
      
      const result = await sendRecapTask({
        room: recap.room,
        route: `/room/${recap.room.toLowerCase().replace(/\s+/g, '-')}`,
        recaps: recapItems
      });
      
      if (result.ok) {
        alert(`Recap saved! Job ID: ${result.jobId}`);
      } else {
        alert('Recap saved locally (orchestrator validation failed)');
      }
    } catch (e) {
      alert('Recap saved locally (orchestrator error)');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-gray-900 p-3 rounded space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">Recap Placeholder</div>
          <div className="text-xs text-gray-400">Capture a lightweight room snapshot</div>
        </div>
        <div className="text-xs text-gray-300">{room}</div>
      </div>

      <div className="text-sm text-gray-300">
        <div>Equipped Prop: <span className="font-medium">{loadout?.prop || 'None'}</span></div>
        <div>Equipped Emote: <span className="font-medium">{loadout?.emote || 'None'}</span></div>
        <div>Latest Tip: <span className="font-medium">{latestTip || 'None'}</span></div>
        <div>Latest Chat: <span className="font-medium">{latestChat || 'None'}</span></div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className={`px-3 py-1 rounded ${saving ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {saving ? 'Saving...' : 'Save to Recap'}
        </button>
        <a href="/recaps" className="px-3 py-1 bg-gray-700 rounded">View Recaps</a>
      </div>
    </div>
  );
}
