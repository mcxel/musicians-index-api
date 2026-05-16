"use client";

import { getLobbyRankBoard } from "@/lib/billboards/tmiLobbyRankBoardEngine";
import TmiHoverPreviewCard from "./TmiHoverPreviewCard";

function RankCard({
  title,
  score,
  status,
  reason,
  route,
  backRoute,
}: {
  title: string;
  score: number;
  status: "ACTIVE" | "LOCKED" | "NEEDS_SETUP";
  reason?: string;
  route: string;
  backRoute: string;
}) {
  return (
    <TmiHoverPreviewCard
      title={title}
      subtitle={`score ${score.toLocaleString()}`}
      status={status}
      route={route}
      backRoute={backRoute}
      reason={reason}
    />
  );
}

export default function TmiRankingBoard() {
  const board = getLobbyRankBoard();

  return (
    <section className="rounded-2xl border border-fuchsia-300/40 bg-black/60 p-4 backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-fuchsia-200">Ranking Boards</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-300">Artist Rankings</p>
          {board.artists.map((item) => (
            <RankCard key={item.id} {...item} />
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-300">Track Rankings</p>
          {board.tracks.map((item) => (
            <RankCard key={item.id} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
