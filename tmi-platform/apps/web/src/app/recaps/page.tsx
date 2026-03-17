import React from "react";

function readRecaps() {
  try {
    const raw = sessionStorage.getItem('bb_recaps_v1');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

export default function RecapsPage() {
  const recaps = typeof window !== 'undefined' ? readRecaps() : [];

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Recaps (Placeholder)</h1>
        {recaps.length === 0 && <div className="text-gray-400">No recaps saved yet.</div>}
        <div className="space-y-3 mt-4">
          {recaps.map((r: any) => (
            <div key={r.id} className="bg-gray-800 p-3 rounded">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{r.room}</div>
                <div className="text-xs text-gray-400">{new Date(r.timestamp).toLocaleString()}</div>
              </div>
              <div className="text-sm text-gray-300 mt-2">
                <div>Prop: {r.prop || 'None'}</div>
                <div>Emote: {r.emote || 'None'}</div>
                <div>Tip: {r.latestTip || 'None'}</div>
                <div>Chat: {r.latestChat || 'None'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
