"use client";

import React, { useEffect, useState } from "react";

type HealthState = 'healthy' | 'degraded' | 'safe-mode';

const KEY = 'bb_room_health_bar-stage';

export function RoomHealthCard() {
  const [health, setHealth] = useState<HealthState>('healthy');

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY) as HealthState | null;
      if (raw) setHealth(raw);
    } catch (e) {}
  }, []);

  function setAndEmit(s: HealthState) {
    setHealth(s);
    try { sessionStorage.setItem(KEY, s); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent('bb:room:health:changed', { detail: { room: 'bar-stage', health: s } })); } catch (e) {}
  }

  return (
    <div className="bg-gray-900 p-3 rounded space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">Room Health</div>
          <div className="text-xs text-gray-400">Local self-heal status (placeholder)</div>
        </div>
        <div className="text-sm">
          <span className={`px-2 py-1 rounded text-xs ${health === 'healthy' ? 'bg-green-600' : health === 'degraded' ? 'bg-yellow-600' : 'bg-red-600'}`}>
            {health}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setAndEmit('degraded')} className="px-2 py-1 bg-yellow-600 rounded">Simulate Issue</button>
        <button onClick={() => setAndEmit('safe-mode')} className="px-2 py-1 bg-red-600 rounded">Enter Safe-Mode</button>
        <button onClick={() => setAndEmit('healthy')} className="px-2 py-1 bg-green-600 rounded">Recover Room</button>
      </div>
    </div>
  );
}
