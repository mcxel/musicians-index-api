"use client";

import type { TmiGenreKey } from "@/lib/homepage/tmiGenreTransitionEngine";

export default function HomepageGenreTransition({ current }: { current: TmiGenreKey }) {
  return (
    <div className="rounded-xl border border-fuchsia-300/35 bg-black/45 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-100">
      Genre Rotation · <span className="text-cyan-200">{current}</span>
    </div>
  );
}
