"use client";

import { listLobbyParticipationBoard } from "@/lib/billboards/tmiLobbyParticipationBoardEngine";
import TmiHoverPreviewCard from "./TmiHoverPreviewCard";

export default function TmiParticipationBoard() {
  const items = listLobbyParticipationBoard();

  return (
    <section className="rounded-2xl border border-cyan-300/40 bg-black/60 p-4 backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-cyan-200">Participation Standings</h3>
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <TmiHoverPreviewCard
            key={item.id}
            title={item.label}
            subtitle={`${item.points.toLocaleString()} pts`}
            status={item.status}
            route={item.route}
            backRoute={item.backRoute}
            reason={item.reason}
          />
        ))}
      </div>
    </section>
  );
}
