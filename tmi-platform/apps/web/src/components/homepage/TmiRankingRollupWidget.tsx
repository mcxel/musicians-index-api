"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import TmiStatusChip from "@/components/billboards/TmiStatusChip";
import TmiArtistMotionPortrait from "@/components/homepage/TmiArtistMotionPortrait";
import {
  buildNextRankingMotionState,
  createInitialRankingMotionState,
  type TmiRankingArtist,
} from "@/lib/homepage/tmiRankingMotionEngine";

type TmiRankingRollupWidgetProps = {
  cycleMs?: number;
  paperLocked?: boolean;
  onSoundHook?: (payload: { cycle: number; type: "rollup-start" | "rollup-complete" }) => void;
  onCrownFlashHook?: (artistId: string) => void;
};

function movementClass(artist: TmiRankingArtist, rolling: boolean): string {
  if (!rolling) return "translate-y-0";
  return artist.direction === "UP" ? "-translate-y-24" : "translate-y-20";
}

export default function TmiRankingRollupWidget({
  cycleMs = 5200,
  paperLocked = false,
  onSoundHook,
  onCrownFlashHook,
}: TmiRankingRollupWidgetProps) {
  const [rolling, setRolling] = useState(false);
  const [state, setState] = useState(createInitialRankingMotionState);

  const winner = useMemo(() => state.artists.find((artist) => artist.rank === 1), [state.artists]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRolling(true);
      onSoundHook?.({ cycle: state.cycle, type: "rollup-start" });

      window.setTimeout(() => {
        setState((previous) => buildNextRankingMotionState(previous));
        setRolling(false);
      }, 920);
    }, cycleMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [cycleMs, onSoundHook, state.cycle]);

  useEffect(() => {
    onSoundHook?.({ cycle: state.cycle, type: "rollup-complete" });
    if (winner?.direction === "UP") {
      onCrownFlashHook?.(winner.id);
    }
  }, [onCrownFlashHook, onSoundHook, state.cycle, winner]);

  return (
    <section className={paperLocked ? "h-full rounded-none border-0 bg-transparent p-0" : "rounded-xl border border-fuchsia-300/25 bg-black/28 p-3 backdrop-blur-[1px]"}>
      <div className={paperLocked ? "mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-fuchsia-300/20 px-1 pb-2" : "mb-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-fuchsia-300/20 bg-black/25 px-3 py-2"}>
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-fuchsia-100">
          Ranking Roll-Up Spread · {state.genreCluster.label}
        </p>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-zinc-300">
          <span>cycle {state.cycle}</span>
          <span className="rounded border border-zinc-500/30 px-2 py-0.5">printed grid</span>
        </div>
      </div>

      <div className="grid h-[calc(100%-40px)] gap-2 md:grid-cols-2 xl:grid-cols-4">
        {state.artists.map((artist) => {
          const up = artist.direction === "UP";
          const movementTone = up ? "text-emerald-200" : "text-rose-200";
          const movementTag = up ? "up" : "down";

          return (
            <article
              key={artist.id}
              className={[
                paperLocked
                  ? "rounded-md border border-fuchsia-300/20 bg-black/20 p-2 transition duration-700 hover:border-fuchsia-200/55"
                  : "rounded-lg border border-fuchsia-300/28 bg-black/36 p-3 transition duration-700 hover:border-fuchsia-200/70 hover:bg-black/52",
                movementClass(artist, rolling),
              ].join(" ")}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-fuchsia-100">{artist.genre}</p>
                <TmiStatusChip status={artist.status} />
              </div>

              <TmiArtistMotionPortrait stageName={artist.stageName} stillSrc={artist.stillSrc} motionSrc={artist.motionSrc} />

              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-sm font-black uppercase text-white">{artist.stageName}</p>
                <span className="rounded border border-white/20 px-2 py-0.5 text-xs font-black">#{artist.rank}</span>
              </div>

              <div className={`mt-1 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.12em] ${movementTone}`}>
                <span>{up ? "^" : "v"}</span>
                <span>{up ? "thumb-up" : "thumb-down"}</span>
                <span>{movementTag}</span>
                <span>{artist.delta > 0 ? `+${artist.delta}` : `${artist.delta}`}</span>
                <span className="text-zinc-400">prev #{artist.previousRank}</span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link href={artist.hubRoute} className="rounded border border-cyan-300/40 px-2 py-1 text-center text-[10px] font-bold uppercase hover:border-cyan-100">
                  View Account
                </Link>
                <Link href={`/vote?artist=${artist.id}`} className="rounded border border-fuchsia-300/40 px-2 py-1 text-center text-[10px] font-bold uppercase hover:border-fuchsia-100">
                  Vote
                </Link>
                <Link href={artist.profileRoute} className="rounded border border-emerald-300/40 px-2 py-1 text-center text-[10px] font-bold uppercase hover:border-emerald-100">
                  Artist
                </Link>
                <Link href={artist.articleRoute} className="rounded border border-zinc-500/50 px-2 py-1 text-center text-[10px] font-bold uppercase hover:border-zinc-300">
                  Story
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
