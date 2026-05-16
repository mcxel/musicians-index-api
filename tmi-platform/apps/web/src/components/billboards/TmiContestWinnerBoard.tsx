"use client";

import { getLobbyContestWinnerBoard } from "@/lib/billboards/tmiLobbyContestWinnerBoardEngine";
import TmiHoverPreviewCard from "./TmiHoverPreviewCard";

export default function TmiContestWinnerBoard() {
  const board = getLobbyContestWinnerBoard();
  const categories = Object.entries(board);

  return (
    <section className="rounded-2xl border border-amber-300/40 bg-black/60 p-4 backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-amber-200">Contest Winners</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {categories.map(([category, entries]) => (
          <div key={category} className="rounded-xl border border-amber-300/25 bg-amber-500/5 p-3">
            <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-amber-100">{category}</p>
            <div className="space-y-2">
              {entries.map((entry) => (
                <TmiHoverPreviewCard
                  key={entry.id}
                  title={entry.title}
                  subtitle={`${entry.winnerName} · ${entry.prize}`}
                  status={entry.status}
                  route={entry.route}
                  backRoute={entry.backRoute}
                  reason={entry.reason}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
