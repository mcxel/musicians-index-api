"use client";

import React from "react";

interface AvatarPreview {
  name?: string;
  outfit?: string;
  equipped?: string[];
}

function AvatarPill({ label }: { label: string }) {
  return (
    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md">
      {label}
    </div>
  );
}

export function AudienceLayout({ preview }: { preview?: AvatarPreview }) {
  const seats = Array.from({ length: 6 }).map((_, i) => ({ id: `seat-${i}`, label: `S${i + 1}` }));
  const standing = Array.from({ length: 4 }).map((_, i) => ({ id: `stand-${i}`, label: `ST${i + 1}` }));

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <h4 className="text-sm font-semibold mb-3">Audience</h4>

      {/* Stage zone */}
      <div className="mb-4">
        <div className="bg-black/40 rounded p-3 text-center text-sm">Artist Stage Zone</div>
      </div>

      {/* Seated zone */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">Seated Zone</div>
        <div className="flex gap-3 flex-wrap">
          {seats.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-1">
              <AvatarPill label={s.label} />
              <div className="text-[10px] text-gray-300">{preview?.name || 'Guest'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Standing zone */}
      <div>
        <div className="text-xs text-gray-400 mb-2">Standing Zone</div>
        <div className="flex gap-3">
          {standing.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-1">
              <AvatarPill label={s.label} />
              <div className="text-[10px] text-gray-300">{preview?.name || 'Guest'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
