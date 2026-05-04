"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import RankStackRiseLayer from "@/components/home/RankStackRiseLayer";

import MagazinePaperTexture from "@/components/magazine/MagazinePaperTexture";
import { getCurrentCycle, getCycleByIndex, SPREAD_CYCLES } from "@/engines/home/SpreadRankAuthorityEngine";
import { recordSpreadGenre } from "@/engines/home/RankingMemoryLockEngine";
import type { MusicGenre } from "@/engines/home/CoverGenreRotationAuthority";
import { getFanPrestigeByLabel } from "@/engines/fans/FanPrestigeAuthorityEngine";
import { getBattleEntryByLabel } from "@/engines/battles/FreestyleBattleAuthorityEngine";
import { buildPerformer } from "@/engines/ranking/RankMovementEngine";
import { getSpreadRankPulsePlan } from "@/lib/home/OccupantSwapEngine";
import { artistImages, imageAt } from "@/components/cards/content-image-bank";
import { captionStyle, headlineStyle, pullQuoteStyle } from "@/lib/magazine/MagazineTypographyEngine";

const SPREAD_GENRE_MAP: Record<string, MusicGenre> = {
  Freestylers: "Hip-Hop",
  "Fan Champions": "Pop",
  "Battle Winners": "Rock",
  "Fan Legends": "Soul",
  "Community MVPs": "Electronic",
};

function performerToSpreadEntry(p: ReturnType<typeof buildPerformer>) {
  return {
    id: p.performerId,
    name: p.name,
    rank: p.rank,
    previousRank: p.previousRank,
    movement: p.trend,
    score: p.votes,
    streak: 0,
    profileImage: p.profileImage,
  };
}

const ACTIVATION_DELAY_MS = 40;
const MAX_FOLLOW_DELAY_MS = 280;
const ROTATION_INTERVAL_MS = 5200;

