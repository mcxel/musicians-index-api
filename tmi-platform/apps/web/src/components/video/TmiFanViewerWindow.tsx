"use client";

import { readPerformerFeed } from "@/lib/video/tmiLivePerformerFeedBridge";

export default function TmiFanViewerWindow({
  performerId,
  roomId,
  watching,
}: {
  performerId: string;
  roomId: string;
  watching: boolean;
}) {
  const feed = readPerformerFeed(performerId, roomId);

  return (
    <section className="rounded-2xl border border-fuchsia-300/35 bg-black/55 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-200">Fan Viewer</p>
      <div className="mt-2 rounded-xl border border-white/10 bg-zinc-950/80 p-3">
        {!watching && <p className="text-xs uppercase text-zinc-400">Neutral screen · not watching</p>}
        {watching && !feed?.isLive && <p className="text-xs uppercase text-zinc-400">Watching mode on · performer offline</p>}
        {watching && feed?.isLive && (
          <>
            <p className="text-xs uppercase text-fuchsia-100">Watching performer live</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-300">Audience: {feed.audienceCount}</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-300">Intensity: {feed.reactionIntensity}</p>
          </>
        )}
      </div>
    </section>
  );
}
