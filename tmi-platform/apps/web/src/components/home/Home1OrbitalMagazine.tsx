"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import HomeNavigator from "@/components/home/HomeNavigator";
import FooterHUD from "@/components/hud/FooterHUD";
import HomeLobbyVideoWall from "@/components/home/HomeLobbyVideoWall";
import { getCurrentIssue, STATIC_LEAKS } from "@/lib/magazine/IndexMagazineEngine";

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_W = 128;
const CARD_H = 158;
const ORBIT_RADIUS = 280;
const RING_SIZE = 680;
const ORBIT_DURATION = 40;
const NUM_ARTISTS = 9;

const TMI_GENRES = [
  "Hip Hop","R&B","Pop","Country","Rock","Gospel","Afrobeat","Latin","EDM","Jazz","Reggae","Global",
] as const;
type TmiGenre = (typeof TMI_GENRES)[number];
type LifecyclePhase = "spinning" | "crown-enter" | "crown-hold" | "starburst" | "settling";

// ─── Genre palette ────────────────────────────────────────────────────────────

const GENRE_PALETTE: Record<TmiGenre, { primary: string; secondary: string; bg: string }> = {
  "Hip Hop":  { primary: "#AA2DFF", secondary: "#00FFFF",  bg: "radial-gradient(ellipse at 20% 30%,rgba(120,0,255,0.6) 0%,transparent 55%),radial-gradient(ellipse at 80% 70%,rgba(0,200,180,0.4) 0%,transparent 55%),linear-gradient(160deg,#12043a 0%,#080c2a 50%,#061018 100%)" },
  "R&B":      { primary: "#00FF88", secondary: "#FF2DAA",  bg: "radial-gradient(ellipse at 30% 20%,rgba(0,120,80,0.55) 0%,transparent 55%),radial-gradient(ellipse at 70% 80%,rgba(255,50,170,0.3) 0%,transparent 55%),linear-gradient(160deg,#031a0e 0%,#080d18 50%,#06100d 100%)" },
  "Pop":      { primary: "#FFD700", secondary: "#FF2DAA",  bg: "radial-gradient(ellipse at 50% 20%,rgba(255,180,0,0.5) 0%,transparent 55%),radial-gradient(ellipse at 20% 80%,rgba(255,80,200,0.35) 0%,transparent 55%),linear-gradient(160deg,#1a1000 0%,#120e00 50%,#0a0800 100%)" },
  "Country":  { primary: "#F5A623", secondary: "#C0392B",  bg: "radial-gradient(ellipse at 40% 30%,rgba(245,166,35,0.5) 0%,transparent 55%),radial-gradient(ellipse at 60% 70%,rgba(192,57,43,0.35) 0%,transparent 55%),linear-gradient(160deg,#1a0e00 0%,#120a00 50%,#0a0600 100%)" },
  "Rock":     { primary: "#00FFFF", secondary: "#FF6600",  bg: "radial-gradient(ellipse at 10% 50%,rgba(0,200,255,0.5) 0%,transparent 55%),radial-gradient(ellipse at 90% 50%,rgba(255,120,0,0.35) 0%,transparent 55%),linear-gradient(160deg,#001a1a 0%,#080c10 50%,#040606 100%)" },
  "Gospel":   { primary: "#FFD700", secondary: "#FFFFFF",  bg: "radial-gradient(ellipse at 50% 20%,rgba(255,215,0,0.55) 0%,transparent 55%),radial-gradient(ellipse at 50% 80%,rgba(255,255,255,0.15) 0%,transparent 55%),linear-gradient(160deg,#1a1500 0%,#100f00 50%,#080800 100%)" },
  "Afrobeat": { primary: "#FF6B35", secondary: "#00C853",  bg: "radial-gradient(ellipse at 30% 30%,rgba(255,107,53,0.55) 0%,transparent 55%),radial-gradient(ellipse at 70% 70%,rgba(0,200,83,0.35) 0%,transparent 55%),linear-gradient(160deg,#1a0800 0%,#0d0800 50%,#060400 100%)" },
  "Latin":    { primary: "#FF2D78", secondary: "#FFD700",  bg: "radial-gradient(ellipse at 60% 20%,rgba(255,45,120,0.55) 0%,transparent 55%),radial-gradient(ellipse at 40% 80%,rgba(255,215,0,0.3) 0%,transparent 55%),linear-gradient(160deg,#1a0010 0%,#0f000a 50%,#08000a 100%)" },
  "EDM":      { primary: "#FF2DAA", secondary: "#00FFFF",  bg: "radial-gradient(ellipse at 80% 20%,rgba(255,0,150,0.5) 0%,transparent 55%),radial-gradient(ellipse at 20% 80%,rgba(0,200,255,0.35) 0%,transparent 55%),linear-gradient(160deg,#1a0010 0%,#0d0818 50%,#030810 100%)" },
  "Jazz":     { primary: "#4488FF", secondary: "#FFD700",  bg: "radial-gradient(ellipse at 30% 40%,rgba(30,80,255,0.5) 0%,transparent 55%),radial-gradient(ellipse at 70% 60%,rgba(255,180,0,0.25) 0%,transparent 55%),linear-gradient(160deg,#000a1a 0%,#040810 50%,#020608 100%)" },
  "Reggae":   { primary: "#00C853", secondary: "#FFD700",  bg: "radial-gradient(ellipse at 30% 30%,rgba(0,200,83,0.55) 0%,transparent 55%),radial-gradient(ellipse at 70% 70%,rgba(255,215,0,0.3) 0%,transparent 55%),linear-gradient(160deg,#001a08 0%,#030e04 50%,#010802 100%)" },
  "Global":   { primary: "#00D4FF", secondary: "#FF6B6B",  bg: "radial-gradient(ellipse at 50% 30%,rgba(0,212,255,0.5) 0%,transparent 55%),radial-gradient(ellipse at 50% 70%,rgba(255,107,107,0.3) 0%,transparent 55%),linear-gradient(160deg,#001520 0%,#040c12 50%,#020608 100%)" },
};

// ─── Artist pools ─────────────────────────────────────────────────────────────

interface SeedArtist { name: string; rank: number; genre: TmiGenre; score: number; delta: number; }

