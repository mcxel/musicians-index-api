"use client";

import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { GenreKey, TopArtistFaceEntry } from "@/packages/home/experience/top10FaceData";
import { resolveCtaPath } from "@/lib/ctaContractMap";
import { ImageSlotWrapper } from '@/components/visual-enforcement';

type VerticalGenreScrollerProps = {
  genre: GenreKey;
  entries: TopArtistFaceEntry[];
};

type ScrollerMode = "vertical" | "stack-pop" | "dual-column" | "burst-grid";

const MODES: ScrollerMode[] = ["vertical", "stack-pop", "dual-column", "burst-grid"];

export default function VerticalGenreScroller({ genre, entries }: VerticalGenreScrollerProps) {
  const [offset, setOffset] = useState(0);
  const [modeIndex, setModeIndex] = useState(0);

  useEffect(() => {
    setOffset(0);
  }, [genre]);

  useEffect(() => {
    const shiftId = window.setInterval(() => {
      setOffset((prev) => (prev + 1) % Math.max(1, entries.length));
    }, 1700);

    return () => window.clearInterval(shiftId);
  }, [entries.length]);

  useEffect(() => {
    const modeId = window.setInterval(() => {
      setModeIndex((prev) => (prev + 1) % MODES.length);
    }, 10000);

    return () => window.clearInterval(modeId);
  }, []);

  const mode = MODES[modeIndex];
  const rotated = useMemo(() => {
    if (!entries.length) return [];
    return [...entries.slice(offset), ...entries.slice(0, offset)];
  }, [entries, offset]);

  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-2xl border border-cyan-300/30 bg-black/65 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-200">Homepage 1-2 Vertical Genre Scroller</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-fuchsia-200">mode: {mode}</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${genre}-${mode}-${offset}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className={
            mode === "dual-column"
              ? "grid grid-cols-2 gap-2"
              : mode === "burst-grid"
              ? "grid grid-cols-2 gap-2"
              : "space-y-2"
          }
        >
          {rotated.slice(0, 8).map((artist, index) => {
            const profileHref = resolveCtaPath("artist-card-profile", { slug: artist.id });
            const rowClass =
              mode === "stack-pop"
                ? "translate-y-0"
                : mode === "burst-grid"
                ? "scale-[1.01]"
                : "";

            return (
              <motion.a
                href={profileHref}
                key={`${artist.id}-${index}`}
                className={`group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-2 hover:border-cyan-300/45 ${rowClass}`}
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
              >
                <ImageSlotWrapper imageId="img-4w1xu" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold uppercase tracking-wide text-white">#{artist.rank} {artist.name}</p>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-300">{artist.genreLabel} · {artist.score}</p>
                </div>
              </motion.a>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
