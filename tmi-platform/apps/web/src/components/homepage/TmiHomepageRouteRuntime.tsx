"use client";

import TmiHomepageDualOverlayShell from "./TmiHomepageDualOverlayShell";
import TmiHomepageRotationLayer from "./TmiHomepageRotationLayer";
import TmiHomepageStarfieldBurst from "./TmiHomepageStarfieldBurst";
import TmiHomepageBillboardPreview from "./TmiHomepageBillboardPreview";

function RearMorphLayer() {
  return (
    <div className="absolute inset-0 opacity-50">
      <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="absolute right-0 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full bg-cyan-400/20 blur-3xl" />
    </div>
  );
}

function FrontHotspots() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="pointer-events-auto absolute bottom-3 right-3 rounded-full border border-cyan-300/60 bg-black/50 px-2 py-1 text-[10px] font-black uppercase text-cyan-100">
        Interactive Hotspots
      </div>
    </div>
  );
}

export default function TmiHomepageRouteRuntime({ section }: { section: "1" | "1-2" | "2" | "3" | "4" | "5" }) {
  const showBillboard = section === "4" || section === "5";
  const showBurst = section === "1-2" || section === "2";

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black px-4 py-6 text-white">
      <div className="mx-auto max-w-[1300px] space-y-4">
        <header className="rounded-2xl border border-white/15 bg-black/40 p-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-300">Magazine Shell · Home/{section}</p>
          <h1 className="text-lg font-black uppercase text-cyan-100">TMI Homepage Runtime</h1>
        </header>

        <TmiHomepageDualOverlayShell rear={<RearMorphLayer />} front={<FrontHotspots />}>
          <div className="relative p-3">
            <div className="rounded-xl border border-cyan-300/20 bg-gradient-to-r from-cyan-500/10 via-fuchsia-500/10 to-emerald-500/10 p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-200">Dynamic Neon Background + Rotation Layer</p>
            </div>
            <div className="mt-3">
              <TmiHomepageRotationLayer />
            </div>
            <TmiHomepageStarfieldBurst active={showBurst} />
          </div>
        </TmiHomepageDualOverlayShell>

        {showBillboard ? <TmiHomepageBillboardPreview /> : null}
      </div>
    </main>
  );
}