const GENRE_ARTISTS: Record<TmiGenre, SeedArtist[]> = {
  "Hip Hop":  [ { name:"Astra Nova",   rank:1,genre:"Hip Hop", score:9820,delta:+312},{name:"Koda Rush",    rank:2,genre:"Hip Hop", score:8390,delta:-130},{name:"Verb Zero",   rank:3,genre:"Hip Hop", score:8010,delta:+89 },{name:"Block Cipher",rank:4,genre:"Hip Hop", score:7650,delta:-22 },{name:"Drip Theory", rank:5,genre:"Hip Hop", score:7200,delta:+201},{name:"Phase Six",   rank:6,genre:"Hip Hop", score:6880,delta:+44 },{name:"Low Freq",   rank:7,genre:"Hip Hop", score:6510,delta:-67 },{name:"Grid Walk",  rank:8,genre:"Hip Hop", score:6090,delta:+155},{name:"Void Arc",   rank:9,genre:"Hip Hop", score:5740,delta:-11 }],
  "R&B":      [ { name:"Lev Mirage",   rank:1,genre:"R&B",    score:9480,delta:+88 },{name:"Neon Psalms", rank:2,genre:"R&B",    score:7200,delta:-88 },{name:"Velvet Sol",  rank:3,genre:"R&B",    score:6940,delta:+133},{name:"Satin Echo",  rank:4,genre:"R&B",    score:6620,delta:-55 },{name:"Indigo Haze", rank:5,genre:"R&B",    score:6280,delta:+200},{name:"Pulse Deep",  rank:6,genre:"R&B",    score:5990,delta:+44 },{name:"Warm Signal",rank:7,genre:"R&B",    score:5650,delta:-33 },{name:"Night Thread",rank:8,genre:"R&B",    score:5310,delta:+77 },{name:"Amber Shore", rank:9,genre:"R&B",    score:4980,delta:-12 }],
  "Pop":      [ { name:"Sable Court",  rank:1,genre:"Pop",    score:8740,delta:+201},{name:"Gloss Circuit",rank:2,genre:"Pop",    score:8200,delta:+55 },{name:"Candy Vex",   rank:3,genre:"Pop",    score:7800,delta:-90 },{name:"Mirror Drop", rank:4,genre:"Pop",    score:7400,delta:+144},{name:"Nxt Lux",     rank:5,genre:"Pop",    score:7050,delta:-30 },{name:"Pixel Charm", rank:6,genre:"Pop",    score:6700,delta:+88 },{name:"Arc Bloom",   rank:7,genre:"Pop",    score:6320,delta:+22 },{name:"Nova Glow",   rank:8,genre:"Pop",    score:5960,delta:-45 },{name:"Starform",    rank:9,genre:"Pop",    score:5610,delta:+100}],
  "Country":  [ { name:"Dust & Wire",  rank:1,genre:"Country",score:8650,delta:+177},{name:"Red Clay Rd", rank:2,genre:"Country",score:8100,delta:+55 },{name:"Oak Hollow",  rank:3,genre:"Country",score:7700,delta:-44 },{name:"Porch Light", rank:4,genre:"Country",score:7290,delta:+122},{name:"Grain & Grit",rank:5,genre:"Country",score:6920,delta:-20 },{name:"Back Road Six",rank:6,genre:"Country",score:6570,delta:+68 },{name:"Iron Creek",  rank:7,genre:"Country",score:6230,delta:+33 },{name:"Stone Hymnal",rank:8,genre:"Country",score:5880,delta:-55 },{name:"Lone Mile",   rank:9,genre:"Country",score:5540,delta:+88 }],
  "Rock":     [ { name:"Torque Sin",   rank:1,genre:"Rock",   score:7620,delta:+22 },{name:"Voltage Rex",  rank:2,genre:"Rock",   score:7280,delta:+111},{name:"Static Crown", rank:3,genre:"Rock",   score:6920,delta:-77 },{name:"Amp Theory",  rank:4,genre:"Rock",   score:6560,delta:+55 },{name:"Crash Grid",  rank:5,genre:"Rock",   score:6200,delta:-33 },{name:"Riff Axiom",  rank:6,genre:"Rock",   score:5880,delta:+200},{name:"Fuse Protocol",rank:7,genre:"Rock",   score:5540,delta:+44 },{name:"Dark Matter", rank:8,genre:"Rock",   score:5210,delta:-88 },{name:"Iron Cycle",  rank:9,genre:"Rock",   score:4890,delta:+22 }],
  "Gospel":   [ { name:"Zion Freq",    rank:1,genre:"Gospel", score:9100,delta:+300},{name:"Crown Bearer", rank:2,genre:"Gospel", score:8600,delta:+88 },{name:"Glory Signal",rank:3,genre:"Gospel", score:8100,delta:-55 },{name:"Anointed Arc",rank:4,genre:"Gospel", score:7650,delta:+133},{name:"Fire & Grace", rank:5,genre:"Gospel", score:7200,delta:-22 },{name:"Altar Wave",  rank:6,genre:"Gospel", score:6780,delta:+77 },{name:"New Covenant",rank:7,genre:"Gospel", score:6340,delta:+44 },{name:"Worthy Sound",rank:8,genre:"Gospel", score:5920,delta:-66 },{name:"Amen Circuit",rank:9,genre:"Gospel", score:5500,delta:+100}],
  "Afrobeat": [ { name:"Lagos Burst",  rank:1,genre:"Afrobeat",score:9300,delta:+255},{name:"Rhythm Volta", rank:2,genre:"Afrobeat",score:8800,delta:+99 },{name:"Jollof Wave",  rank:3,genre:"Afrobeat",score:8300,delta:-44 },{name:"Drum Oracle",  rank:4,genre:"Afrobeat",score:7850,delta:+155},{name:"Sun Continent",rank:5,genre:"Afrobeat",score:7400,delta:-30 },{name:"Korede Six",   rank:6,genre:"Afrobeat",score:7000,delta:+80 },{name:"Naija Nova",   rank:7,genre:"Afrobeat",score:6580,delta:+22 },{name:"Wax Print",    rank:8,genre:"Afrobeat",score:6180,delta:-55 },{name:"Highlife Code",rank:9,genre:"Afrobeat",score:5780,delta:+133}],
  "Latin":    [ { name:"Fuego Prism",  rank:1,genre:"Latin",  score:9200,delta:+288},{name:"Ritmo Vex",    rank:2,genre:"Latin",  score:8700,delta:+66 },{name:"Salsa Grid",   rank:3,genre:"Latin",  score:8200,delta:-50 },{name:"Clave Signal", rank:4,genre:"Latin",  score:7760,delta:+144},{name:"Noche Arc",    rank:5,genre:"Latin",  score:7320,delta:-22 },{name:"Sol Circuit",  rank:6,genre:"Latin",  score:6900,delta:+88 },{name:"Rumba Echo",   rank:7,genre:"Latin",  score:6460,delta:+33 },{name:"Bajo Wave",    rank:8,genre:"Latin",  score:6040,delta:-77 },{name:"Tropic Nova",  rank:9,genre:"Latin",  score:5640,delta:+100}],
  "EDM":      [ { name:"Prism Vex",    rank:1,genre:"EDM",    score:9110,delta:-44 },{name:"Bass Theorem", rank:2,genre:"EDM",    score:8400,delta:+200},{name:"Drop Protocol",rank:3,genre:"EDM",    score:7950,delta:-88 },{name:"Neon Flux",    rank:4,genre:"EDM",    score:7500,delta:+111},{name:"Grid Ghost",   rank:5,genre:"EDM",    score:7080,delta:-33 },{name:"Synth Axiom",  rank:6,genre:"EDM",    score:6660,delta:+77 },{name:"Phase Shift",  rank:7,genre:"EDM",    score:6260,delta:+44 },{name:"Warp Engine",  rank:8,genre:"EDM",    score:5870,delta:-22 },{name:"Velox Prime",  rank:9,genre:"EDM",    score:5490,delta:+155}],
  "Jazz":     [ { name:"Ivory Arc",    rank:1,genre:"Jazz",   score:7950,delta:+67 },{name:"Blue Theorem", rank:2,genre:"Jazz",   score:7500,delta:+122},{name:"Modal Circuit",rank:3,genre:"Jazz",   score:7050,delta:-55 },{name:"Bop Frequency",rank:4,genre:"Jazz",   score:6620,delta:+200},{name:"Chord Theory", rank:5,genre:"Jazz",   score:6200,delta:-33 },{name:"Swing Nova",   rank:6,genre:"Jazz",   score:5800,delta:+88 },{name:"Brass Arc",    rank:7,genre:"Jazz",   score:5420,delta:+44 },{name:"Vamp Signal",  rank:8,genre:"Jazz",   score:5060,delta:-22 },{name:"Quarter Note", rank:9,genre:"Jazz",   score:4720,delta:+66 }],
  "Reggae":   [ { name:"Island Voltage",rank:1,genre:"Reggae",score:8900,delta:+222},{name:"Riddim Arc",   rank:2,genre:"Reggae",score:8400,delta:+88 },{name:"Dub Protocol", rank:3,genre:"Reggae",score:7950,delta:-44 },{name:"Roots Signal", rank:4,genre:"Reggae",score:7500,delta:+155},{name:"One Drop",      rank:5,genre:"Reggae",score:7080,delta:-22 },{name:"Irie Circuit",  rank:6,genre:"Reggae",score:6680,delta:+77 },{name:"Kingston Grid", rank:7,genre:"Reggae",score:6260,delta:+33 },{name:"Babylon Vex",   rank:8,genre:"Reggae",score:5860,delta:-55 },{name:"Sound System",  rank:9,genre:"Reggae",score:5460,delta:+100}],
  "Global":   [ { name:"Earth Cipher", rank:1,genre:"Global", score:9000,delta:+266},{name:"Meridian Six",  rank:2,genre:"Global", score:8500,delta:+99 },{name:"Lingua Nova",   rank:3,genre:"Global", score:8000,delta:-55 },{name:"Nomad Signal",  rank:4,genre:"Global", score:7560,delta:+144},{name:"Atlas Beat",    rank:5,genre:"Global", score:7120,delta:-22 },{name:"Polyrhythm",    rank:6,genre:"Global", score:6700,delta:+88 },{name:"World Arc",     rank:7,genre:"Global", score:6280,delta:+33 },{name:"Border Grid",   rank:8,genre:"Global", score:5880,delta:-44 },{name:"Fusion Nova",   rank:9,genre:"Global", score:5480,delta:+111}],
};

