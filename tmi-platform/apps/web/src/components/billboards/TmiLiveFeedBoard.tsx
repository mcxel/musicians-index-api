"use client";

import { listLobbyLiveFeedBoard } from "@/lib/billboards/tmiLobbyLiveFeedBoardEngine";
import TmiHoverPreviewCard from "./TmiHoverPreviewCard";

export default function TmiLiveFeedBoard() {
  const feeds = listLobbyLiveFeedBoard();

  return (
    <section className="rounded-2xl border border-rose-300/40 bg-black/60 p-4 backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-rose-200">Live Feed Wall</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {feeds.map((feed) => (
          <TmiHoverPreviewCard
            key={feed.id}
            title={feed.title}
            subtitle={`${feed.type} · viewers ${feed.viewerCount.toLocaleString()} · reactions ${feed.reactionCount.toLocaleString()}`}
            status={feed.status}
            route={feed.route}
            backRoute={feed.backRoute}
            reason={feed.reason}
          />
        ))}
      </div>
    </section>
  );
}
