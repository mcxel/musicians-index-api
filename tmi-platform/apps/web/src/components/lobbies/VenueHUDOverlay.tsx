"use client";

import React, { useEffect, useState } from 'react';
import LobbyQueueRail, { type LobbyQueueEntry } from './LobbyQueueRail';
import LobbyReactionRail from './LobbyReactionRail';
import LobbyTipRail from './LobbyTipRail';
import {
  getLobbyFeedSnapshot,
  subscribeLobbyFeed,
  deriveVenueRankings,
} from '@/lib/lobby/LobbyFeedBus';
import {
  advanceQueue,
  getQueueSnapshot,
  joinQueue as joinQueueEngine,
  removeFromQueue,
  type QueueSlot,
} from '@/lib/live/queueEngine';
import { CheckoutPaymentEngine } from '@/lib/stripe/CheckoutPaymentEngine';

export const VenueHUDOverlay = () => {
  // Subscribe to LobbyFeedBus — live ranking feeds
  const [feed, setFeed] = useState(() => getLobbyFeedSnapshot());
  const [tipTotal, setTipTotal] = useState(0);
  const [reactionCount, setReactionCount] = useState(0);
  const [queueEntries, setQueueEntries] = useState<LobbyQueueEntry[]>([]);

  useEffect(() => subscribeLobbyFeed(setFeed), []);

  const venueSlug = feed.slug || 'default-room';

  // Sync queue from engine when slug is available
  useEffect(() => {
    if (!venueSlug) return;
    const { slots } = getQueueSnapshot(venueSlug);
    setQueueEntries(
      slots.map((s) => ({
        slotId: s.slotId,
        performerId: s.performerId,
        performerName: s.performerName,
        state: s.status === 'on-stage' ? 'live' : s.status === 'done' ? 'complete' : s.status === 'next-up' || s.status === 'staging' ? 'onDeck' : 'waiting',
      } as import('./LobbyQueueRail').LobbyQueueEntry))
    );
  }, [venueSlug]);

  const rankings = deriveVenueRankings(feed);

  // Queue handlers — wired to real queue engine
  const handleJoinQueue = (performerId: string, performerName: string) => {
    const slot = joinQueueEngine(venueSlug, performerId, performerName, 5);
    setQueueEntries((prev) => [
      ...prev,
      {
        slotId: slot.slotId,
        performerId,
        performerName,
        state: 'waiting' as const,
      },
    ]);
  };

  const handleLeaveQueue = (performerId: string) => {
    removeFromQueue(venueSlug, performerId);
    setQueueEntries((prev) => prev.filter((e) => e.performerId !== performerId));
  };

  const handleNextPerformer = () => {
    advanceQueue(venueSlug);
    const { slots: updatedSlots } = getQueueSnapshot(venueSlug);
    setQueueEntries(
      updatedSlots.map((s) => ({
        slotId: s.slotId,
        performerId: s.performerId,
        performerName: s.performerName,
        state: s.status === 'on-stage' ? 'live' : s.status === 'done' ? 'complete' : s.status === 'next-up' || s.status === 'staging' ? 'onDeck' : 'waiting',
      } as import('./LobbyQueueRail').LobbyQueueEntry))
    );
  };

  // Tip handler — dispatches custom event so parent pages can respond
  const handleSendTip = (amount: number) => {
    setTipTotal((t) => t + amount);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('tmi:tip', { detail: { venueSlug, amountCents: amount } })
      );
    }
  };

  // Reaction handler — dispatches custom event
  const handleSendReaction = (type: string) => {
    setReactionCount((n) => n + 1);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('tmi:reaction', { detail: { venueSlug, type } })
      );
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex flex-col justify-between overflow-hidden">
      {/* Top / Sides Drawer Container */}
      <div className="flex flex-1 justify-between p-4 md:p-6 overflow-hidden">

        {/* Left Drawer: Queue Rail + Live Rankings */}
        <div className="pointer-events-auto w-64 flex flex-col gap-4 max-h-full">
          <div className="bg-black/60 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden shrink-0 flex flex-col max-h-[50%]">
             <LobbyQueueRail
              entries={queueEntries}
              onJoinQueue={handleJoinQueue}
              onLeaveQueue={handleLeaveQueue}
              onNextPerformer={handleNextPerformer}
              onHostOverride={handleNextPerformer}
              onFailedEntry={(id) => handleLeaveQueue(id)}
             />
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

          {/* Occupancy strip from LobbyFeedBus */}
          {feed.occupancyPct > 0 && (
            <div className="bg-black/60 backdrop-blur-md border border-white/5 rounded-xl p-3 shrink-0">
              <div className="text-[9px] font-black tracking-[0.2em] text-zinc-500 uppercase mb-2">Occupancy</div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#00FFFF] to-[#AA2DFF]"
                  style={{ width: `${Math.min(100, feed.occupancyPct)}%`, transition: 'width 0.5s ease' }}
                />
              </div>
              <div className="text-[9px] text-white/40 mt-1">{feed.occupancyPct.toFixed(0)}% ({feed.occupancy} present)</div>
            </div>
          )}
        </div>

        {/* Right Drawer: Tip Rail */}
        <div className="pointer-events-auto w-72 bg-black/60 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden max-h-full">
          <LobbyTipRail onSendTip={handleSendTip} tipTotal={tipTotal} />
        </div>
      </div>

      {/* Bottom Action Bar: Global Reactions */}
      <div className="pointer-events-auto bg-black/80 backdrop-blur-md border-t border-white/5 p-4 md:p-6 shrink-0">
        <LobbyReactionRail onSendReaction={handleSendReaction} reactionCount={reactionCount} />
      </div>
    </div>
  );
};