// ─── Viral sticker dictionary ─────────────────────────────────────────────────

const STICKER_PHRASES = [
  { text: "Don't miss this week's battle", href: "/battles/live", color: "#FF2DAA" },
  { text: "Tonight there's gonna be a drum battle", href: "/battles", color: "#FFD700" },
  { text: "You don't even know who's in here", href: "/magazine", color: "#00FFFF" },
  { text: "Not your average site", href: "/home/1", color: "#AA2DFF" },
  { text: "Good times await you", href: "/live/rooms", color: "#00FF88" },
  { text: "The takeover starts now", href: "/rankings", color: "#FF2DAA" },
  { text: "The Index never sleeps", href: "/magazine", color: "#FFD700" },
  { text: "They said it couldn't happen", href: "/rankings", color: "#00FFFF" },
] as const;

// ─── Ticker headlines ─────────────────────────────────────────────────────────

const TICKER_LINES = [
  "Guess who's in the Index this week... and what they're hiding",
  "{ARTIST} just took the #1 spot",
  "Leaked: The takeover begins tonight",
  "Sources say someone's about to flip the rankings",
  "You weren't supposed to see this yet",
  "The battle nobody saw coming — but The Index did",
  "This week's quiet takeover is already in motion",
  "{GENRE} just had its most dangerous week in three months",
  "They said it couldn't happen. The Index tracked the whole thing.",
  "Tonight's crown may not survive the flip",
  "A new challenger entered the orbit",
];

// ─── Sneaky card quotes ───────────────────────────────────────────────────────

const SNEAKY_QUOTES = [
  "Someone's coming for the crown...",
  "Watch this space tonight.",
  "The Index is tracking their moves.",
  "Not yet — but close.",
  "Ask them about the battle.",
  "Last week was just warmup.",
  "They don't know we're watching.",
  "A quiet contender.",
  "The numbers don't lie.",
];

// ─── Memphis clip-path variants ───────────────────────────────────────────────

const CARD_CLIPS = [
  "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
  "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)",
  "polygon(12px 0, 100% 0, 100% 100%, 0 100%, 0 12px)",
  "polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
];

// ─── Leak types ───────────────────────────────────────────────────────────────

type LeakEdge = "top-left" | "top-right" | "bottom-left" | "bottom-right";
interface LeakNote { id: number; text: string; edge: LeakEdge }
interface StickerNote { id: number; text: string; href: string; color: string; x: number; y: number; rotation: number; }

const LEAK_EDGE_STYLES: Record<LeakEdge, React.CSSProperties> = {
  "top-left":     { top: 72, left: 16 },
  "top-right":    { top: 72, right: 16 },
  "bottom-left":  { bottom: 60, left: 16 },
  "bottom-right": { bottom: 60, right: 16 },
};
const LEAK_EDGES: LeakEdge[] = ["top-left", "top-right", "bottom-left", "bottom-right"];

// ─── Orbit math ───────────────────────────────────────────────────────────────

