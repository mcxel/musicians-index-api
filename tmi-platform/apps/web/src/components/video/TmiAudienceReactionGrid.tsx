"use client";

import { listAudienceReactions } from "@/lib/audience/tmiAudienceReactionEngine";

export default function TmiAudienceReactionGrid({ roomId }: { roomId: string }) {
  const reactions = listAudienceReactions(roomId).slice(-24).reverse();

  return (
    <section className="rounded-2xl border border-amber-300/35 bg-black/55 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200">Audience Reaction Grid</p>
      <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
        {reactions.length === 0 && (
          <div className="rounded-lg border border-white/10 bg-zinc-900/70 px-2 py-2 text-[10px] uppercase tracking-[0.14em] text-zinc-400">
            No reactions yet
          </div>
        )}
        {reactions.map((reaction, index) => (
          <div
            key={`${reaction.fanId}-${reaction.reaction}-${reaction.emittedAt}-${index}`}
            className="rounded-lg border border-amber-300/25 bg-amber-500/10 px-2 py-2"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-100">{reaction.reaction}</p>
            <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-300">{reaction.fanId.slice(0, 8)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
