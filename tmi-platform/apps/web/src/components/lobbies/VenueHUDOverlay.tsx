"use client";

import React, { useEffect, useState } from 'react';
import LobbyQueueRail, { type LobbyQueueEntry } from './LobbyQueueRail';
import LobbyReactionRail from './LobbyReactionRail';
import LobbyTipRail from './LobbyTipRail';
import LobbySeatGrid, { type TheaterSeat } from './LobbySeatGrid';
import {
  getLobbyFeedSnapshot,
  subscribeLobbyFeed,
  deriveVenueRankings,
} from '@/lib/lobby/LobbyFeedBus';

const SCAFFOLD_SEATS: TheaterSeat[] = [
  { id: 'MID-1', row: 'MID', index: 1, visualState: 'occupied', occupantName: 'NovaK' },
  { id: 'MID-2', row: 'MID', index: 2, visualState: 'vip', occupantName: undefined },
  { id: 'REAR-1', row: 'REAR', index: 1, visualState: 'open', occupantName: undefined },
  { id: 'REAR-2', row: 'REAR', index: 2, visualState: 'reserved', occupantName: 'Late Entry' },
];

export const VenueHUDOverlay = () => {
  // B3: Subscribe to LobbyFeedBus — live ranking feeds
  const [feed, setFeed] = useState(() => getLobbyFeedSnapshot());
  useEffect(() => subscribeLobbyFeed(setFeed), []);
  const rankings = deriveVenueRankings(feed);
  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex flex-col justify-between overflow-hidden">
      {/* Top / Sides Drawer Container */}
      <div className="flex flex-1 justify-between p-4 md:p-6 overflow-hidden">
        
        {/* Left Drawer: Active Queue & Legacy Grid Fallback */}
        <div className="pointer-events-auto w-64 flex flex-col gap-4 max-h-full">
          <div className="bg-black/60 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden shrink-0 flex flex-col max-h-[50%]">
             <LobbyQueueRail
              entries={MOCK_QUEUE}
              onJoinQueue={() => undefined}
              onLeaveQueue={() => undefined}
              onNextPerformer={() => undefined}
              onHostOverride={() => undefined}
              onFailedEntry={() => undefined}
             />
          </div>
          <div className="bg-black/60 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden flex-1 flex flex-col">
             <div className="p-3 border-b border-white/5">
               <h3 className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">Seat Grid Map (Admin/Fallback)</h3>
             </div>
             <div className="p-4 overflow-y-auto flex-1">
               <LobbySeatGrid seats={MOCK_SEATS} selectedSeatId={null} onSelectSeat={() => undefined} />
             </div>
          </div>

          {/* B3: Live rankings strip — wired to LobbyFeedBus */}
          <div className="bg-black/60 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden shrink-0">
            <div className="p-3 border-b border-white/5">
              <h3 className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">Live Rankings</h3>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              {[
                { label: "Room", value: rankings.room, accent: "#00FFFF" },
                { label: "Performer", value: rankings.performer, accent: "#00CC44" },
                { label: "Venue", value: rankings.venue, accent: "#c4b5fd" },
                { label: "Contest", value: rankings.contest, accent: "#f87171" },
              ].map(({ label, value, accent }) => (
                <div
                  key={label}
                  style={{
                    borderRadius: 8,
                    border: `1px solid ${accent}22`,
                    background: `${accent}08`,
                    padding: "6px 8px",
                  }}
                >
                  <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.18em", color: accent, textTransform: "uppercase", marginBottom: 2 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#f3e9ff" }}>
                    #{value > 0 ? value : "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Drawer: Tip Rail */}
        <div className="pointer-events-auto w-72 bg-black/60 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden max-h-full">
          <LobbyTipRail onSendTip={() => undefined} tipTotal={41} />
        </div>
      </div>

      {/* Bottom Action Bar: Global Reactions */}
      <div className="pointer-events-auto bg-black/80 backdrop-blur-md border-t border-white/5 p-4 md:p-6 shrink-0">
        <LobbyReactionRail onSendReaction={() => undefined} reactionCount={128} />
      </div>
    </div>
  );
};