const PERFORMER_POOLS: Record<string, ReturnType<typeof buildPerformer>[]> = {
  Comedians: [
    buildPerformer("c1", "Kevin Gates Jr.", "Comedians", 1, 3, 8420, 14200, imageAt(artistImages, 0)),
    buildPerformer("c2", "Lyric.44", "Comedians", 2, 1, 7200, 12800, imageAt(artistImages, 1)),
    buildPerformer("c3", "ToonBoss", "Comedians", 3, 4, 6100, 10400, imageAt(artistImages, 2)),
    buildPerformer("c4", "Shade.T", "Comedians", 4, 2, 5800, 9700, imageAt(artistImages, 3)),
    buildPerformer("c5", "Punchline.K", "Comedians", 5, 5, 4900, 8200, imageAt(artistImages, 4)),
    buildPerformer("c6", "Crowd.Roc", "Comedians", 6, 7, 4200, 7100, imageAt(artistImages, 5)),
    buildPerformer("c7", "Witz.B", "Comedians", 7, 6, 3800, 6400, imageAt(artistImages, 0)),
    buildPerformer("c8", "Roast.King", "Comedians", 8, 8, 3200, 5700, imageAt(artistImages, 1)),
    buildPerformer("c9", "Deadpan.D", "Comedians", 9, 10, 2800, 5100, imageAt(artistImages, 2)),
    buildPerformer("c10", "FrontRow.J", "Comedians", 10, 9, 2400, 4600, imageAt(artistImages, 3)),
  ],
  Streamers: [
    buildPerformer("s1", "Nova.Stream", "Streamers", 1, 2, 9100, 18400, imageAt(artistImages, 4)),
    buildPerformer("s2", "Crown.T", "Streamers", 2, 1, 8400, 16200, imageAt(artistImages, 5)),
    buildPerformer("s3", "Pixel.Wave", "Streamers", 3, 5, 7200, 13800, imageAt(artistImages, 0)),
    buildPerformer("s4", "Verse.XL", "Streamers", 4, 3, 6700, 11400, imageAt(artistImages, 1)),
    buildPerformer("s5", "BitFlow.R", "Streamers", 5, 4, 5900, 9800, imageAt(artistImages, 2)),
    buildPerformer("s6", "Hype.Cam", "Streamers", 6, 8, 5200, 8700, imageAt(artistImages, 3)),
    buildPerformer("s7", "Bandwidth.Z", "Streamers", 7, 6, 4700, 7600, imageAt(artistImages, 4)),
    buildPerformer("s8", "Clickstream.V", "Streamers", 8, 7, 4100, 6500, imageAt(artistImages, 5)),
    buildPerformer("s9", "Airtime.F", "Streamers", 9, 10, 3600, 5800, imageAt(artistImages, 0)),
    buildPerformer("s10", "FeedLord.M", "Streamers", 10, 9, 3100, 5200, imageAt(artistImages, 1)),
  ],
  Dancers: [
    buildPerformer("d1", "Julius.B", "Dancers", 1, 2, 11200, 22400, imageAt(artistImages, 2)),
    buildPerformer("d2", "Wavetek", "Dancers", 2, 1, 9800, 18600, imageAt(artistImages, 3)),
    buildPerformer("d3", "FlowRhythm.K", "Dancers", 3, 4, 8200, 15400, imageAt(artistImages, 4)),
    buildPerformer("d4", "GrooveKing", "Dancers", 4, 3, 7100, 13200, imageAt(artistImages, 5)),
    buildPerformer("d5", "Sona.Dee", "Dancers", 5, 6, 6200, 11400, imageAt(artistImages, 0)),
    buildPerformer("d6", "Beat.Empress", "Dancers", 6, 5, 5600, 9700, imageAt(artistImages, 1)),
    buildPerformer("d7", "Flex.A", "Dancers", 7, 8, 4900, 8200, imageAt(artistImages, 2)),
    buildPerformer("d8", "StageZero.J", "Dancers", 8, 7, 4200, 7100, imageAt(artistImages, 3)),
    buildPerformer("d9", "Vibe.Rx", "Dancers", 9, 10, 3600, 6200, imageAt(artistImages, 4)),
    buildPerformer("d10", "Ground.Move", "Dancers", 10, 9, 3100, 5400, imageAt(artistImages, 5)),
  ],
  Producers: [
    buildPerformer("p1", "Bass.Nero", "Producers", 1, 3, 10400, 20800, imageAt(artistImages, 0)),
    buildPerformer("p2", "BeatArchitect", "Producers", 2, 1, 9200, 17600, imageAt(artistImages, 1)),
    buildPerformer("p3", "808.King", "Producers", 3, 2, 8100, 15200, imageAt(artistImages, 2)),
    buildPerformer("p4", "SampleLord", "Producers", 4, 5, 7200, 13400, imageAt(artistImages, 3)),
    buildPerformer("p5", "Freq.Zone", "Producers", 5, 4, 6400, 11600, imageAt(artistImages, 4)),
    buildPerformer("p6", "WaveForge.T", "Producers", 6, 7, 5700, 9800, imageAt(artistImages, 5)),
    buildPerformer("p7", "TrackMaster.V", "Producers", 7, 6, 5000, 8400, imageAt(artistImages, 0)),
    buildPerformer("p8", "SoundEngineer.M", "Producers", 8, 8, 4300, 7100, imageAt(artistImages, 1)),
    buildPerformer("p9", "Loop.Deity", "Producers", 9, 10, 3700, 6200, imageAt(artistImages, 2)),
    buildPerformer("p10", "MixMaster.Z", "Producers", 10, 9, 3200, 5400, imageAt(artistImages, 3)),
  ],
  DJs: [
    buildPerformer("dj1", "Bass.Nero", "DJs", 1, 3, 12800, 25600, imageAt(artistImages, 0)),
    buildPerformer("dj2", "Freq.Zone", "DJs", 2, 1, 11400, 22800, imageAt(artistImages, 1)),
    buildPerformer("dj3", "Drop.King", "DJs", 3, 2, 9800, 19600, imageAt(artistImages, 2)),
    buildPerformer("dj4", "WaveRider.T", "DJs", 4, 5, 8700, 17400, imageAt(artistImages, 3)),
    buildPerformer("dj5", "BPM.Lord", "DJs", 5, 4, 7600, 15200, imageAt(artistImages, 4)),
    buildPerformer("dj6", "HiHat.M", "DJs", 6, 7, 6800, 13400, imageAt(artistImages, 5)),
    buildPerformer("dj7", "TurnTable.Z", "DJs", 7, 6, 6100, 11600, imageAt(artistImages, 0)),
    buildPerformer("dj8", "Crossfade.V", "DJs", 8, 8, 5400, 9800, imageAt(artistImages, 1)),
    buildPerformer("dj9", "Sample.Beast", "DJs", 9, 10, 4800, 8400, imageAt(artistImages, 2)),
    buildPerformer("dj10", "MixCloud.K", "DJs", 10, 9, 4200, 7100, imageAt(artistImages, 3)),
  ],
};

