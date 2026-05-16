"use client";

import { useEffect, useState } from "react";
import { listHomepageOverlayFeed } from "@/lib/homepage/tmiHomepageOverlayFeedEngine";
import { nextRotation, type RotationState } from "@/lib/homepage/tmiHomepageRotationEngine";
import TmiHomepageOverlayFeed from "./TmiHomepageOverlayFeed";

const INITIAL: RotationState = {
  currentIndex: 0,
  currentGenre: "hip-hop",
  history: [],
};

export default function TmiHomepageRotationLayer() {
  const feed = listHomepageOverlayFeed();
  const [state, setState] = useState<RotationState>(INITIAL);

  useEffect(() => {
    const id = window.setInterval(() => {
      setState((prev) => nextRotation(feed, prev));
    }, 8000);
    return () => window.clearInterval(id);
  }, [feed]);

  const active = feed[state.currentIndex];

  return (
    <section className="space-y-3">
      <div className="rounded-xl border border-fuchsia-300/30 bg-black/45 p-3">
        <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-300">rotation genre</p>
        <p className="text-sm font-black uppercase text-fuchsia-100">{state.currentGenre}</p>
        <p className="text-xs uppercase text-white">{active?.title ?? "locked / needs setup"}</p>
      </div>
      <TmiHomepageOverlayFeed />
    </section>
  );
}