function orbitPos(i: number): { left: number; top: number } {
  const angleRad = ((-90 + i * (360 / NUM_ARTISTS)) * Math.PI) / 180;
  const cx = RING_SIZE / 2;
  const cy = RING_SIZE / 2;
  return {
    left: cx + ORBIT_RADIUS * Math.cos(angleRad) - CARD_W / 2,
    top:  cy + ORBIT_RADIUS * Math.sin(angleRad) - CARD_H / 2,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home1OrbitalMagazine() {
  const issue = getCurrentIssue();
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const orbitCW = weekNumber % 2 === 0;

  const [genreIndex, setGenreIndex] = useState(0);
  const [lifecyclePhase, setLifecyclePhase] = useState<LifecyclePhase>("spinning");
  const [showCrownHero, setShowCrownHero] = useState(false);
  const [starburstActive, setStarburstActive] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [leaks, setLeaks] = useState<LeakNote[]>([]);
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const [stickerQueue, setStickerQueue] = useState<StickerNote[]>([]);
  const [logoGlitch, setLogoGlitch] = useState(false);

  const leakIdRef      = useRef(0);
  const leakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stickerIdRef   = useRef(0);
  const stickerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevGenreRef   = useRef(genreIndex);

  const activeGenre = TMI_GENRES[genreIndex]!;
  const palette     = GENRE_PALETTE[activeGenre];
  const artists     = GENRE_ARTISTS[activeGenre];
  const crownArtist = artists[0]!;

  // 30s lifecycle
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    setLifecyclePhase("spinning");
    timers.push(setTimeout(() => { setLifecyclePhase("crown-enter"); setShowCrownHero(true); }, 10000));
    timers.push(setTimeout(() => { setLifecyclePhase("crown-hold"); }, 17000));
    timers.push(setTimeout(() => { setLifecyclePhase("starburst"); setStarburstActive(true); }, 22000));
    timers.push(setTimeout(() => {
      setStarburstActive(false);
      setShowCrownHero(false);
      setLifecyclePhase("settling");
      setGenreIndex(i => (i + 1) % TMI_GENRES.length);
    }, 25000));
    timers.push(setTimeout(() => {
      setLifecyclePhase("spinning");
      setCycleCount(c => c + 1);
    }, 30000));
    return () => timers.forEach(clearTimeout);
  }, [cycleCount]);

  // Leak scheduler
  useEffect(() => {
    function scheduleNextLeak() {
      const delay = 8000 + Math.random() * 7000;
      leakTimeoutRef.current = setTimeout(() => {
        const id = ++leakIdRef.current;
        const text = STATIC_LEAKS[id % STATIC_LEAKS.length]!;
        const edge = LEAK_EDGES[id % LEAK_EDGES.length]!;
        setLeaks(prev => [...prev, { id, text, edge }]);
        setTimeout(() => setLeaks(prev => prev.filter(l => l.id !== id)), 3000);
        scheduleNextLeak();
      }, delay);
    }
    scheduleNextLeak();
    return () => { if (leakTimeoutRef.current) clearTimeout(leakTimeoutRef.current); };
  }, []);

  // Billboard featured rotation (15s)
  useEffect(() => {
    const id = setInterval(() => setFeaturedIdx(i => (i + 1) % NUM_ARTISTS), 15000);
    return () => clearInterval(id);
  }, []);

  // Viral sticker engine (15–20s interval)
  useEffect(() => {
    function scheduleSticker() {
      const delay = 15000 + Math.random() * 5000;
      stickerTimerRef.current = setTimeout(() => {
        const id = ++stickerIdRef.current;
        const phrase = STICKER_PHRASES[id % STICKER_PHRASES.length]!;
        const x = 5 + Math.random() * 62;
        const y = 18 + Math.random() * 52;
        const rotation = -18 + Math.random() * 36;
        setStickerQueue(prev => [...prev, { id, text: phrase.text, href: phrase.href, color: phrase.color, x, y, rotation }]);
        setTimeout(() => setStickerQueue(prev => prev.filter(s => s.id !== id)), 6000);
        scheduleSticker();
      }, delay);
    }
    scheduleSticker();
    return () => { if (stickerTimerRef.current) clearTimeout(stickerTimerRef.current); };
  }, []);

  // Logo glitch on crown holder change
  useEffect(() => {
    if (prevGenreRef.current !== genreIndex) {
      prevGenreRef.current = genreIndex;
      setLogoGlitch(true);
      const t = setTimeout(() => setLogoGlitch(false), 900);
      return () => clearTimeout(t);
    }
  }, [genreIndex]);

  // Bento grid: featured artist first, rest follow
  const fIdx = featuredIdx % NUM_ARTISTS;
  const featuredArtist = artists[fIdx]!;
  const sideArtists = artists.filter((_, i) => i !== fIdx);

  // Ticker text with substitutions
  const tickerText = TICKER_LINES
    .map(l => l.replace("{ARTIST}", crownArtist.name).replace("{GENRE}", activeGenre))
    .join("  ◆  ");

  return (
    <div style={{ minHeight: "100vh", background: palette.bg, color: "#fff", display: "flex", flexDirection: "column", transition: "background 1.2s ease", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');
        :root { --font-tmi-editorial: 'Playfair Display','Georgia','Times New Roman',serif; }

        @keyframes tmiOrbitCW    { from{transform:rotate(0deg)}   to{transform:rotate(360deg)}  }
        @keyframes tmiOrbitCCW   { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }
        @keyframes tmiCounterCW  { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }
        @keyframes tmiCounterCCW { from{transform:rotate(0deg)}   to{transform:rotate(360deg)}  }

        @keyframes tmiCrownEnter {
          0%   { opacity:0; transform:translate(-50%,-50%) scale(0.15); filter:blur(24px); }
          60%  { opacity:1; transform:translate(-50%,-50%) scale(1.1);  filter:blur(0);   }
          100% { opacity:1; transform:translate(-50%,-50%) scale(1);    filter:blur(0);   }
        }
        @keyframes tmiCrownFloat {
          0%,100% { transform:translate(-50%,-50%); }
          50%     { transform:translate(-50%,calc(-50% - 9px)); }
        }
        @keyframes tmiCrownExit {
          0%   { opacity:1; transform:translate(-50%,-50%) scale(1); }
          100% { opacity:0; transform:translate(-50%,-50%) scale(0.25) translateY(-50px); }
        }
        @keyframes tmiRingGlow {
          0%,100% { opacity:0.25; }
          50%     { opacity:0.6;  }
        }
        @keyframes tmiPulse {
          0%,100% { box-shadow:0 0 0 0 rgba(255,215,0,0); }
          50%     { box-shadow:0 0 28px 8px rgba(255,215,0,0.4); }
        }
        @keyframes tmiLogoGlow {
          0%,100% { filter:brightness(1) drop-shadow(0 0 8px rgba(255,255,255,0.4));  }
          50%     { filter:brightness(1.2) drop-shadow(0 0 18px rgba(255,255,255,0.7)); }
        }
        @keyframes tmiLogoGlitch {
          0%,100% { filter:brightness(1) drop-shadow(0 0 8px rgba(255,255,255,0.4)); transform:none; }
          8%  { filter:hue-rotate(90deg) brightness(2.2); transform:translateX(7px) skewX(-4deg); }
          14% { transform:translateX(-5px); filter:brightness(1.5); }
          20% { transform:none; filter:brightness(1); }
          32% { filter:hue-rotate(-90deg) brightness(1.8); transform:translateX(4px) skewX(3deg); }
          38% { transform:none; filter:brightness(1); }
          52% { filter:saturate(8) brightness(2); transform:translateX(-3px); }
          56% { transform:none; filter:brightness(1); }
          72% { filter:hue-rotate(180deg) brightness(1.4); transform:translateX(5px); }
          78% { transform:none; filter:brightness(1.2) drop-shadow(0 0 18px rgba(255,255,255,0.7)); }
        }
        @keyframes tmiStarburst {
          0%   { opacity:0;   transform:translate(-50%,-50%) scale(0.1); }
          20%  { opacity:0.9; transform:translate(-50%,-50%) scale(1);   }
          70%  { opacity:0.6; transform:translate(-50%,-50%) scale(8);   }
          100% { opacity:0;   transform:translate(-50%,-50%) scale(14);  }
        }
        @keyframes tmiLeakIn {
          0%   { opacity:0; transform:scale(0.85) translateY(8px); }
          100% { opacity:1; transform:scale(1)    translateY(0);   }
        }
        @keyframes tmiGridPulse {
          0%,100% { opacity:0.04; }
          50%     { opacity:0.09; }
        }
        @keyframes tmiMastIn {
          0%   { opacity:0; transform:translateY(-10px); }
          100% { opacity:1; transform:translateY(0);     }
        }

        /* Magazine OS additions */
        @keyframes tmiGrainMove {
          0%  { background-position:0% 0%;    }
          20% { background-position:40% 60%;  }
          40% { background-position:100% 30%; }
          60% { background-position:60% 100%; }
          80% { background-position:10% 70%;  }
          100%{ background-position:0% 0%;    }
        }
        @keyframes tmiLightDrift {
          0%,100% { opacity:0.5; transform:translate(0,0)       scale(1);    }
          33%     { opacity:0.9; transform:translate(30px,-15px) scale(1.05); }
          66%     { opacity:0.6; transform:translate(-20px,25px) scale(0.97); }
        }
        @keyframes tmiTickerScroll {
          0%   { transform:translateX(0);    }
          100% { transform:translateX(-50%); }
        }
        @keyframes tmiStickerSlap {
          0%   { opacity:0; transform:scale(0.08) translateY(12px); }
          55%  { opacity:1; transform:scale(1.14) translateY(-3px);  }
          72%  { transform:scale(0.96) translateY(1px); }
          100% { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes tmiStickerFade {
          0%   { opacity:1; transform:scale(1) translateY(0);      }
          100% { opacity:0; transform:scale(0.85) translateY(-14px); }
        }
        @keyframes tmiBillboardIn {
          0%   { opacity:0; transform:scale(0.94); }
          100% { opacity:1; transform:scale(1);    }
        }
        @keyframes tmiFeaturedPulse {
          0%,100% { box-shadow:0 0 0 0 rgba(255,215,0,0); }
          50%     { box-shadow:0 0 24px 6px rgba(255,215,0,0.3); }
        }

        .tmi-ring       { animation-timing-function:linear; animation-iteration-count:infinite; }
        .tmi-card-inner { animation-timing-function:linear; animation-iteration-count:infinite; }
        .tmi-orbit-wrap { display:flex; align-items:center; justify-content:center; }

        @media (max-width:768px){ .tmi-orbit-wrap{ transform:scale(0.55); transform-origin:top center; } }
        @media (max-width:520px){ .tmi-orbit-wrap{ transform:scale(0.42); transform-origin:top center; } }
      `}</style>

      {/* ── 1980s grid underlay ────────────────────────────────────── */}
      <div aria-hidden style={{
        position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:`linear-gradient(rgba(0,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,255,0.06) 1px,transparent 1px)`,
        backgroundSize:"60px 60px",
        animation:"tmiGridPulse 4s ease-in-out infinite",
      }} />

      {/* ── Geometric corner shapes ─────────────────────────────────── */}
      <svg aria-hidden style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:1, overflow:"visible" }} preserveAspectRatio="none">
        <polygon points="0,0 160,0 0,160"                                            fill={palette.primary}   opacity="0.10" />
        <polygon points="100%,0 100%,140 calc(100% - 140px),0"                       fill={palette.secondary} opacity="0.08" />
        <polygon points="0,100% 120,100% 0,calc(100% - 120px)"                       fill={palette.secondary} opacity="0.07" />
        <polygon points="100%,100% 100%,calc(100% - 120px) calc(100% - 120px),100%" fill={palette.primary}   opacity="0.07" />
        {/* Extra Memphis trapezoids */}
        <polygon points="30%,0 50%,0 45%,20px 25%,20px" fill={palette.primary} opacity="0.06" />
        <polygon points="70%,100% 90%,100% 88%,calc(100% - 16px) 68%,calc(100% - 16px)" fill={palette.secondary} opacity="0.05" />
      </svg>

      {/* ── Starfield ────────────────────────────────────────────────── */}
      <div aria-hidden style={{
        position:"absolute", inset:0, pointerEvents:"none", zIndex:2,
        backgroundImage:`
          radial-gradient(circle 1px at 8% 18%,  ${palette.primary}80 0%,transparent 50%),
          radial-gradient(circle 1px at 22% 62%,  rgba(255,255,255,0.6) 0%,transparent 50%),
          radial-gradient(circle 1px at 43% 33%,  ${palette.secondary}70 0%,transparent 50%),
          radial-gradient(circle 1px at 61% 77%,  rgba(255,255,255,0.5) 0%,transparent 50%),
          radial-gradient(circle 1px at 74% 14%,  ${palette.primary}60 0%,transparent 50%),
          radial-gradient(circle 1px at 87% 48%,  rgba(255,255,255,0.4) 0%,transparent 50%),
          radial-gradient(circle 1px at 32% 88%,  ${palette.secondary}50 0%,transparent 50%),
          radial-gradient(circle 1px at 92% 92%,  rgba(255,255,255,0.6) 0%,transparent 50%),
          radial-gradient(circle 2px at 68% 28%,  ${palette.primary}50 0%,transparent 50%),
          radial-gradient(circle 2px at 38% 71%,  ${palette.secondary}40 0%,transparent 50%)
        `,
      }} />

      {/* ── MotionGrainEngine — animated film grain ─────────────────── */}
      <div aria-hidden style={{
        position:"absolute", inset:0, pointerEvents:"none", zIndex:3,
        opacity:0.055,
        backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23grain)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize:"200px 200px",
        animation:"tmiGrainMove 0.14s steps(1) infinite",
      }} />

      {/* ── Light-leak drift overlay ─────────────────────────────────── */}
      <div aria-hidden style={{
        position:"absolute", inset:0, pointerEvents:"none", zIndex:3,
        background:`radial-gradient(ellipse 40% 35% at 15% 25%,${palette.primary}0a 0%,transparent 60%),radial-gradient(ellipse 30% 40% at 82% 70%,${palette.secondary}08 0%,transparent 60%)`,
        animation:"tmiLightDrift 12s ease-in-out infinite",
        transition:"background 1.2s ease",
      }} />

      {/* ── Corner labels ───────────────────────────────────────────── */}
      <div aria-hidden style={{ position:"absolute", top:8,  left:8,  zIndex:200, fontSize:7, fontWeight:900, letterSpacing:"0.3em", color:palette.primary,   opacity:0.5, pointerEvents:"none" }}>◤ TMI</div>
      <div aria-hidden style={{ position:"absolute", top:8,  right:8, zIndex:200, fontSize:7, fontWeight:900, letterSpacing:"0.3em", color:palette.secondary, opacity:0.5, pointerEvents:"none" }}>INDEX ◥</div>
      <div aria-hidden style={{ position:"absolute", bottom:8,left:8, zIndex:200, fontSize:7, fontWeight:900, letterSpacing:"0.3em", color:palette.secondary, opacity:0.4, pointerEvents:"none" }}>◣ LIVE</div>
      <div aria-hidden style={{ position:"absolute", bottom:8,right:8,zIndex:200, fontSize:7, fontWeight:900, letterSpacing:"0.3em", color:palette.primary,   opacity:0.4, pointerEvents:"none" }}>2026 ◢</div>

      {/* ── Thin frame lines ────────────────────────────────────────── */}
      <div aria-hidden style={{ position:"absolute", inset:0, margin:6,  border:`1px solid ${palette.primary}22`,   borderRadius:4, pointerEvents:"none", zIndex:201 }} />
      <div aria-hidden style={{ position:"absolute", inset:0, margin:14, border:`1px solid ${palette.secondary}11`, borderRadius:2, pointerEvents:"none", zIndex:201 }} />

      {/* ── Starburst ───────────────────────────────────────────────── */}
      {starburstActive && (
        <div aria-hidden style={{
          position:"fixed", left:"50%", top:"42%",
          width:100, height:100, borderRadius:"50%",
          background:`radial-gradient(circle,${palette.primary} 0%,${palette.secondary}88 45%,transparent 70%)`,
          pointerEvents:"none", zIndex:500,
          animation:"tmiStarburst 3s cubic-bezier(.16,1,.3,1) forwards",
        }} />
      )}

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <HomeNavigator />

      {/* ══════════════════════════════════════════════════════════════
          TABLOID HEADLINE TICKER
      ══════════════════════════════════════════════════════════════ */}
      <div style={{
        background:`${palette.primary}18`,
        borderBottom:`1px solid ${palette.primary}33`,
        overflow:"hidden",
        height:26,
        display:"flex",
        alignItems:"center",
        position:"relative",
        zIndex:20,
        flexShrink:0,
      }}>
        <div style={{
          display:"flex",
          whiteSpace:"nowrap",
          animation:"tmiTickerScroll 55s linear infinite",
          willChange:"transform",
        }}>
          {[0, 1].map(rep => (
            <span key={rep} style={{ display:"inline-flex", alignItems:"center" }}>
              {TICKER_LINES.map((line, i) => (
                <span key={i} style={{ display:"inline-flex", alignItems:"center" }}>
                  <span style={{
                    fontSize:8, fontWeight:900, letterSpacing:"0.1em", paddingLeft:32, paddingRight:8,
                    color: i % 2 === 0 ? palette.primary : "rgba(255,255,255,0.55)",
                  }}>
                    {line.replace("{ARTIST}", crownArtist.name).replace("{GENRE}", activeGenre)}
                  </span>
                  <span style={{ color:palette.secondary, fontSize:8, opacity:0.7 }}>◆</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          HERO ZONE
      ══════════════════════════════════════════════════════════════ */}
      <main style={{ flex:"7 0 0", display:"flex", flexDirection:"column", alignItems:"center", padding:"12px 16px 8px", position:"relative", zIndex:10 }}>

        {/* TMI masthead wordmark — with scanline glitch on crown swap */}
        <div style={{ textAlign:"center", animation:"tmiMastIn 0.9s cubic-bezier(.16,1,.3,1) both", marginBottom:8 }}>
          <div style={{
            fontFamily:"var(--font-tmi-editorial,'Playfair Display',Georgia,serif)",
            fontSize:"clamp(20px,4vw,42px)", fontWeight:900, letterSpacing:"0.28em",
            textTransform:"uppercase", color:"#fff",
            textShadow:`0 0 30px ${palette.primary}99, 0 0 60px ${palette.primary}44, 0 2px 0 rgba(0,0,0,0.7), 2px 0 0 ${palette.secondary}33`,
            animation: logoGlitch ? "tmiLogoGlitch 0.85s cubic-bezier(0.7,0,0.3,1) both" : "tmiLogoGlow 2.5s ease-in-out infinite",
            display:"inline-block",
          }}>
            TMI
          </div>
          <div style={{ fontSize:7, fontWeight:900, letterSpacing:"0.28em", color:palette.primary, marginTop:1, textTransform:"uppercase" }}>
            THE MUSICIAN&apos;S INDEX
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"center", alignItems:"center", marginTop:5, flexWrap:"wrap" }}>
            <span style={{ fontSize:7, fontWeight:900, letterSpacing:"0.2em", color:"rgba(255,255,255,0.4)" }}>ISSUE #{issue.issueNumber} — {issue.editorialFocus}</span>
            <span style={{ width:1, height:8, background:"rgba(255,255,255,0.2)" }} />
            <span style={{ fontSize:7, fontWeight:700, letterSpacing:"0.15em", color:palette.primary, opacity:0.9 }}>{activeGenre.toUpperCase()}</span>
          </div>
        </div>

        {/* Orbit ring container */}
        <div className="tmi-orbit-wrap" style={{ position:"relative" }}>
          <div style={{ position:"relative", width:RING_SIZE, height:RING_SIZE }}>

            {/* Glow rings */}
            <div aria-hidden style={{ position:"absolute", inset:0,  borderRadius:"50%", border:`1.5px solid ${palette.primary}44`, animation:"tmiRingGlow 3s ease-in-out infinite" }} />
            <div aria-hidden style={{ position:"absolute", inset:28, borderRadius:"50%", border:`1px solid ${palette.secondary}22`,  animation:"tmiRingGlow 3s ease-in-out infinite", animationDelay:"1.5s" }} />
            <div aria-hidden style={{ position:"absolute", inset:58, borderRadius:"50%", border:`0.5px solid ${palette.primary}12` }} />

            {/* Center label */}
            <div style={{ position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)", textAlign:"center", pointerEvents:"none" }}>
              <div style={{ fontSize:11, fontWeight:900, letterSpacing:"0.3em", color:palette.primary, opacity:0.7 }}>INDEX</div>
              <div style={{ fontSize:8,  fontWeight:700, letterSpacing:"0.2em", color:"rgba(255,255,255,0.25)", marginTop:2 }}>TOP 9</div>
            </div>

            {/* Spinning ring */}
            <div className="tmi-ring" style={{
              position:"absolute", inset:0, willChange:"transform",
              animationName: orbitCW ? "tmiOrbitCW" : "tmiOrbitCCW",
              animationDuration:`${ORBIT_DURATION}s`,
            }}>
              {artists.map((artist, i) => {
                const pos = orbitPos(i);
                const isFirst = i === 0;
                const ap = GENRE_PALETTE[artist.genre];
                const deltaColor = artist.delta > 0 ? "#00FF88" : artist.delta < 0 ? "#FF4444" : "rgba(255,255,255,0.3)";
                return (
                  <div key={artist.name} className="tmi-card-inner" style={{
                    position:"absolute", left:pos.left, top:pos.top,
                    width:CARD_W, height:CARD_H,
                    animationName: orbitCW ? "tmiCounterCW" : "tmiCounterCCW",
                    animationDuration:`${ORBIT_DURATION}s`,
                    willChange:"transform", cursor:"pointer",
                  }}>
                    <div style={{
                      width:"100%", height:"100%", borderRadius:0,
                      clipPath: CARD_CLIPS[i % CARD_CLIPS.length],
                      background: isFirst ? `linear-gradient(135deg,${palette.primary}33,${palette.secondary}22)` : "rgba(255,255,255,0.04)",
                      border:`1px solid ${isFirst ? palette.primary+"99" : ap.primary+"44"}`,
                      boxShadow: isFirst ? `0 0 28px ${palette.primary}55,inset 0 0 16px ${palette.primary}11` : "none",
                      animation: isFirst ? "tmiPulse 2.5s ease-in-out infinite" : "none",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                      padding:"8px 6px", textAlign:"center", position:"relative", backdropFilter:"blur(4px)",
                    }}>
                      <div style={{ position:"absolute", top:5, left:6, fontSize:8, fontWeight:900, letterSpacing:"0.1em", color: isFirst ? "#FFD700" : "rgba(255,255,255,0.25)" }}>
                        #{artist.rank}
                      </div>

                      {isFirst && (
                        <div style={{ position:"absolute", top:-20, fontSize:20, animation:"tmiCrownFloat 2.8s ease-in-out infinite", filter:`drop-shadow(0 0 8px ${palette.primary})` }}>
                          👑
                        </div>
                      )}

                      <div style={{
                        width:48, height:48, borderRadius:"50%",
                        background:`radial-gradient(circle at 35% 35%,${ap.primary}55,${ap.secondary}22)`,
                        border:`2px solid ${ap.primary}77`, marginBottom:7,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:18, fontWeight:900, color:ap.primary,
                      }}>
                        {artist.name.charAt(0)}
                      </div>

                      <div style={{ fontSize:10, fontWeight:900, letterSpacing:"0.05em", color: isFirst ? "#fff" : "rgba(255,255,255,0.8)", lineHeight:1.2, maxWidth:"100%", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {artist.name}
                      </div>

                      <div style={{ display:"flex", gap:4, alignItems:"center", marginTop:4 }}>
                        <span style={{ fontSize:8, color:"rgba(255,255,255,0.4)", fontWeight:700 }}>{artist.score.toLocaleString()}</span>
                        <span style={{ fontSize:8, color:deltaColor, fontWeight:900 }}>{artist.delta > 0 ? `+${artist.delta}` : artist.delta}</span>
                      </div>

                      <div style={{ marginTop:5, padding:"2px 8px", fontSize:6, fontWeight:900, letterSpacing:"0.12em", border:`1px solid ${ap.primary}44`, borderRadius:20, color:ap.primary, textTransform:"uppercase" }}>
                        {artist.genre}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Crown hero overlay */}
            {showCrownHero && (
              <div style={{
                position:"absolute", left:"50%", top:"50%",
                width: CARD_W * 2.2, height: CARD_H * 2.2,
                zIndex:100, pointerEvents:"none", willChange:"transform,opacity",
                animation:
                  lifecyclePhase === "crown-enter" ? "tmiCrownEnter 1.6s cubic-bezier(.16,1,.3,1) forwards" :
                  (lifecyclePhase === "starburst" || lifecyclePhase === "settling") ? "tmiCrownExit 0.8s ease-in forwards" :
                  "tmiCrownFloat 2.8s ease-in-out infinite",
              }}>
                <div style={{
                  width:"100%", height:"100%", borderRadius:0,
                  clipPath:"polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))",
                  background:`linear-gradient(135deg,${palette.primary}44,${palette.secondary}33,rgba(0,0,0,0.3))`,
                  border:`2px solid ${palette.primary}cc`,
                  boxShadow:`0 0 60px ${palette.primary}66,0 0 120px ${palette.primary}33,inset 0 0 30px ${palette.primary}11`,
                  backdropFilter:"blur(10px)",
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                  padding:"16px 12px", textAlign:"center", position:"relative",
                }}>
                  <div style={{ fontSize:32, marginBottom:8, filter:`drop-shadow(0 0 16px ${palette.primary})` }}>👑</div>
                  <div style={{ fontFamily:"var(--font-tmi-editorial,'Playfair Display',Georgia,serif)", fontSize:10, fontWeight:900, letterSpacing:"0.25em", color:"#FFD700", textTransform:"uppercase", marginBottom:6 }}>
                    #{crownArtist.rank} CROWN
                  </div>
                  <div style={{ width:72, height:72, borderRadius:"50%", background:`radial-gradient(circle at 35% 35%,${palette.primary}66,${palette.secondary}33)`, border:`3px solid ${palette.primary}`, boxShadow:`0 0 24px ${palette.primary}88`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:900, color:palette.primary, marginBottom:10 }}>
                    {crownArtist.name.charAt(0)}
                  </div>
                  <div style={{ fontSize:14, fontWeight:900, letterSpacing:"0.06em", color:"#fff", lineHeight:1.2 }}>
                    {crownArtist.name}
                  </div>
                  <div style={{ fontSize:10, color:palette.primary, fontWeight:700, marginTop:3 }}>
                    {crownArtist.score.toLocaleString()} pts
                  </div>
                  <div style={{ marginTop:8, padding:"3px 12px", fontSize:7, fontWeight:900, letterSpacing:"0.15em", background:`${palette.primary}22`, border:`1px solid ${palette.primary}66`, borderRadius:0, clipPath:"polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%)", color:palette.primary, textTransform:"uppercase" }}>
                    {activeGenre}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Genre progress dots */}
        <div style={{ marginTop:14, display:"flex", gap:5, alignItems:"center", flexWrap:"wrap", justifyContent:"center" }}>
          {TMI_GENRES.map((g, i) => (
            <div key={g} style={{ width: i === genreIndex ? 22 : 6, height:6, borderRadius:0, clipPath:"polygon(2px 0,100% 0,calc(100% - 2px) 100%,0 100%)", background: i === genreIndex ? palette.primary : "rgba(255,255,255,0.12)", transition:"width 0.4s cubic-bezier(0.7,0,0.3,1),background 0.6s ease" }} />
          ))}
        </div>

      </main>

      {/* ══════════════════════════════════════════════════════════════
          DYNAMIC BILLBOARD GRID  (replaces static tabloid tiles)
      ══════════════════════════════════════════════════════════════ */}
      <section style={{
        flex:"3 0 0", minHeight:"26vh",
        borderTop:`1px solid ${palette.primary}33`,
        background:"rgba(0,0,0,0.62)", backdropFilter:"blur(14px)",
        position:"relative", zIndex:10, padding:"10px 12px 8px", overflow:"hidden",
      }}>

        {/* Scanline overlay */}
        <div aria-hidden style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:1, backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.07) 3px,rgba(0,0,0,0.07) 4px)", backgroundSize:"100% 4px" }} />

        {/* Angled accent wash */}
        <div aria-hidden style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0, background:`linear-gradient(108deg,${palette.primary}08 0%,transparent 45%)` }} />

        {/* Section header */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:9, position:"relative", zIndex:2 }}>
          <div style={{ fontFamily:"var(--font-tmi-editorial,'Playfair Display',Georgia,serif)", fontSize:"clamp(11px,2.5vw,17px)", fontWeight:900, letterSpacing:"0.18em", color:"#fff", textTransform:"uppercase" }}>
            Active Performers
          </div>
          <div style={{ height:1, flex:1, background:`linear-gradient(90deg,${palette.primary}55,transparent)` }} />
          <Link href="/rankings" style={{ fontSize:6, fontWeight:900, letterSpacing:"0.2em", color:palette.primary, border:`1px solid ${palette.primary}44`, padding:"2px 8px", borderRadius:0, textDecoration:"none", animation:"tmiRingGlow 2s ease-in-out infinite", clipPath:"polygon(3px 0,100% 0,calc(100% - 3px) 100%,0 100%)" }}>
            FULL INDEX →
          </Link>
        </div>

        {/* Bento grid — featured 2×2, rest 1×1 */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gridAutoRows:"78px", gap:6, position:"relative", zIndex:2 }}>

          {/* Featured card */}
          <Link href="/rankings" style={{ gridColumn:"span 2", gridRow:"span 2", textDecoration:"none" }}>
            <div key={`featured-${fIdx}`} style={{
              height:"100%",
              background:`linear-gradient(135deg,${GENRE_PALETTE[featuredArtist.genre].primary}2a,${GENRE_PALETTE[featuredArtist.genre].secondary}18)`,
              border:`1.5px solid ${GENRE_PALETTE[featuredArtist.genre].primary}77`,
              clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
              padding:"12px 11px",
              display:"flex", flexDirection:"column",
              animation:"tmiBillboardIn 0.5s cubic-bezier(0.7,0,0.3,1) both, tmiFeaturedPulse 3s ease-in-out infinite",
              cursor:"pointer", position:"relative", overflow:"hidden",
            }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${GENRE_PALETTE[featuredArtist.genre].primary},transparent)` }} />
              <div style={{ fontSize:8, fontWeight:900, letterSpacing:"0.15em", color:"#FFD700", marginBottom:4 }}>
                ★ FEATURED · #{featuredArtist.rank}
              </div>
              <div style={{
                width:44, height:44, borderRadius:"50%",
                background:`radial-gradient(circle at 35% 35%,${GENRE_PALETTE[featuredArtist.genre].primary}55,${GENRE_PALETTE[featuredArtist.genre].secondary}22)`,
                border:`2px solid ${GENRE_PALETTE[featuredArtist.genre].primary}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:18, fontWeight:900, color:GENRE_PALETTE[featuredArtist.genre].primary,
                marginBottom:8,
              }}>
                {featuredArtist.name.charAt(0)}
              </div>
              <div style={{ fontSize:12, fontWeight:900, color:"#fff", lineHeight:1.2, marginBottom:4 }}>
                {featuredArtist.name}
              </div>
              <div style={{ fontFamily:"var(--font-tmi-editorial,'Playfair Display',Georgia,serif)", fontSize:9, color:"rgba(255,255,255,0.55)", fontStyle:"italic", lineHeight:1.35, marginBottom:"auto" }}>
                &ldquo;{SNEAKY_QUOTES[fIdx % SNEAKY_QUOTES.length]}&rdquo;
              </div>
              <div style={{ display:"flex", gap:6, alignItems:"center", marginTop:6 }}>
                <span style={{ fontSize:8, fontWeight:900, color: featuredArtist.delta > 0 ? "#00FF88" : "#FF4444" }}>
                  {featuredArtist.delta > 0 ? `▲${featuredArtist.delta}` : `▼${Math.abs(featuredArtist.delta)}`}
                </span>
                <span style={{ fontSize:8, color:"rgba(255,255,255,0.3)" }}>{featuredArtist.score.toLocaleString()} pts</span>
                <span style={{ marginLeft:"auto", fontSize:6, fontWeight:900, letterSpacing:"0.1em", color:GENRE_PALETTE[featuredArtist.genre].primary, border:`1px solid ${GENRE_PALETTE[featuredArtist.genre].primary}44`, padding:"1px 5px", clipPath:"polygon(3px 0,100% 0,calc(100% - 3px) 100%,0 100%)" }}>
                  {featuredArtist.genre.toUpperCase()}
                </span>
              </div>
            </div>
          </Link>

          {/* Regular side cards */}
          {sideArtists.map((artist, i) => {
            const ap = GENRE_PALETTE[artist.genre];
            const deltaColor = artist.delta > 0 ? "#00FF88" : "#FF4444";
            return (
              <Link key={artist.name} href="/rankings" style={{ textDecoration:"none" }}>
                <div style={{
                  height:"100%",
                  background:"rgba(255,255,255,0.03)",
                  border:`1px solid ${ap.primary}33`,
                  clipPath: CARD_CLIPS[(i + 1) % CARD_CLIPS.length],
                  padding:"7px 6px",
                  display:"flex", flexDirection:"column",
                  animation:`tmiBillboardIn 0.4s ${i * 0.04}s cubic-bezier(0.7,0,0.3,1) both`,
                  cursor:"pointer", position:"relative", overflow:"hidden",
                  transition:"background 0.35s cubic-bezier(0.7,0,0.3,1)",
                }}>
                  <div style={{ fontSize:7, fontWeight:900, color:"rgba(255,255,255,0.3)", marginBottom:2 }}>#{artist.rank}</div>
                  <div style={{
                    width:24, height:24, borderRadius:"50%",
                    background:`radial-gradient(circle at 35% 35%,${ap.primary}44,${ap.secondary}11)`,
                    border:`1.5px solid ${ap.primary}66`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:10, fontWeight:900, color:ap.primary, marginBottom:4,
                  }}>
                    {artist.name.charAt(0)}
                  </div>
                  <div style={{ fontSize:8, fontWeight:900, color:"rgba(255,255,255,0.85)", lineHeight:1.2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {artist.name}
                  </div>
                  <div style={{ marginTop:"auto", fontSize:7, fontWeight:900, color:deltaColor }}>
                    {artist.delta > 0 ? `▲${artist.delta}` : `▼${Math.abs(artist.delta)}`}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </section>

      {/* ── Live Lobby Video Wall ───────────────────────────────────── */}
      <HomeLobbyVideoWall accentColor={palette.primary} />

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <FooterHUD />

      {/* ── Leak notifications ──────────────────────────────────────── */}
      {leaks.map(leak => (
        <div key={leak.id} style={{ position:"fixed", ...LEAK_EDGE_STYLES[leak.edge], zIndex:400, background:"rgba(0,0,0,0.9)", border:`1px solid ${palette.primary}66`, borderRadius:0, clipPath:"polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))", padding:"8px 14px", maxWidth:220, animation:"tmiLeakIn 0.3s cubic-bezier(.16,1,.3,1) both", backdropFilter:"blur(12px)" }}>
          <div style={{ fontSize:7, fontWeight:900, letterSpacing:"0.2em", color:palette.primary, marginBottom:3 }}>EXCLUSIVE</div>
          <div style={{ fontSize:10, fontWeight:800, color:"#fff", letterSpacing:"0.04em", lineHeight:1.3 }}>{leak.text}</div>
        </div>
      ))}

      {/* ── Viral Sticker Engine overlay ────────────────────────────── */}
      {stickerQueue.map((sticker) => (
        <div key={sticker.id} style={{
          position:"fixed",
          left:`${sticker.x}%`,
          top:`${sticker.y}%`,
          zIndex:600,
          transform:`rotate(${sticker.rotation}deg)`,
          pointerEvents:"auto",
        }}>
          <Link href={sticker.href} style={{ textDecoration:"none" }}>
            <div style={{
              background:`${sticker.color}f0`,
              color:"#000",
              padding:"9px 14px",
              fontWeight:900,
              fontSize:11,
              letterSpacing:"0.04em",
              maxWidth:190,
              lineHeight:1.3,
              boxShadow:`0 4px 24px rgba(0,0,0,0.6), 0 0 0 2px rgba(0,0,0,0.3)`,
              clipPath:`polygon(0 8px,8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%)`,
              animation:"tmiStickerSlap 0.55s cubic-bezier(0.7,0,0.3,1) both",
              cursor:"pointer",
            }}>
              {sticker.text}
            </div>
          </Link>
        </div>
      ))}

      {/* ── Global scanline overlay ─────────────────────────────────── */}
      <div aria-hidden style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:202, backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px)", backgroundSize:"100% 4px" }} />

      {/* ── Radial light leak overlay ───────────────────────────────── */}
      <div aria-hidden style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:203, background:`radial-gradient(ellipse at 0% 50%,${palette.primary}07 0%,transparent 40%),radial-gradient(ellipse at 100% 50%,${palette.secondary}05 0%,transparent 40%)`, transition:"background 1.2s ease" }} />

    </div>
  );
}
