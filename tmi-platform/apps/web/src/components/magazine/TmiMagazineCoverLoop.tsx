"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { getFlutterTransform } from "@/lib/magazine/TmiMagazineFlutterEngine";
import { useTmiMagazinePresenceEngine } from "@/lib/magazine/TmiMagazinePresenceEngine";
import { useTmiMagazineShineEngine } from "@/lib/magazine/TmiMagazineShineEngine";

type Props = {
  children: ReactNode;
  medallion?: ReactNode;
};

export default function TmiMagazineCoverLoop({ children, medallion }: Props) {
  const presence = useTmiMagazinePresenceEngine({ visibleMs: 15000, hiddenGapMs: 500 });
  const shine = useTmiMagazineShineEngine();
  const phase = presence?.phase ?? "visible";
  const exitTransition = presence?.exitTransition ?? "fade";
  const entryTransition = presence?.entryTransition ?? "fade-in";
  const transitionMs = presence?.transitionMs ?? 900;
  const crownPulseActive = Boolean(shine?.crownPulseActive);
  const logoShineActive = Boolean(shine?.logoShineActive);

  const containerStyle = useMemo(() => {
    if (phase === "hidden") {
      return { opacity: 0, transform: "scale(0.94)", filter: "blur(3px)" };
    }

    if (phase === "exiting") {
      if (exitTransition === "neon-collapse") return { opacity: 0, transform: "scale(0.78)" };
      if (exitTransition === "page-peel-vanish") return { opacity: 0, transform: "perspective(800px) rotateY(26deg) translateX(16px)" };
      if (exitTransition === "flash-vanish") return { opacity: 0, filter: "brightness(2.1)" };
      if (exitTransition === "dust-dissolve") return { opacity: 0, filter: "blur(4px)", transform: "translateY(8px)" };
      return { opacity: 0 };
    }

    if (phase === "entering") {
      if (entryTransition === "spin-settle") return { opacity: 1, transform: "rotate(-1.8deg) scale(0.98)" };
      if (entryTransition === "light-burst") return { opacity: 1, filter: "brightness(1.3)" };
      if (entryTransition === "snap-open") return { opacity: 1, transform: "translateX(0) scale(1.015)" };
      if (entryTransition === "shine-reveal") return { opacity: 1, filter: "brightness(1.25) saturate(1.15)" };
      if (entryTransition === "flutter-in") return getFlutterTransform(0.72);
      return { opacity: 1 };
    }

    return { opacity: 1, transform: "translateY(0px)" };
  }, [entryTransition, exitTransition, phase]);

  return (
    <div className="relative h-full w-full">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="relative h-[78vh] max-h-[78vh] w-[min(92vw,56vh)] max-w-[760px] animate-[floatCover_8.2s_ease-in-out_infinite] overflow-hidden rounded-[30px] border border-white/25 bg-black/60 shadow-[0_34px_120px_rgba(0,0,0,0.65)]"
          style={{
            transitionDuration: `${transitionMs}ms`,
            transitionTimingFunction: "cubic-bezier(0.22,0.61,0.36,1)",
            ...containerStyle,
          }}
        >
          <div className="absolute inset-0 opacity-30">{children}</div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(34,211,238,0.28),transparent_36%),radial-gradient(circle_at_84%_18%,rgba(244,114,182,0.26),transparent_34%),radial-gradient(circle_at_50%_78%,rgba(250,204,21,0.24),transparent_42%),linear-gradient(160deg,#060911_0%,#0d1530_48%,#220f30_100%)]" />
          <div className="absolute inset-0 opacity-55" style={{ backgroundImage: "repeating-linear-gradient(140deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 2px, transparent 2px, transparent 10px)" }} />

          <div className="absolute left-1/2 top-[53%] z-[58] h-[44%] w-[56%] -translate-x-1/2 -translate-y-1/2 rounded-[36%] border border-cyan-100/45 bg-gradient-to-b from-zinc-900 via-zinc-800 to-black shadow-[0_0_60px_rgba(34,211,238,0.35)]">
            <div className="absolute inset-x-[17%] top-[16%] h-[66%] rounded-[45%] bg-gradient-to-b from-fuchsia-200/50 via-cyan-200/40 to-zinc-700/55" />
            <div className="absolute inset-x-[36%] top-[26%] h-[28%] rounded-[45%] bg-black/40" />
            <div className="absolute bottom-[11%] left-1/2 -translate-x-1/2 rounded border border-white/30 bg-black/40 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-cyan-100">Cover Hero</div>
          </div>

          <div className="absolute left-[10%] top-[24%] z-[56] h-20 w-20 rounded-full border border-cyan-200/55 bg-gradient-to-b from-cyan-200/35 to-black/55" />
          <div className="absolute right-[10%] top-[24%] z-[56] h-20 w-20 rounded-full border border-fuchsia-200/55 bg-gradient-to-b from-fuchsia-200/35 to-black/55" />
          <div className="absolute left-[14%] bottom-[22%] z-[56] h-16 w-16 rounded-full border border-yellow-200/50 bg-gradient-to-b from-yellow-200/35 to-black/55" />
          <div className="absolute right-[14%] bottom-[22%] z-[56] h-16 w-16 rounded-full border border-cyan-200/50 bg-gradient-to-b from-cyan-200/35 to-black/55" />

          <div className="absolute left-1/2 top-[11%] z-[65] -translate-x-1/2">
            <div className={[
              "relative flex h-20 w-20 items-center justify-center rounded-full border border-cyan-200/70 bg-gradient-to-br from-cyan-300/40 via-fuchsia-400/35 to-yellow-300/40 shadow-[0_0_28px_rgba(34,211,238,0.45)]",
              crownPulseActive ? "scale-100" : "scale-[1.05]",
            ].join(" ")}>
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white">Crown</span>
              {medallion ? <div className="absolute inset-0 flex items-center justify-center">{medallion}</div> : null}
              <span
                className={[
                  "absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/45 to-transparent",
                  logoShineActive ? "translate-x-[80px] opacity-100" : "-translate-x-[80px] opacity-0",
                ].join(" ")}
                style={{ transition: "transform 1.1s ease, opacity 1.1s ease" }}
              />
            </div>
          </div>

          <div className="absolute right-[7%] top-[13%] z-[64] rounded border border-fuchsia-200/55 bg-black/45 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-fuchsia-100">
            Cypher Badge
          </div>
          <div className="absolute bottom-[8%] left-1/2 z-[64] -translate-x-1/2 rounded border border-yellow-200/60 bg-black/50 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-yellow-100">
            Weekly Cyphers
          </div>

          <div className="absolute bottom-[14%] left-[6%] z-[64] text-5xl font-black text-cyan-100/85">#01</div>
          <div className="absolute bottom-[14%] right-[6%] z-[64] text-5xl font-black text-fuchsia-100/85">#02</div>

          <div className={[
            "absolute inset-0 z-[68] bg-gradient-to-r from-transparent via-white/35 to-transparent",
            logoShineActive ? "translate-x-[110%] opacity-100" : "-translate-x-[110%] opacity-0",
          ].join(" ")} style={{ transition: "transform 1.05s ease, opacity 1.05s ease" }} />

          <div className={[
            "absolute inset-[2%] z-[57] rounded-[28px] border border-cyan-200/30",
            crownPulseActive ? "opacity-75" : "opacity-30",
          ].join(" ")} />
        </div>
      </div>

      <style jsx>{`
        @keyframes floatCover {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}
