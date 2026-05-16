"use client";

import { AnimatePresence, motion } from "framer-motion";
import Top10Rotator from "@/packages/home/experience/Top10Rotator";
import MagazineArtifactCanvas from "@/packages/home/experience/MagazineArtifactCanvas";
import VerticalGenreScroller from "@/packages/motion/VerticalGenreScroller";
import { useGenreRotation } from "@/lib/engine/GenreRotationEngine";
import {
  HomepageLoopProvider,
  HOMEPAGE_LOOP_DEFAULT_SCENES,
  type HomepageKey,
  useHomepageLoop,
} from "@/lib/engine/HomepageLoopEngine";
import { TOP10_FACE_BY_GENRE } from "@/packages/home/experience/top10FaceData";

function SceneFrame({ title, subtitle, tone, children }: {
  title: string;
  subtitle: string;
  tone: "cyan" | "fuchsia" | "emerald" | "amber" | "rose";
  children: React.ReactNode;
}) {
  const toneClass: Record<string, string> = {
    cyan: "border-cyan-300/40",
    fuchsia: "border-fuchsia-300/40",
    emerald: "border-emerald-300/40",
    amber: "border-amber-300/40",
    rose: "border-rose-300/40",
  };

  return (
    <section className={`relative overflow-hidden rounded-2xl border bg-black/65 p-4 backdrop-blur-sm ${toneClass[tone]}`}>
      <MagazineArtifactCanvas />
      <div className="relative z-10 mb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70">TMI Cinematic Loop</p>
          <h2 className="text-xl font-black uppercase tracking-tight text-white">{title}</h2>
        </div>
        <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-300">{subtitle}</p>
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
}

function HomeLoopRuntime() {
  const { state, setScene } = useHomepageLoop();
  const { genre, label } = useGenreRotation(5000);
  const entries = TOP10_FACE_BY_GENRE[genre] ?? [];

  const sceneMap: Record<HomepageKey, React.ReactNode> = {
    home1: (
      <SceneFrame title="Home 1 · Cover Orbit" subtitle={`${label} · 5s micro-loop`} tone="cyan">
        <Top10Rotator />
      </SceneFrame>
    ),
    home1_2: (
      <SceneFrame title="Home 1-2 · Vertical Genre Scroller" subtitle={`${label} · conveyor mode`} tone="fuchsia">
        <VerticalGenreScroller genre={genre} entries={entries} />
      </SceneFrame>
    ),
    home2: (
      <SceneFrame title="Home 2 · Discovery" subtitle={`${label} · horizontal data drift`} tone="emerald">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {entries.slice(0, 6).map((artist, i) => (
            <motion.div
              key={artist.id}
              className="rounded-lg border border-emerald-300/30 bg-emerald-400/10 p-3"
              animate={{ x: [0, i % 2 === 0 ? 8 : -8, 0] }}
              transition={{ duration: 2.5 + i * 0.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="text-xs font-black uppercase text-white">{artist.name}</p>
              <p className="text-[10px] uppercase text-zinc-300">{artist.genreLabel} · discovery stream</p>
            </motion.div>
          ))}
        </div>
      </SceneFrame>
    ),
    home3: (
      <SceneFrame title="Home 3 · Live World" subtitle="live badges + occupancy pulse" tone="rose">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {["Cypher Arena", "Battle Ring", "Watch Party", "Main Stage"].map((room, i) => (
            <motion.div
              key={room}
              className="rounded-xl border border-rose-300/35 bg-rose-500/10 p-3"
              animate={{ opacity: [0.75, 1, 0.75], scale: [1, 1.02, 1] }}
              transition={{ duration: 1.4 + i * 0.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="mb-1 inline-flex rounded-full border border-red-300/45 bg-red-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-red-100">LIVE</p>
              <p className="text-xs font-black uppercase text-white">{room}</p>
              <p className="text-[10px] uppercase text-zinc-300">occupancy {(70 + i * 6)}%</p>
            </motion.div>
          ))}
        </div>
      </SceneFrame>
    ),
    home4: (
      <SceneFrame title="Home 4 · Control" subtitle="system metrics + scoreboards" tone="amber">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {["Route Health", "Queue Throughput", "Contest Tick"].map((metric, i) => (
            <motion.div
              key={metric}
              className="rounded-xl border border-amber-300/35 bg-amber-500/10 p-3"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-100">{metric}</p>
              <p className="mt-1 text-lg font-black text-white">{97 - i}%</p>
            </motion.div>
          ))}
        </div>
      </SceneFrame>
    ),
    home5: (
      <SceneFrame title="Home 5 · Sponsors" subtitle="billboard and ad rotation" tone="fuchsia">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {entries.slice(0, 3).map((artist, i) => (
            <motion.div
              key={artist.id}
              className="rounded-xl border border-fuchsia-300/35 bg-fuchsia-500/10 p-3"
              animate={{ x: [0, i % 2 ? 6 : -6, 0] }}
              transition={{ duration: 2.2 + i * 0.25, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-fuchsia-100">Ad Slot {i + 1}</p>
              <p className="text-xs font-black uppercase text-white">{artist.name} Sponsorship</p>
              <p className="text-[10px] uppercase text-zinc-300">genre {artist.genreLabel}</p>
            </motion.div>
          ))}
        </div>
      </SceneFrame>
    ),
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-3 px-4 py-6">
      <div className="flex flex-wrap items-center gap-2">
        {HOMEPAGE_LOOP_DEFAULT_SCENES.map((scene) => (
          <button
            key={scene.key}
            onClick={() => setScene(scene.key)}
            className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${state.current === scene.key ? "border-cyan-300/70 bg-cyan-400/20 text-cyan-100" : "border-white/20 bg-black/40 text-zinc-300"}`}
          >
            {scene.key}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/15 bg-black/55 px-3 py-2 text-xs uppercase tracking-[0.16em] text-zinc-300">
        Scene: <span className="text-cyan-200">{state.current}</span> · next <span className="text-fuchsia-200">{state.next}</span> · phase <span className="text-emerald-200">{state.phase}</span> · remaining {Math.ceil(state.remaining / 1000)}s · cycle #{state.cycle}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={state.current}
          initial={{ opacity: 0, y: 24, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 1.01 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          {sceneMap[state.current]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function HomepageLoopShell() {
  return (
    <HomepageLoopProvider>
      <HomeLoopRuntime />
    </HomepageLoopProvider>
  );
}
