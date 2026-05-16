"use client";

import { useMemo } from "react";
import {
  LOBBY_BILLBOARD_ROTATION_MS,
  getLobbyBillboardRotationState,
  type LobbyBillboardLane,
} from "@/lib/billboards/tmiLobbyBillboardRotationEngine";
import TmiParticipationBoard from "./TmiParticipationBoard";
import TmiRankingBoard from "./TmiRankingBoard";
import TmiContestWinnerBoard from "./TmiContestWinnerBoard";
import TmiSponsorWall from "./TmiSponsorWall";
import TmiVenueBoard from "./TmiVenueBoard";
import TmiLiveFeedBoard from "./TmiLiveFeedBoard";

function useLaneState() {
  const tick = Math.floor(Date.now() / LOBBY_BILLBOARD_ROTATION_MS);
  return getLobbyBillboardRotationState(tick);
}

function LaneBody({ lane }: { lane: LobbyBillboardLane }) {
  if (lane === "participation") return <TmiParticipationBoard />;
  if (lane === "artist-rankings" || lane === "track-rankings") return <TmiRankingBoard />;
  if (lane === "contest-winners" || lane === "live-winners") return <TmiContestWinnerBoard />;
  if (lane === "sponsors") return <TmiSponsorWall />;
  if (lane === "venues") return <TmiVenueBoard />;
  return <TmiLiveFeedBoard />;
}

export default function TmiLobbyBillboardWall() {
  const rotation = useLaneState();
  const countdown = useMemo(() => {
    const elapsed = Date.now() % LOBBY_BILLBOARD_ROTATION_MS;
    return Math.max(0, Math.ceil((LOBBY_BILLBOARD_ROTATION_MS - elapsed) / 1000));
  }, []);

  return (
    <section className="rounded-3xl border border-cyan-300/40 bg-gradient-to-br from-black/80 via-[#09061a]/80 to-[#081021]/80 p-4 shadow-[0_0_40px_rgba(34,211,238,0.2)]">
      <header className="mb-4 grid gap-2 md:grid-cols-3">
        <div className="rounded-xl border border-cyan-300/30 bg-cyan-500/10 p-2 text-xs uppercase tracking-[0.15em] text-cyan-100">
          Current lane: <span className="font-black">{rotation.lane}</span>
        </div>
        <div className="rounded-xl border border-fuchsia-300/30 bg-fuchsia-500/10 p-2 text-xs uppercase tracking-[0.15em] text-fuchsia-100">
          Next lane: <span className="font-black">{rotation.nextLane}</span>
        </div>
        <div className="rounded-xl border border-amber-300/30 bg-amber-500/10 p-2 text-xs uppercase tracking-[0.15em] text-amber-100">
          Rotate in: <span className="font-black">{countdown}s</span>
        </div>
      </header>
      <LaneBody lane={rotation.lane} />
    </section>
  );
}