export default function HomePage012Artifact() {
  const [leftActivated, setLeftActivated] = useState(false);
  const [rightActivated, setRightActivated] = useState(false);
  const [cycleIndex, setCycleIndex] = useState(() => getCurrentCycle().index);
  const bootedRef = useRef(false);
  const cycle = useMemo(() => getCycleByIndex(cycleIndex), [cycleIndex]);
  const pulsePlan = useMemo(() => getSpreadRankPulsePlan(cycleIndex), [cycleIndex]);
  const spreadGenre = useMemo(() => SPREAD_GENRE_MAP[cycle.right] ?? "Hip-Hop", [cycle.right]);

  const leftPerformers = useMemo(() => {
    const pool = PERFORMER_POOLS[cycle.left] ?? PERFORMER_POOLS["Comedians"] ?? [];
    const entries = pool.map(performerToSpreadEntry);
    if (entries.length === 10) return entries;
    // Pad to 10 if pool is short (should never happen with seeded data)
    const base = (PERFORMER_POOLS["Comedians"] ?? []).map(performerToSpreadEntry);
    return [...entries, ...base.slice(entries.length, 10)];
  }, [cycle.left]);

  const rightData = useMemo(() => {
    let data: ReturnType<typeof getFanPrestigeByLabel>;
    if (cycle.right === "Freestylers")    data = getBattleEntryByLabel("Freestylers");
    else if (cycle.right === "Fan Champions")  data = getFanPrestigeByLabel("Fan Champions");
    else if (cycle.right === "Battle Winners") data = getBattleEntryByLabel("Battle Winners");
    else if (cycle.right === "Fan Legends")    data = getFanPrestigeByLabel("Fan Legends");
    else if (cycle.right === "Community MVPs") data = getFanPrestigeByLabel("Community MVPs");
    else data = getBattleEntryByLabel("Freestylers");
    // Guarantee 10 rows — engines always return 10 but guard defensively
    return data.length === 10 ? data : getFanPrestigeByLabel("Fan Champions");
  }, [cycle.right]);

  useEffect(() => {
    recordSpreadGenre(spreadGenre);
  }, [spreadGenre]);

  useEffect(() => {
    const startupDelay = bootedRef.current ? 0 : ACTIVATION_DELAY_MS;
    bootedRef.current = true;

    setLeftActivated(false);
    setRightActivated(false);

    const leftDelay  = Math.min(pulsePlan.leftDelayMs,  MAX_FOLLOW_DELAY_MS);
    const rightDelay = Math.min(pulsePlan.rightDelayMs, MAX_FOLLOW_DELAY_MS);
    const leftTimer  = setTimeout(() => setLeftActivated(true),  startupDelay + leftDelay);
    const rightTimer = setTimeout(() => setRightActivated(true), startupDelay + rightDelay);

    return () => {
      clearTimeout(leftTimer);
      clearTimeout(rightTimer);
    };
  }, [pulsePlan.leftDelayMs, pulsePlan.rightDelayMs, cycleIndex]);

  useEffect(() => {
    const rotation = setInterval(() => {
      setCycleIndex((current) => (current + 1) % SPREAD_CYCLES.length);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(rotation);
  }, []);

  return (
    <main
      className="min-h-full px-4 py-6 text-zinc-950"
      style={{
        background: "transparent",
      }}
    >
      <section className="mx-auto grid h-full max-w-full gap-6 px-4 py-4 md:grid-cols-2">
          <article
            style={{
              position: "relative",
              borderRadius: 24,
              border: "1px solid rgba(93,74,58,0.18)",
              background: "linear-gradient(180deg, #f3e6cf 0%, #ead9bc 100%)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.38), inset 0 22px 48px rgba(255,255,255,0.26), inset 0 -18px 34px rgba(98,73,47,0.16)",
              padding: 20,
            }}
          >
            <MagazinePaperTexture intensity={0.85} />
            <div style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div>
                <p style={captionStyle("#2d6f75")}>Left Page</p>
                <h1 style={headlineStyle("#2d6f75")}>Top 10 {cycle.left}</h1>
              </div>
              <span style={{ borderRadius: 999, border: "1px solid rgba(45,111,117,0.25)", background: "rgba(45,111,117,0.08)", padding: "6px 10px", fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", color: "#2d6f75", textTransform: "uppercase" }}>Printed Inset</span>
            </div>
            <p style={{ ...pullQuoteStyle(), marginBottom: 10 }}>"Press ink, crowd pressure, and movement all collide on this page."</p>
            <div style={{ borderRadius: 18, border: "1px solid rgba(45,111,117,0.2)", background: "linear-gradient(180deg, rgba(255,255,255,0.72), rgba(239,227,205,0.92))", boxShadow: "inset 0 12px 26px rgba(255,255,255,0.48), inset 0 -8px 18px rgba(98,73,47,0.12)", padding: 16 }}>
              <RankStackRiseLayer entries={leftPerformers} category={cycle.left} accentColor="#2d6f75" activated={leftActivated} cycleKey={`${cycle.index}-${pulsePlan.cycleLabel}`} />
            </div>
          </article>

          <article
            style={{
              position: "relative",
              borderRadius: 24,
              border: "1px solid rgba(97,44,72,0.18)",
              background: "linear-gradient(180deg, #f7ead6 0%, #edd9c4 100%)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.38), inset 0 22px 48px rgba(255,255,255,0.26), inset 0 -18px 34px rgba(98,73,47,0.16)",
              padding: 20,
            }}
          >
            <MagazinePaperTexture intensity={0.82} />
            <div style={{ marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div>
                <p style={captionStyle("#9c285e")}>Right Page</p>
                <h2 style={headlineStyle("#9c285e")}>Top 10 {cycle.right}</h2>
              </div>
              {rightActivated ? <span style={{ borderRadius: 999, border: "1px solid rgba(156,40,94,0.25)", background: "rgba(156,40,94,0.08)", padding: "6px 10px", fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", color: "#9c285e", textTransform: "uppercase" }}>Live Rotation</span> : null}
            </div>
            <p style={{ ...pullQuoteStyle(), marginBottom: 10 }}>"Every rank shift leaves a printed scar in the spread memory."</p>
            <div style={{ borderRadius: 18, border: "1px solid rgba(156,40,94,0.2)", background: "linear-gradient(180deg, rgba(255,255,255,0.72), rgba(241,226,212,0.92))", boxShadow: "inset 0 12px 26px rgba(255,255,255,0.48), inset 0 -8px 18px rgba(98,73,47,0.12)", padding: 16 }}>
              <RankStackRiseLayer entries={rightData} category={cycle.right} accentColor="#9c285e" activated={rightActivated} cycleKey={`${cycle.index}-${pulsePlan.cycleLabel}`} />
            </div>
          </article>
        </section>

        <div style={{ display: "flex", justifyContent: "center", gap: 10, padding: "0 24px 24px", flexWrap: "wrap" }}>
          <Link href="/home/1" style={{ textDecoration: "none", padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", color: "rgba(25,20,13,0.72)", fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", background: "rgba(255,255,255,0.46)" }}>← Cover</Link>
          <Link href="/artists" style={{ textDecoration: "none", padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(45,111,117,0.25)", color: "#2d6f75", fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", background: "rgba(45,111,117,0.08)" }}>All Artists</Link>
          <Link href="/home/2" style={{ textDecoration: "none", padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", color: "rgba(25,20,13,0.72)", fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", background: "rgba(255,255,255,0.46)" }}>Next Spread →</Link>
        </div>
    </main>
  );
}
