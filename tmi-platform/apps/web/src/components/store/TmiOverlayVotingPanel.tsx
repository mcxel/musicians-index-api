"use client";

import { useMemo, useState } from "react";
import { listOverlayMarketplaceItems } from "@/lib/store/tmiOverlayMarketplaceEngine";
import { castOverlayVote, type TmiOverlayVoteKind } from "@/lib/store/tmiOverlayVotingEngine";

type VoteIntent = "keep" | "retire" | "return" | "premium" | "free";

export default function TmiOverlayVotingPanel({ userId = "demo-user" }: { userId?: string }) {
  const [status, setStatus] = useState("No vote yet");
  const [selected, setSelected] = useState<string | null>(null);
  const items = useMemo(() => listOverlayMarketplaceItems().slice(0, 8), []);

  function mapIntent(intent: VoteIntent): TmiOverlayVoteKind {
    if (intent === "keep") return "yes";
    if (intent === "retire") return "retire";
    if (intent === "return") return "return-next-month";
    if (intent === "premium") return "premium";
    return "free";
  }

  function vote(intent: VoteIntent, overlayId: string) {
    const record = castOverlayVote(overlayId, userId, mapIntent(intent));
    setStatus(`Voted ${record.vote} on ${record.overlayId}`);
  }

  return (
    <section className="rounded-2xl border border-emerald-300/30 bg-black/60 p-4 shadow-[0_0_30px_rgba(16,185,129,0.2)] backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-emerald-100">Overlay Voting + Julius Poll Hook</h3>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {items.map((item, i) => (
          <article
            key={item.id}
            className={`rounded-xl border p-3 ${
              selected === item.id ? "border-emerald-300/60 bg-emerald-500/10" : "border-white/15 bg-black/35"
            }`}
          >
            <button onClick={() => setSelected(item.id)} className="mb-2 text-left text-xs font-black uppercase tracking-[0.12em] text-white">
              {item.title}
            </button>
            <p className="mb-2 text-[10px] uppercase tracking-[0.12em] text-zinc-300">Live support {55 + ((i * 7) % 33)}%</p>
            <div className="flex flex-wrap gap-1">
              <button onClick={() => vote("keep", item.id)} className="rounded-full border border-emerald-300/50 px-2 py-1 text-[10px] font-black uppercase text-emerald-100">keep</button>
              <button onClick={() => vote("retire", item.id)} className="rounded-full border border-rose-300/50 px-2 py-1 text-[10px] font-black uppercase text-rose-100">retire</button>
              <button onClick={() => vote("return", item.id)} className="rounded-full border border-cyan-300/50 px-2 py-1 text-[10px] font-black uppercase text-cyan-100">return</button>
              <button onClick={() => vote("premium", item.id)} className="rounded-full border border-fuchsia-300/50 px-2 py-1 text-[10px] font-black uppercase text-fuchsia-100">premium</button>
              <button onClick={() => vote("free", item.id)} className="rounded-full border border-amber-300/50 px-2 py-1 text-[10px] font-black uppercase text-amber-100">free</button>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-3 rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-zinc-200">{status}</div>
    </section>
  );
}
