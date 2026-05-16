"use client";

import { useState } from "react";
import { emitAudienceReaction, type TmiAudienceReaction } from "@/lib/audience/tmiAudienceReactionEngine";

const REACTIONS: TmiAudienceReaction[] = ["heart", "fire", "cheer", "clap", "vote", "tip", "chat", "spin", "cypher-join"];

export default function TmiSeatReactionControls({
  roomId,
  fanId,
  onReaction,
}: {
  roomId: string;
  fanId: string;
  onReaction?: (reaction: TmiAudienceReaction) => void;
}) {
  const [active, setActive] = useState<TmiAudienceReaction | null>(null);

  return (
    <div className="rounded-xl border border-fuchsia-300/40 bg-black/55 p-3">
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-200">Seat Reactions</p>
      <div className="flex flex-wrap gap-2">
        {REACTIONS.map((reaction) => (
          <button
            key={reaction}
            type="button"
            onClick={() => {
              emitAudienceReaction({ roomId, fanId, reaction });
              setActive(reaction);
              onReaction?.(reaction);
            }}
            className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
              active === reaction
                ? "border-fuchsia-300 bg-fuchsia-500/25 text-fuchsia-100"
                : "border-white/20 bg-zinc-900/70 text-zinc-200"
            }`}
          >
            {reaction.replace("-", " ")}
          </button>
        ))}
      </div>
    </div>
  );
}
