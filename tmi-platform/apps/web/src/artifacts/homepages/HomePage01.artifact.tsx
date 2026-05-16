"use client";

import Link from "next/link";
import { buildHomepageStarburst } from "@/lib/homepage/tmiHomepageStarburstTransitionEngine";
import TmiAnimatedMagazine from "@/components/magazine/TmiAnimatedMagazine";
import { TMI_HOME_MAGAZINE_ISSUE } from "@/lib/magazine/tmiMagazineMetadataModel";
import Home1Layout from "@/components/homepage/Home1Layout";
import GamesBillboardJumpSession from "@/components/homepage/GamesBillboardJumpSession";
import HeroWinnerPortrait from "@/components/homepage/hero/HeroWinnerPortrait";
import HeroTopThreeStrip from "@/components/homepage/hero/HeroTopThreeStrip";
import HeroCrownPulse from "@/components/homepage/hero/HeroCrownPulse";

const rays = buildHomepageStarburst(1001, 12);

export default function HomePage01Artifact() {
  return (
    // overflow-x-hidden only — vertical scroll must work freely
    <main className="relative w-screen overflow-x-hidden bg-[#06070d] text-zinc-100">

      {/* Interactive magazine nav strip — cover page, page-flip + audio enabled */}
      <TmiAnimatedMagazine
        pages={TMI_HOME_MAGAZINE_ISSUE.pages}
        initialPage={0}
        surfaceTone="cyan"
        enableCoverLoop={true}
        className="mx-auto mt-4 h-72 max-w-[1580px] px-3"
      />

      {/* ─── HERO SECTION ─── z-10, 70vh min so density peeks below fold */}
      <section
        className="relative w-full"
        style={{ minHeight: "70vh", maxHeight: "100vh", zIndex: 10 }}
      >
        {/* Z1 Background gradient */}
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_20%_15%,rgba(0,255,255,0.2),transparent_42%),radial-gradient(circle_at_82%_10%,rgba(255,213,0,0.16),transparent_36%),radial-gradient(circle_at_70%_80%,rgba(226,95,255,0.22),transparent_40%),linear-gradient(140deg,#04050a_0%,#081122_40%,#120a1f_100%)]" />

        {/* Z2 Starburst rays */}
        <div className="pointer-events-none absolute inset-0 z-[2] opacity-25 overflow-hidden">
          {rays.map((ray) => (
            <span
              key={ray.id}
              className="absolute left-1/2 top-1/2 origin-left animate-pulse"
              style={{
                width: `${ray.length}px`,
                height: `${ray.width}px`,
                transform: `translate(-50%,-50%) rotate(${ray.angleDeg}deg)`,
                background: `hsla(${ray.hue},95%,62%,0.32)`,
              }}
            />
          ))}
        </div>

        {/* Z3 Lightning streaks */}
        <div className="pointer-events-none absolute inset-0 z-[3] opacity-20 overflow-hidden">
          <div className="absolute top-[15%] left-[25%] w-px h-[30vh] bg-cyan-400 rotate-[35deg] blur-[2px] opacity-60" />
          <div className="absolute bottom-[20%] right-[30%] w-px h-[40vh] bg-fuchsia-500 -rotate-[15deg] blur-[3px] opacity-50" />
          <div className="absolute top-[40%] right-[20%] w-px h-[25vh] bg-yellow-400 rotate-[10deg] blur-[2px] opacity-40" />
        </div>

        {/* Crown pulse rings — behind medallion */}
        <HeroCrownPulse />

        {/* Z4 Cover content */}
        <div className="relative z-[4] flex min-h-[70vh] w-full flex-col items-center justify-center px-6 text-center py-16">
          {/* Issue tag */}
          <div className="mb-5 rounded-full border border-cyan-300/30 bg-black/50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            TMI · Issue 1 · April 2026
          </div>

          {/* Crown Medallion — winner portrait inside */}
          <div className="relative mb-5 flex h-40 w-40 items-center justify-center rounded-full border-2 border-cyan-300/40 bg-black/50 backdrop-blur-md shadow-[0_0_60px_rgba(34,211,238,0.3)] md:h-52 md:w-52">
            {/* Spinning conic sweep */}
            <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(34,211,238,0.35)_360deg)] animate-[spin_6s_linear_infinite]" />
            {/* Gold ambient glow */}
            <div className="absolute inset-0 rounded-full bg-yellow-400/8 blur-[30px] animate-pulse" />
            {/* Winner portrait replaces static "TMI" text */}
            <HeroWinnerPortrait />
          </div>

          {/* Crown headline */}
          <h2 className="mb-2 text-2xl font-black uppercase tracking-tight text-white drop-shadow-[0_0_16px_rgba(34,211,238,0.6)] md:text-4xl">
            Who Took The Crown?
          </h2>
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.15em] text-zinc-400">
            Battles · Cyphers · Beats · Live Rooms · NFTs
          </p>

          {/* Top 3 rotating artist portraits */}
          <div className="mb-6">
            <HeroTopThreeStrip />
          </div>

          {/* CTA Rail */}
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { label: "Join Cypher",  href: "/cypher",            color: "rgba(170,45,255,0.2)",  border: "rgba(170,45,255,0.4)",  text: "#AA2DFF" },
              { label: "Enter Battle", href: "/battles",            color: "rgba(255,45,170,0.2)",  border: "rgba(255,45,170,0.4)",  text: "#FF2DAA" },
              { label: "Buy Beats",    href: "/beats/marketplace",  color: "rgba(255,215,0,0.15)",  border: "rgba(255,215,0,0.35)",  text: "#FFD700" },
              { label: "Watch Live",   href: "/live",               color: "rgba(0,255,255,0.1)",   border: "rgba(0,255,255,0.3)",   text: "#00FFFF" },
            ].map(c => (
              <Link
                key={c.label}
                href={c.href}
                className="rounded-lg px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition-all duration-200 hover:scale-105"
                style={{ background: c.color, border: `1px solid ${c.border}`, color: c.text }}
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Scroll indicator — points toward density content below */}
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-[5] -translate-x-1/2 flex flex-col items-center gap-1">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">SCROLL FOR MORE</span>
          <div className="h-6 w-px bg-gradient-to-b from-white/20 to-transparent animate-pulse" />
        </div>

        {/* Bottom fade — bleeds density section up into hero bottom edge */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-[#06070d] z-[6]" />
      </section>

      {/* ─── DENSITY CONTENT SECTION ─── z-20, auto height, full scroll */}
      <section
        className="relative w-full"
        style={{ zIndex: 20, background: "linear-gradient(180deg, #06070d 0%, #050510 100%)" }}
      >
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          {/* Home1Layout contains: QuickJumpRail, BreakingNewsTicker, MonitorHUD,
              Crown Rail, battle/cypher/article/venue/event grid, top10/beats/challenge rail,
              CinemationCanvas, SponsorRail — all density wired */}
          <GamesBillboardJumpSession className="mb-6" />
          <Home1Layout />
        </div>
      </section>

    </main>
  );
}
