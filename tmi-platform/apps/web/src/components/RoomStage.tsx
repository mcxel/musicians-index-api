"use client";

import React from "react";
import { PropEffects } from "./PropEffects";

export function RoomStage({ propOn, equippedProp, health }: { propOn?: boolean; equippedProp?: string | null; health?: 'healthy'|'degraded'|'safe-mode' | null }) {
  return (
    <div className="bg-gradient-to-br from-black/40 to-black/20 rounded p-3 relative">
      <div className="h-28 flex items-center justify-center relative">
        <div className="text-white font-bold">Bar Stage</div>
        {propOn && (
          <div className="absolute right-4 bottom-2">
            <PropEffects equippedProp={equippedProp} active={propOn} health={health || 'healthy'} />
          </div>
        )}
      </div>
    </div>
  );
}
