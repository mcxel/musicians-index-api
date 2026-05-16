"use client";

import { listHomepageOverlaySyncStates } from "@/lib/homepage/tmiHomepageOverlaySync";
import type { TmiHomepageBeltKey } from "@/lib/homepage/tmiHomepageBeltEngine";

export default function HomepageBeltOverlayLayer({ page }: { page: TmiHomepageBeltKey }) {
  const states = listHomepageOverlaySyncStates(page);

  return (
    <div className="rounded-xl border border-cyan-300/35 bg-cyan-500/5 p-2">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100">Overlay Sync</p>
      <div className="mt-1 grid gap-1 text-[10px] uppercase text-zinc-200">
        {states.length ? states.map((state) => (
          <div key={state.overlayId} className="rounded border border-white/15 bg-black/35 px-2 py-1">
            {state.overlayId} · {state.motionKey} · {state.enabled ? "enabled" : "locked"}
          </div>
        )) : <div className="rounded border border-white/10 bg-black/25 px-2 py-1 text-zinc-400">no overlay bindings yet</div>}
      </div>
    </div>
  );
}
