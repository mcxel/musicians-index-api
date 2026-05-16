"use client";

import { useMemo, useState } from "react";
import { listHomepageLayerStack } from "@/lib/homepage/tmiHomepageLayerStackEngine";
import { listHomepageIssueSkins } from "@/lib/homepage/tmiHomepageIssueMutationEngine";
import { buildHomepageStarburst } from "@/lib/homepage/tmiHomepageStarburstTransitionEngine";
import HomepageStarfieldBurst from "@/components/home/HomepageStarfieldBurst";

export default function TmiHomepageLayerWorld() {
  const layers = listHomepageLayerStack();
  const skins = listHomepageIssueSkins();
  const [skinIndex, setSkinIndex] = useState(0);
  const [seed, setSeed] = useState(Date.now());

  const skin = skins[skinIndex] ?? skins[0];
  const rays = useMemo(() => buildHomepageStarburst(seed), [seed]);

  const nextSkin = () => {
    setSkinIndex((prev) => (prev + 1) % skins.length);
    setSeed(Date.now());
  };

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-cyan-300/35 p-4"
      style={{ background: `linear-gradient(135deg, ${skin.backgroundPalette.join(", ")})` }}
    >
      <HomepageStarfieldBurst seed={seed} />
      <div className="relative z-10 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">Homepage Layer World · {skin.issueId}</p>
        <button
          onClick={nextSkin}
          className="rounded-full border border-fuchsia-300/40 bg-fuchsia-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-fuchsia-100"
        >
          next issue skin
        </button>
      </div>

      <div className="relative mt-3 rounded-2xl border border-white/15 bg-black/35 p-3">
        {layers.map((layer) => (
          <div
            key={layer.key}
            className="mb-2 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-zinc-200"
            style={{ zIndex: layer.zIndex }}
          >
            {layer.zIndex}. {layer.key} · {layer.interactive ? "interactive" : "decorative"}
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {rays.slice(0, 6).map((ray) => (
          <div key={ray.id} className="rounded-lg border border-fuchsia-300/25 bg-fuchsia-500/10 px-2 py-1 text-[10px] uppercase text-fuchsia-100">
            ray {ray.angleDeg}° · len {ray.length}
          </div>
        ))}
      </div>
    </section>
  );
}
