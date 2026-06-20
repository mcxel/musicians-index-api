"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TmiAudienceSeatGrid from "@/components/audience/TmiAudienceSeatGrid";
import TmiSeatReactionControls from "@/components/audience/TmiSeatReactionControls";
import TmiMoveCloserPanel from "@/components/audience/TmiMoveCloserPanel";
import type { TmiSeatedAudiencePresence } from "@/lib/audience/tmiAudienceSeatPresenceEngine";
import { getAudienceViewpointFromSeat } from "@/lib/audience/tmiAudienceViewpointEngine";
import type { TmiSeatTier } from "@/lib/audience/tmiSeatTierEngine";
import { generateSeatMap } from "@/lib/audience/tmiFanAvatarSeatAssignment";
import { useSeatSession } from "@/lib/seats/useSeatSession";
import { getGuestId } from "@/lib/identity/getGuestId";

const DEFAULT_SEATS = generateSeatMap(4, 8, { vipCols: 2 });

const POLL_MS = 4000;

/**
 * Calls /api/live/seat-presence instead of importing the audience engines
 * directly. Previously this component called joinAudienceSeat()/
 * listAudiencePresence() straight from client code, which meant the real
 * PRESENCE map lived only inside one fan's own browser tab — accurate data,
 * but invisible to every other real fan in the same room. The API route
 * shares the same engine server-side; polling is what lets other fans who
 * joined appear here without a websocket layer.
 */
export default function TmiAudiencePerspectiveShell({
  roomId = "main-arena",
  fanId,
}: {
  roomId?: string;
  fanId?: string;
}) {
  // Default to the same shared guest identity UniversalVenueRenderer uses —
  // found via the Phase 3C browser certification (2026-06-20) that this
  // component's old "fan-you" literal collided with that component's old
  // "guest-user" literal, producing two audience entries for one real
  // anonymous visitor on the same room page.
  const resolvedFanId = fanId ?? getGuestId();
  const [tier, setTier] = useState<TmiSeatTier>("free-back-row");
  const [audience, setAudience] = useState<TmiSeatedAudiencePresence[]>([]);
  const seatIdRef = useRef<string | null>(null);
  const joinedTierRef = useRef<TmiSeatTier | null>(null);
  // Phase 3A — Seat Persistence Convergence (2026-06-20): same reclaim
  // capability as UniversalLobbyEntry — a returning fan gets their real prior
  // seat back instead of a fresh assignment, inherited from SeatingMeshEngine.
  const seatSession = useSeatSession(roomId, resolvedFanId);

  const refresh = () => {
    fetch(`/api/live/seat-presence?room=${encodeURIComponent(roomId)}`)
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data?.audience)) setAudience(data.audience); })
      .catch(() => { /* honest no-op — next poll retries */ });
  };

  // Get a real seat from the canonical room-membership engine first (the
  // same one ArenaImmersivePanel/VenueImmersiveRoom/the lobby flow use), then
  // layer presence/reaction state on top of THAT seat — not a second,
  // independent one. Note: a tier change here re-labels the same physical
  // seat rather than moving the fan to a better one; real seat-swapping on
  // upgrade would need audienceRuntimeEngine to support it, which it
  // doesn't yet — not faked here.
  useEffect(() => {
    if (joinedTierRef.current === tier) return;
    joinedTierRef.current = tier;
    (async () => {
      try {
        let seatId = seatIdRef.current ?? seatSession.seatId;
        if (!seatId) {
          const joinRes = await fetch("/api/live/audience", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "join",
              venueSlug: roomId,
              member: { userId: resolvedFanId, displayName: resolvedFanId, role: "fan", seatId: seatSession.seatId },
            }),
          });
          const joinData = await joinRes.json();
          seatId = typeof joinData?.assignedSeatId === "string" ? joinData.assignedSeatId : null;
          seatIdRef.current = seatId;
          if (seatId) seatSession.claim(seatId);
        }
        if (!seatId) return;
        const presenceRes = await fetch("/api/live/seat-presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "join", roomId, fanId: resolvedFanId, tier, seatId }),
        });
        const presenceData = await presenceRes.json();
        if (Array.isArray(presenceData?.audience)) setAudience(presenceData.audience);
      } catch {
        // honest no-op — next poll retries
      }
    })();
  }, [roomId, resolvedFanId, tier]);

  // Poll so other real fans who joined this room actually show up.
  useEffect(() => {
    const interval = setInterval(refresh, POLL_MS);
    return () => clearInterval(interval);
  }, [roomId]);

  const you = audience.find((entry) => entry.fanId === resolvedFanId);

  const viewpoint = useMemo(() => {
    if (!you) return undefined;
    return getAudienceViewpointFromSeat(you.assignment.seat, you.assignment.tier);
  }, [you]);

  return (
    <section className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-2xl border border-cyan-300/35 bg-black/55 p-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200">Audience Perspective</p>
        <p className="mt-1 text-xs uppercase text-zinc-300">
          camera {viewpoint ? `${viewpoint.cameraX.toFixed(1)}, ${viewpoint.cameraY.toFixed(1)}, ${viewpoint.cameraZ.toFixed(1)}` : "n/a"}
        </p>
        <div className="mt-3">
          <TmiAudienceSeatGrid rows={4} cols={8} seatMap={DEFAULT_SEATS} audience={audience} currentFanId={resolvedFanId} />
        </div>
      </div>

      <div className="space-y-3">
        <TmiSeatReactionControls roomId={roomId} fanId={resolvedFanId} onReaction={refresh} />
        <TmiMoveCloserPanel
          currentTier={tier}
          onTierChange={(nextTier) => setTier(nextTier)}
        />
      </div>
    </section>
  );
}
