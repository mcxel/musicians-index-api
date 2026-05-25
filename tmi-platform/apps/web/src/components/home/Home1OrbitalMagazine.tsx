"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import HomeAtmosphereEngine from "@/components/home/HomeAtmosphereEngine";
import TabloidOverlayEngine from "@/components/home/TabloidOverlayEngine";
import CollagePanels from "@/components/home/CollagePanels";
import HomeNavigator from "@/components/home/HomeNavigator";
import FooterHUD from "@/components/hud/FooterHUD";
import HomeLobbyVideoWall from "@/components/home/HomeLobbyVideoWall";
import { getCurrentIssue, STATIC_LEAKS } from "@/lib/magazine/IndexMagazineEngine";

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_W = 128;
const CARD_H = 158;
const ORBIT_RADIUS = 280;
const RING_SIZE = 680;
const ORBIT_DURATION = 34;
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

// ─── Tonight's schedule ───────────────────────────────────────────────────────

const TONIGHT_EVENTS = [
  { time: "8:00 PM",  title: "Hip Hop Open Cypher",  format: "Cypher · 8 MCs",  color: "#AA2DFF", href: "/live/rooms" },
  { time: "9:30 PM",  title: "R&B Vocal Showdown",   format: "Battle · 1v1",    color: "#FF2DAA", href: "/battles" },
  { time: "11:00 PM", title: "Late Night Freestyle",  format: "Open Mic · All",  color: "#00FFFF", href: "/battles/live" },
];

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

const TABLOID_OVERLAYS = [
  { text: "WHO TOOK THE CROWN?", color: "#FFD700", x: "5%", y: "22%", r: -9, href: "/battles/weekly-cypher" },
  { text: "CYPHER ARENA OPEN", color: "#00FFFF", x: "76%", y: "24%", r: 8, href: "/live/rooms" },
  { text: "DRUM BATTLE LIVE TONIGHT", color: "#FF2DAA", x: "8%", y: "70%", r: -6, href: "/battles/live" },
  { text: "NEW MUSIC INSIDE", color: "#00FF88", x: "78%", y: "68%", r: 6, href: "/magazine" },
] as const;

const BATTLE_HEADLINES = [
  "FlowMaster calls out Neon Verse in tonight's 1v1",
  "Dirty Dozens ladder resets at midnight",
  "Audience votes are doubling in final 5 minutes",
  "Cypher Arena wild-card slot opens in 12 minutes",
  "Producer Lab drum battle now accepting challengers",
] as const;

const LIVE_ROOM_PREVIEWS = [
  { label: "Main Lobby Cam", href: "/live/rooms/monthly-idol", accent: "#00FFFF" },
  { label: "Cypher East Feed", href: "/live/rooms/cypher-arena", accent: "#FF2DAA" },
  { label: "Battle Ring POV", href: "/live/battles", accent: "#FFD700" },
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

// ─── Geometric clip-paths per orbit position (matches reference image) ────────

const CARD_CLIPS = [
  "polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)",                                 // 0: hexagon
  "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",  // 1: 5-point star
  "circle(46% at 50% 50%)",                                                                      // 2: circle
  "polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%)",                                         // 3: pentagon
  "polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)",                 // 4: octagon
  "polygon(50% 0%,100% 50%,50% 100%,0% 50%)",                                                  // 5: diamond
  "polygon(0% 25%,0% 75%,50% 100%,100% 75%,100% 25%,50% 0%)",                                 // 6: vertical hexagon
  "polygon(0 0,100% 0,100% 75%,50% 100%,0 75%)",                                               // 7: shield
  "polygon(15% 0%,85% 0%,100% 15%,100% 85%,85% 100%,15% 100%,0% 85%,0% 15%)",                 // 8: chamfered rect
];

// ─── Country flags per orbit position ─────────────────────────────────────────

const POSITION_FLAGS = ["🇺🇸","🇯🇲","🇬🇧","🇧🇷","🇳🇬","🇿🇦","🇲🇽","🇨🇦","🇫🇷"] as const;

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
  const [logoGlitch,  setLogoGlitch]  = useState(false);
  const [fansOnline,  setFansOnline]  = useState(1847);
  const [liveRooms,   setLiveRooms]   = useState(14);
  const [risingIdx,   setRisingIdx]   = useState(0);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [punchCard,   setPunchCard]   = useState<number | null>(null);
  const [liveScores,   setLiveScores]   = useState<Record<string, number>>({});
  const [liveDeltas,   setLiveDeltas]   = useState<Record<string, number>>({});
  const [flashedCards, setFlashedCards] = useState<Set<string>>(new Set());
  const [voteCount,    setVoteCount]    = useState(247);
  const [genreFlash,   setGenreFlash]   = useState(false);
  const [burstPieces,  setBurstPieces]  = useState<{id:number;color:string;bx:number;by:number}[]>([]);
  const [interruptIdx, setInterruptIdx] = useState<number | null>(null);
  const [magazineText, setMagazineText] = useState('');
  const [magazinePhase, setMagazinePhase] = useState<'idle'|'typing'|'hold'|'erasing'>('idle');
  const [burstFaces, setBurstFaces] = useState(false);
  const [crownFlash, setCrownFlash] = useState(false);
  const [instantActivityCue, setInstantActivityCue] = useState("LIVE NOW · CHAT MOVING");
  const firstEventDoneRef = useRef(false);

  const leakIdRef      = useRef(0);
  const leakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stickerIdRef   = useRef(0);
  const stickerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevGenreRef   = useRef(genreIndex);
  const flashTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstIdRef     = useRef(0);

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

  // Logo glitch + genre flash on crown holder change
  useEffect(() => {
    if (prevGenreRef.current !== genreIndex) {
      prevGenreRef.current = genreIndex;
      setLogoGlitch(true);
      setGenreFlash(true);
      const t1 = setTimeout(() => setLogoGlitch(false), 900);
      const t2 = setTimeout(() => setGenreFlash(false), 600);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [genreIndex]);

  // Random orbital punch-in — grabs attention every 4–8s
  useEffect(() => {
    let active = true;
    function fire() {
      if (!active) return;
      const delay = 4000 + Math.random() * 4000;
      setTimeout(() => {
        if (!active) return;
        setPunchCard(Math.floor(Math.random() * NUM_ARTISTS));
        setTimeout(() => { setPunchCard(null); fire(); }, 620);
      }, delay);
    }
    const init = setTimeout(fire, 2500);
    return () => { active = false; clearTimeout(init); };
  }, []);

  // Live viewer + room counter simulation
  useEffect(() => {
    const id = setInterval(() => {
      setFansOnline(n => Math.max(800, Math.min(3600, n + Math.round((Math.random() - 0.42) * 120))));
      setLiveRooms(n => Math.max(9, Math.min(24, n + (Math.random() > 0.62 ? 1 : Math.random() > 0.5 ? -1 : 0))));
    }, 3400);
    return () => clearInterval(id);
  }, []);

  // First-3-seconds activity injection so the surface feels alive immediately
  useEffect(() => {
    const cues = [
      "LIVE NOW · CHAT MOVING",
      "🔥 VOTE JUST LANDED",
      "💬 NEW MESSAGE",
      "👑 CROWN SHIFTING...",
      "⚡ RANKING UPDATE",
    ];

    let cueIndex = 0;
    setInstantActivityCue(cues[0]!);

    const cueTimer = setInterval(() => {
      cueIndex = (cueIndex + 1) % cues.length;
      setInstantActivityCue(cues[cueIndex]!);
    }, 650);

    const pulseTimer = setInterval(() => {
      setVoteCount(count => count + 1 + Math.floor(Math.random() * 2));
      setFansOnline(count => Math.min(3600, count + 1 + Math.floor(Math.random() * 3)));
      setLiveRooms(count => Math.min(24, count + (Math.random() > 0.45 ? 1 : 0)));
    }, 500);

    const stopTimer = setTimeout(() => {
      clearInterval(cueTimer);
      clearInterval(pulseTimer);
      setInstantActivityCue("Tap to vote live");
    }, 3200);

    return () => {
      clearInterval(cueTimer);
      clearInterval(pulseTimer);
      clearTimeout(stopTimer);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setRisingIdx(i => i + 1), 2700);
    return () => clearInterval(id);
  }, []);

  // Random interruption engine — zoom-forward attention spike every 4–6s
  useEffect(() => {
    let active = true;
    function fire() {
      if (!active) return;
      const delay = 4000 + Math.random() * 2000;
      setTimeout(() => {
        if (!active) return;
        setInterruptIdx(Math.floor(Math.random() * NUM_ARTISTS));
        setTimeout(() => { setInterruptIdx(null); fire(); }, 1800);
      }, delay);
    }
    const init = setTimeout(fire, 2000);
    return () => { active = false; clearTimeout(init); };
  }, []);

  // Initialize live scores on genre change
  useEffect(() => {
    const scores: Record<string, number> = {};
    const deltas: Record<string, number> = {};
    artists.forEach(a => { scores[a.name] = a.score; deltas[a.name] = a.delta; });
    setLiveScores(scores);
    setLiveDeltas(deltas);
    setVoteCount(Math.floor(Math.random() * 300 + 150));
  }, [genreIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Live score simulation — 1-2 artists tick every 2.2s
  useEffect(() => {
    const id = setInterval(() => {
      const num = 1 + Math.floor(Math.random() * 2);
      const pool = [...artists].sort(() => Math.random() - 0.5).slice(0, num);
      const names = new Set(pool.map(a => a.name));
      setLiveScores(prev => {
        const next = { ...prev };
        pool.forEach(a => {
          const dir = Math.random() > 0.38 ? 1 : -1;
          next[a.name] = Math.max(500, (prev[a.name] ?? a.score) + dir * (Math.floor(Math.random() * 14) + 5));
        });
        return next;
      });
      setLiveDeltas(prev => {
        const next = { ...prev };
        pool.forEach(a => {
          const dir = Math.random() > 0.38 ? 1 : -1;
          next[a.name] = dir * (Math.floor(Math.random() * 14) + 5);
        });
        return next;
      });
      setFlashedCards(names);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      flashTimerRef.current = setTimeout(() => setFlashedCards(new Set()), 700);
    }, 2200);
    return () => clearInterval(id);
  }, [artists]); // eslint-disable-line react-hooks/exhaustive-deps

  // Vote count simulation
  useEffect(() => {
    const id = setInterval(() => setVoteCount(c => c + Math.floor(Math.random() * 8) + 1), 820);
    return () => clearInterval(id);
  }, []);

  // Burst confetti on starburst
  useEffect(() => {
    if (!starburstActive) return;
    const colors = ["#FFD700","#FF2DAA","#00FFFF","#00FF88","#AA2DFF","#FF6B35","#ffffff"];
    const pieces = Array.from({ length: 24 }, (_, i) => {
      const angle = (i / 24) * 2 * Math.PI;
      const r = 140 + Math.random() * 80;
      return { id: ++burstIdRef.current * 100 + i, color: colors[i % colors.length]!, bx: Math.cos(angle) * r, by: Math.sin(angle) * r };
    });
    setBurstPieces(pieces);
    const t = setTimeout(() => setBurstPieces([]), 1400);
    return () => clearTimeout(t);
  }, [starburstActive]);

  // First-load human burst + 3-second crown event
  useEffect(() => {
    const t1 = setTimeout(() => setBurstFaces(true), 280);
    const t2 = setTimeout(() => {
      if (firstEventDoneRef.current) return;
      firstEventDoneRef.current = true;
      setCrownFlash(true);
      const colors = ["#FFD700","#FF2DAA","#00FFFF","#00FF88","#AA2DFF","#FF6B35","#ffffff"];
      const pieces = Array.from({ length: 22 }, (_, i) => {
        const angle = (i / 22) * 2 * Math.PI;
        const r = 90 + Math.random() * 70;
        return { id: ++burstIdRef.current * 100 + i, color: colors[i % colors.length]!, bx: Math.cos(angle) * r, by: Math.sin(angle) * r };
      });
      setBurstPieces(pieces);
      const flashNames = new Set<string>([artists[0]!.name, artists[2]!.name]);
      setFlashedCards(flashNames);
      setTimeout(() => {
        setBurstPieces([]);
        setFlashedCards(new Set());
        setCrownFlash(false);
      }, 2200);
    }, 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Typewriter "MAGAZINE" animation — types under masthead then erases
  useEffect(() => {
    const WORD = 'MAGAZINE';
    let t: ReturnType<typeof setTimeout>;
    function startCycle() {
      setMagazinePhase('idle');
      setMagazineText('');
      t = setTimeout(() => {
        setMagazinePhase('typing');
        let idx = 0;
        function typeNext() {
          idx++;
          setMagazineText(WORD.slice(0, idx));
          if (idx < WORD.length) {
            t = setTimeout(typeNext, 120);
          } else {
            setMagazinePhase('hold');
            t = setTimeout(() => {
              setMagazinePhase('erasing');
              let e = WORD.length;
              function eraseNext() {
                e--;
                setMagazineText(WORD.slice(0, e));
                if (e > 0) { t = setTimeout(eraseNext, 80); }
                else        { t = setTimeout(startCycle, 500); }
              }
              eraseNext();
            }, 2200);
          }
        }
        typeNext();
      }, 3000 + Math.random() * 2000);
    }
    startCycle();
    return () => clearTimeout(t);
  }, []);

  // Sponsor ticker — poll pool every 45s, show in social proof bar
  const [liveSponsorCount, setLiveSponsorCount] = useState(0);
  useEffect(() => {
    async function fetchPool() {
      try {
        const res = await fetch('/api/sponsor/attach');
        if (!res.ok) return;
        const data = await res.json() as { stats?: { totalSponsors: number } };
        if (data.stats) setLiveSponsorCount(data.stats.totalSponsors);
      } catch { /* silent */ }
    }
    fetchPool();
    const id = setInterval(fetchPool, 45_000);
    return () => clearInterval(id);
  }, []);

  // Bento grid: featured artist first, rest follow
  const fIdx = featuredIdx % NUM_ARTISTS;
  const featuredArtist = artists[fIdx]!;
  const sideArtists = artists.filter((_, i) => i !== fIdx);

  // Genre quick-jump — resets lifecycle from target genre
  const jumpToGenre = (i: number) => {
    setGenreIndex(i);
    setLifecyclePhase("spinning");
    setShowCrownHero(false);
    setStarburstActive(false);
    setCycleCount(c => c + 1);
  };

  // Ticker text with substitutions
  const tickerText = TICKER_LINES
    .map(l => l.replace("{ARTIST}", crownArtist.name).replace("{GENRE}", activeGenre))
    .join("  ◆  ");

  return (
    <div style={{ minHeight: "100vh", background: palette.bg, transition: "background 1.4s ease", color: "#fff", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Bebas+Neue&display=swap');
        :root {
          --font-tmi-editorial: 'Playfair Display','Georgia','Times New Roman',serif;
          --font-tmi-impact: 'Bebas Neue','Impact','Arial Narrow',sans-serif;
        }

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
        @keyframes tmiPunchIn {
          0%   { transform:scale(1);    filter:brightness(1);   }
          28%  { transform:scale(1.26); filter:brightness(1.9) drop-shadow(0 0 18px var(--pc,#FFD700)); }
          65%  { transform:scale(0.97); filter:brightness(1.1); }
          100% { transform:scale(1);    filter:brightness(1);   }
        }
        @keyframes driftGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes tmiConfettiDrift {
          0%   { transform:translateY(0)   rotate(0deg)   scale(1);   opacity:0.9; }
          100% { transform:translateY(60px) rotate(360deg) scale(0.7); opacity:0; }
        }
        @keyframes tmiLightningFlash {
          0%,88%,100% { opacity:0.7; }
          90% { opacity:1; filter:brightness(2); }
          94% { opacity:0.5; }
        }
        @keyframes tmiBadgePulse {
          0%,100% { box-shadow:0 0 0 0 rgba(255,215,0,0.4); }
          50%      { box-shadow:0 0 0 8px rgba(255,215,0,0); }
        }
        @keyframes tmiWeeklyCyphersIn {
          0%   { opacity:0; transform:translateY(16px); }
          100% { opacity:1; transform:translateY(0); }
        }
        @keyframes tmiHypeBotSlide {
          0%   { opacity:0; transform:translateX(-12px); }
          100% { opacity:1; transform:translateX(0); }
        }
        @keyframes tmiVoteTextGlow {
          0%,100% { text-shadow:0 0 8px #FFD700; }
          50%     { text-shadow:0 0 22px #FFD700, 0 0 40px #FF9500; }
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

        @keyframes tmiScoreFlash {
          0%   { filter:brightness(1); }
          35%  { filter:brightness(2.8) drop-shadow(0 0 6px #FFD700); }
          70%  { filter:brightness(1.4); }
          100% { filter:brightness(1); }
        }
        @keyframes tmiGenreFlash {
          0%   { filter:brightness(1); transform:scale(1); }
          25%  { filter:brightness(2.2) drop-shadow(0 0 28px #FFD700); transform:scale(1.05); }
          65%  { filter:brightness(1.3); transform:scale(0.98); }
          100% { filter:brightness(1); transform:scale(1); }
        }
        @keyframes tmiConfettiBurst {
          0%   { transform:translate(0,0) rotate(0deg) scale(1); opacity:1; }
          100% { transform:translate(var(--bx,80px), var(--by,80px)) rotate(540deg) scale(0.2); opacity:0; }
        }
        @keyframes tmiLabelIn {
          0%   { opacity:0; }
          100% { opacity:1; }
        }
        @keyframes tmiTypewriterCursor {
          0%,100% { opacity:1; }
          50%     { opacity:0; }
        }
        @keyframes tmiHypePop {
          0%   { opacity:0; transform:scale(0.5) rotate(-8deg); }
          55%  { opacity:1; transform:scale(1.1) rotate(2deg); }
          72%  { transform:scale(0.97) rotate(-1deg); }
          100% { opacity:1; transform:scale(1) rotate(0deg); }
        }

        @keyframes tmiFacePop {
          0%   { opacity:0; transform:scale(0.25) translateY(28px); filter:blur(8px); }
          55%  { opacity:1; transform:scale(1.08) translateY(-6px); filter:blur(0); }
          72%  { transform:scale(0.96) translateY(2px); }
          100% { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes tmiFaceBreath {
          0%,100% { transform:scale(1)    rotate(var(--fr,0deg)); }
          40%     { transform:scale(1.05) rotate(calc(var(--fr,0deg) + 2.5deg)); }
          70%     { transform:scale(0.97) rotate(calc(var(--fr,0deg) - 1.5deg)); }
        }
        @keyframes tmiCrownChangedFlash {
          0%   { opacity:0; transform:translate(-50%,-50%) scale(0.3) rotate(-6deg); filter:blur(12px); }
          22%  { opacity:1; transform:translate(-50%,-50%) scale(1.08) rotate(1deg); filter:blur(0); }
          75%  { opacity:1; transform:translate(-50%,-50%) scale(1) rotate(0deg); }
          100% { opacity:0; transform:translate(-50%,-50%) scale(0.88) translateY(-30px); }
        }

        @keyframes tmiCardFloat {
          0%,100% { transform:translateY(0px) scale(1); }
          50%     { transform:translateY(-5px) scale(1.012); }
        }
        @keyframes tmiCardGlow {
          0%,100% { filter:brightness(1); }
          50%     { filter:brightness(1.18) drop-shadow(0 0 10px var(--cg,#00FFFF)); }
        }
        @keyframes tmiNeonDrift {
          0% { transform: translateX(-8px) translateY(0px); opacity: 0.55; }
          50% { transform: translateX(8px) translateY(-6px); opacity: 0.95; }
          100% { transform: translateX(-8px) translateY(0px); opacity: 0.55; }
        }
        @keyframes tmiHeadlineBelt {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @media (max-width: 900px) {
          [data-tmi-tabloid-overlay] {
            transform: none !important;
            left: auto !important;
            right: 8px !important;
            top: auto !important;
            bottom: 18px !important;
            position: fixed !important;
          }
          [data-tmi-tabloid-overlay] > div {
            font-size: 9px !important;
            max-width: 150px !important;
          }
        }
      `}</style>

      <HomeAtmosphereEngine primary={palette.primary} secondary={palette.secondary} />

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

      <TabloidOverlayEngine
        primary={palette.primary}
        secondary={palette.secondary}
        crownArtistName={crownArtist.name}
        risingArtistName={artists[risingIdx]?.name ?? "ARTIST"}
        activeGenre={activeGenre}
        voteCount={voteCount}
      />

      <div style={{
        position: "relative",
        zIndex: 24,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "0 12px 6px",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "7px 14px",
          border: `1px solid ${palette.primary}66`,
          background: "rgba(5,5,16,0.86)",
          boxShadow: `0 0 18px ${palette.primary}22, 0 8px 24px rgba(0,0,0,0.45)`,
          clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
          backdropFilter: "blur(12px)",
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
          <span style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: "#FF2DAA",
            boxShadow: "0 0 10px #FF2DAA",
            animation: "tmiRingGlow 1s ease-in-out infinite",
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.18em",
            color: palette.primary,
            textTransform: "uppercase",
          }}>
            {instantActivityCue}
          </span>
          <span style={{
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.38)",
            textTransform: "uppercase",
          }}>
            {voteCount.toLocaleString()} votes
          </span>
          <span style={{
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.38)",
            textTransform: "uppercase",
          }}>
            {fansOnline.toLocaleString()} watching
          </span>
          <Link href="/battles/live" style={{
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.14em",
            color: "#FFD700",
            textDecoration: "none",
            textTransform: "uppercase",
          }}>
            Tap to vote live →
          </Link>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          HERO ZONE
      ══════════════════════════════════════════════════════════════ */}
      <main style={{ flex:"7 0 0", display:"flex", flexDirection:"column", alignItems:"center", padding:"12px 16px 8px", position:"relative", zIndex:10 }}>

        {/* TMI masthead wordmark — magazine-cover circle treatment */}
        <div style={{ textAlign:"center", animation:"tmiMastIn 0.9s cubic-bezier(.16,1,.3,1) both", marginBottom:8, position:"relative", zIndex:12 }}>
          {/* Logo circle */}
          <div style={{
            display:"inline-flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
            width:180, height:180, borderRadius:"50%",
            background:"#1C0A3E",
            border:"3px solid #FFD700",
            boxShadow:"0 0 0 5px #6D28D9, 0 0 24px rgba(255,215,0,0.35)",
            padding:12, position:"relative",
            animation: genreFlash ? "tmiGenreFlash 0.6s cubic-bezier(.16,1,.3,1) both" : "none",
          }}>
            <div style={{ fontSize:8, fontWeight:900, letterSpacing:"0.18em", color:"rgba(255,255,255,0.6)", textTransform:"uppercase", marginBottom:1 }}>THE</div>
            <div style={{
              fontFamily:"var(--font-tmi-editorial,'Playfair Display',Georgia,serif)",
              fontSize:13, fontWeight:900, letterSpacing:"0.06em", color:"#FFD700",
              fontStyle:"italic", lineHeight:1.1, marginBottom:2,
            }}>What took</div>
            <div style={{ fontSize:24, fontWeight:900, letterSpacing:"0.18em", color:"#fff", lineHeight:1, textShadow:"0 0 20px rgba(255,215,0,0.5)" }}>MUSICIANS</div>
            <div style={{ fontSize:26, fontWeight:900, letterSpacing:"0.22em", color:"#fff", lineHeight:1, textShadow:"0 0 20px rgba(255,215,0,0.5)" }}>INDEX</div>
            <div style={{ fontSize:7, fontWeight:900, letterSpacing:"0.22em", color:"rgba(255,215,0,0.7)", marginTop:3 }}>— LIVE —</div>
            <div style={{ position:"absolute", top:-14, right:-4, fontSize:16, fontWeight:900, color:"#AA2DFF", fontFamily:"sans-serif" }}>2</div>
          </div>
          {/* Typewriter MAGAZINE text */}
          <div style={{ height:22, display:"flex", alignItems:"center", justifyContent:"center", gap:2, marginTop:5 }}>
            {(magazineText.length > 0 || magazinePhase !== 'idle') && (
              <>
                <span style={{
                  fontFamily:"var(--font-tmi-impact,'Bebas Neue','Impact',sans-serif)",
                  fontSize:13, fontWeight:900, letterSpacing:"0.55em",
                  color:"#00FFFF", textShadow:"0 0 14px #00FFFF, 0 0 28px #00FFFF55",
                  textTransform:"uppercase",
                }}>
                  {magazineText}
                </span>
                <span style={{
                  display:"inline-block", width:2, height:13,
                  background:"#00FFFF", marginLeft:1, flexShrink:0,
                  boxShadow:"0 0 6px #00FFFF",
                  animation:"tmiTypewriterCursor 0.7s steps(1) infinite",
                }} />
              </>
            )}
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"center", alignItems:"center", marginTop:3, flexWrap:"wrap" }}>
            <span style={{ fontSize:7, fontWeight:900, letterSpacing:"0.2em", color:"rgba(255,255,255,0.6)" }}>ISSUE #{issue.issueNumber}</span>
            <span style={{ width:1, height:8, background:"rgba(255,255,255,0.3)" }} />
            <span style={{ fontSize:7, fontWeight:700, letterSpacing:"0.15em", color:"#FFD700" }}>{activeGenre.toUpperCase()} EDITION</span>
          </div>
        </div>

        {/* "HIP HOP GENRE BATTLE!" side label */}
        <div key={`genre-label-${genreIndex}`} aria-hidden style={{
          position:"absolute", left:8, top:"28%",
          background:"#FFD700", color:"#1C0A3E",
          fontWeight:900, fontSize:9, letterSpacing:"0.12em",
          padding:"5px 10px",
          transform:"rotate(-90deg) translateX(-50%)",
          transformOrigin:"left center",
          whiteSpace:"nowrap",
          zIndex:15, pointerEvents:"none",
          boxShadow:"2px 2px 0 #7C3AED",
          animation: genreFlash ? "tmiLabelIn 0.5s ease-in both" : "none",
        }}>
          {activeGenre.toUpperCase()} GENRE BATTLE!
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1fr) auto minmax(0,1fr)", gap:8, alignItems:"center", width:"100%", maxWidth:1220, margin:"0 auto" }}>
          <CollagePanels side="left" artists={artists} palette={palette} positionFlags={POSITION_FLAGS} />

          {/* Orbit ring container */}
          <div className="tmi-orbit-wrap" style={{ position:"relative" }}>

          {/* CYPHER ARENA OPEN badge — bottom-left of orbit */}
          <div style={{
            position:"absolute", left:-8, bottom:"18%",
            zIndex:20, pointerEvents:"none",
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
            width:74, height:74, borderRadius:"50%",
            background:"radial-gradient(circle,#2D1A00,#1C0A00)",
            border:"3px solid #FFD700",
            boxShadow:"0 0 0 3px #7C3AED, 0 0 16px rgba(255,215,0,0.4)",
            animation:"tmiBadgePulse 2s ease-in-out infinite",
            textAlign:"center",
          }}>
            <div style={{ fontSize:7, fontWeight:900, letterSpacing:"0.1em", color:"#FFD700", lineHeight:1.1 }}>CYPHER</div>
            <div style={{ fontSize:7, fontWeight:900, letterSpacing:"0.1em", color:"#FFD700", lineHeight:1.1 }}>ARENA</div>
            <div style={{ marginTop:3, padding:"1px 8px", background:"#FFD700", borderRadius:8, fontSize:6, fontWeight:900, color:"#1C0A00", letterSpacing:"0.12em" }}>OPEN</div>
          </div>

          {/* "VOTING OPEN: VOTE FOR #4!" — right side of orbit */}
          <div style={{
            position:"absolute", right:-12, top:"42%",
            zIndex:20, pointerEvents:"none",
            fontSize:9, fontWeight:900, color:"#FFD700",
            letterSpacing:"0.08em", whiteSpace:"nowrap",
            transform:"rotate(90deg) translateX(-50%)",
            transformOrigin:"right center",
            animation:"tmiVoteTextGlow 2s ease-in-out infinite",
            textShadow:"0 0 12px #FFD700",
          }}>
            VOTING OPEN: VOTE FOR #{artists[3]?.rank ?? 4}!
          </div>

          {/* "HYPE BOT: ARTIST MOVING UP!" — bottom of orbit */}
          <div style={{
            position:"absolute", bottom:-22, left:"50%", transform:"translateX(-50%)",
            zIndex:20, pointerEvents:"none",
            background:"rgba(0,0,0,0.6)",
            border:"1px solid rgba(255,215,0,0.5)",
            borderRadius:4, padding:"3px 12px",
            fontSize:8, fontWeight:900, color:"#FFD700",
            letterSpacing:"0.1em", whiteSpace:"nowrap",
            animation:"tmiHypeBotSlide 0.6s cubic-bezier(.16,1,.3,1) both",
          }}>
            🤖 HYPE BOT: {artists[risingIdx]?.name ?? "ARTIST"} MOVING UP!
          </div>
          <div style={{ position:"relative", width:RING_SIZE, height:RING_SIZE }}>

            {/* Glow rings */}
            <div aria-hidden style={{ position:"absolute", inset:0,  borderRadius:"50%", border:`2px solid ${palette.primary}99`, animation:"tmiRingGlow 3s ease-in-out infinite" }} />
            <div aria-hidden style={{ position:"absolute", inset:28, borderRadius:"50%", border:`1.5px solid ${palette.secondary}66`,  animation:"tmiRingGlow 3s ease-in-out infinite", animationDelay:"1.5s" }} />
            <div aria-hidden style={{ position:"absolute", inset:58, borderRadius:"50%", border:`0.5px solid ${palette.primary}12` }} />

            {/* Center label */}
            <div style={{ position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)", textAlign:"center", pointerEvents:"none" }}>
              <div style={{ fontSize:11, fontWeight:900, letterSpacing:"0.3em", color:palette.primary, opacity:0.7 }}>INDEX</div>
              <div style={{ fontSize:8,  fontWeight:700, letterSpacing:"0.2em", color:"rgba(255,255,255,0.25)", marginTop:2 }}>TOP 9</div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4, marginTop:6 }}>
                <span style={{ width:5, height:5, borderRadius:"50%", background:"#00FF88", boxShadow:"0 0 6px #00FF88", display:"inline-block", animation:"tmiRingGlow 1.8s ease-in-out infinite" }} />
                <span style={{ fontSize:7, fontWeight:900, letterSpacing:"0.15em", color:"#00FF88", opacity:0.85 }}>LIVE</span>
              </div>
              <div style={{ fontSize:7, fontWeight:700, letterSpacing:"0.1em", color:"rgba(255,255,255,0.18)", marginTop:3 }}>
                {fansOnline.toLocaleString()} watching
              </div>
              <div style={{ marginTop:8, width:1, height:14, background:`${palette.primary}30`, margin:"8px auto 0" }} />
              <div style={{ fontSize:9, fontWeight:900, letterSpacing:"0.05em", color:palette.primary, marginTop:5, opacity:0.9 }}>
                👑 {crownArtist.name}
              </div>
              <div style={{ fontSize:6, fontWeight:900, letterSpacing:"0.15em", color:"rgba(255,255,255,0.22)", marginTop:2, textTransform:"uppercase" }}>
                {activeGenre}
              </div>
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
                const liveDelta  = liveDeltas[artist.name] ?? artist.delta;
                const deltaColor = liveDelta > 0 ? "#00FF88" : liveDelta < 0 ? "#FF4444" : "rgba(255,255,255,0.3)";
                const liveScore  = liveScores[artist.name] ?? artist.score;
                const isFlashing = flashedCards.has(artist.name);
                return (
                  <div key={artist.name} className="tmi-card-inner" style={{
                    position:"absolute", left:pos.left, top:pos.top,
                    width:CARD_W, height:CARD_H,
                    animationName: orbitCW ? "tmiCounterCW" : "tmiCounterCCW",
                    animationDuration:`${ORBIT_DURATION}s`,
                    willChange:"transform", cursor:"pointer",
                    zIndex: interruptIdx === i ? 200 : undefined,
                  }}>
                    <Link href="/rankings" style={{ textDecoration:"none", display:"block", width:"100%", height:"100%" }}>
                    <div style={{ width:"100%", height:"100%", transform: interruptIdx === i ? "scale(1.52)" : "scale(1)", opacity: interruptIdx !== null && interruptIdx !== i ? 0.14 : 1, transition:"transform 0.2s cubic-bezier(0.7,0,0.3,1),opacity 0.2s ease" }}>
                    <div style={{
                      width:"100%", height:"100%", borderRadius:0,
                      clipPath: CARD_CLIPS[i] ?? CARD_CLIPS[0],
                      background: isFirst
                        ? `linear-gradient(135deg,${palette.primary}4f,${palette.secondary}38), repeating-linear-gradient(0deg, rgba(255,255,255,0.08), rgba(255,255,255,0.08) 1px, transparent 1px, transparent 5px)`
                        : `linear-gradient(135deg,${ap.primary}28,${ap.secondary}18), repeating-linear-gradient(0deg, rgba(255,255,255,0.06), rgba(255,255,255,0.06) 1px, transparent 1px, transparent 6px)`,
                      border:`1.5px solid ${isFirst ? palette.primary+"ee" : ap.primary+"99"}`,
                      boxShadow: isFirst
                        ? `0 0 36px ${palette.primary}66,inset 0 0 20px ${palette.primary}14, 0 16px 24px rgba(0,0,0,0.38)`
                        : (punchCard === i ? `0 0 36px ${ap.primary}aa` : `0 0 18px ${ap.primary}38, 0 10px 20px rgba(0,0,0,0.32)`),
                      animation: punchCard === i
                        ? "tmiPunchIn 0.62s cubic-bezier(0.7,0,0.3,1) both"
                        : isFirst
                          ? `tmiPulse 2.5s ease-in-out infinite, tmiCardFloat ${3.4}s ease-in-out infinite, tmiCardGlow ${4.2}s ease-in-out infinite`
                          : `tmiCardFloat ${3.2 + i * 0.38}s ease-in-out ${i * 0.24}s infinite, tmiCardGlow ${4.0 + i * 0.32}s ease-in-out ${i * 0.28}s infinite`,
                      ["--pc" as string]: ap.primary,
                      ["--cg" as string]: isFirst ? palette.primary : ap.primary,
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                      padding:"8px 6px", textAlign:"center", position:"relative", backdropFilter:"blur(6px)",
                    }}>
                      <div style={{ position:"absolute", left:6, top:6, width:16, height:4, background:"rgba(255,255,255,0.35)", transform:"rotate(-26deg)", borderRadius:2, opacity:0.7 }} />
                      <div style={{ position:"absolute", right:6, top:6, width:16, height:4, background:"rgba(255,255,255,0.28)", transform:"rotate(20deg)", borderRadius:2, opacity:0.7 }} />
                      {/* Prominent rank badge — outside card top-left */}
                      <div style={{
                        position:"absolute", top:-10, left:-10,
                        width:26, height:26, borderRadius:"50%",
                        background: isFirst ? "#FFD700" : "rgba(0,0,0,0.85)",
                        border:`2px solid ${isFirst ? "#FFD700" : ap.primary}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:8, fontWeight:900,
                        color: isFirst ? "#000" : ap.primary,
                        boxShadow: isFirst ? "0 0 12px rgba(255,215,0,0.7)" : `0 0 6px ${ap.primary}44`,
                        zIndex:10, letterSpacing:0,
                      }}>
                        {artist.rank}
                      </div>

                      {/* Country flag */}
                      <div style={{
                        position:"absolute", bottom:6, right:6,
                        fontSize:10, lineHeight:1,
                        filter:"drop-shadow(0 1px 3px rgba(0,0,0,0.9))",
                        zIndex:5,
                      }}>
                        {POSITION_FLAGS[i]}
                      </div>

                      {isFirst && (
                        <div style={{ position:"absolute", top:-20, fontSize:20, animation:"tmiCrownFloat 2.8s ease-in-out infinite", filter:`drop-shadow(0 0 8px ${palette.primary})` }}>
                          👑
                        </div>
                      )}

                      {isFirst && (
                        <div style={{
                          position:"absolute",
                          right:-10,
                          bottom:18,
                          background:"#FFD700",
                          color:"#050510",
                          border:"1px solid rgba(0,0,0,0.45)",
                          padding:"2px 7px",
                          fontSize:7,
                          fontWeight:900,
                          letterSpacing:"0.1em",
                          transform:"rotate(-14deg)",
                          boxShadow:"0 2px 8px rgba(0,0,0,0.4)",
                        }}>
                          COVER STAR
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
                        <span style={{ fontSize:8, color:"rgba(255,255,255,0.4)", fontWeight:700, animation: isFlashing ? "tmiScoreFlash 0.7s ease-out both" : "none" }}>{liveScore.toLocaleString()}</span>
                        <span style={{ fontSize:8, color:deltaColor, fontWeight:900 }}>{liveDelta > 0 ? `+${liveDelta}` : liveDelta}</span>
                      </div>

                      <div style={{ marginTop:5, padding:"2px 8px", fontSize:6, fontWeight:900, letterSpacing:"0.12em", border:`1px solid ${ap.primary}44`, borderRadius:20, color:ap.primary, textTransform:"uppercase" }}>
                        {artist.genre}
                      </div>
                    </div>
                    </div>
                    </Link>
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

          <CollagePanels side="right" artists={artists} palette={palette} positionFlags={POSITION_FLAGS} />
        </div>
      </div>

        {/* Genre progress dots */}
        <div style={{ marginTop:14, display:"flex", gap:5, alignItems:"center", flexWrap:"wrap", justifyContent:"center" }}>
          {TMI_GENRES.map((g, i) => (
            <button key={g} onClick={() => jumpToGenre(i)} title={g} aria-label={`Switch to ${g}`} style={{ width: i === genreIndex ? 22 : 6, height:6, borderRadius:0, clipPath:"polygon(2px 0,100% 0,calc(100% - 2px) 100%,0 100%)", background: i === genreIndex ? palette.primary : "rgba(255,255,255,0.12)", transition:"width 0.4s cubic-bezier(0.7,0,0.3,1),background 0.6s ease", border:"none", padding:0, cursor:"pointer" }} />
          ))}
        </div>

        {/* Genre quick-jump tabs */}
        <div style={{ display:"flex", gap:4, marginTop:8, overflowX:"auto", scrollbarWidth:"none", maxWidth:680, padding:"0 2px", justifyContent:"center", flexWrap:"wrap" }}>
          {TMI_GENRES.map((g, i) => (
            <button
              key={g}
              onClick={() => jumpToGenre(i)}
              style={{
                padding:"3px 9px", flexShrink:0,
                background: i === genreIndex ? `${palette.primary}20` : "rgba(255,255,255,0.02)",
                border:`1px solid ${i === genreIndex ? palette.primary+"88" : "rgba(255,255,255,0.08)"}`,
                color: i === genreIndex ? palette.primary : "rgba(255,255,255,0.28)",
                fontSize:6, fontWeight:900, letterSpacing:"0.12em",
                cursor:"pointer", textTransform:"uppercase",
                clipPath:"polygon(3px 0,100% 0,calc(100% - 3px) 100%,0 100%)",
                transition:"all 0.3s cubic-bezier(0.7,0,0.3,1)",
              }}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Rising contenders strip */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10, overflow:"hidden", width:"100%", maxWidth:680 }}>
          <span style={{ fontSize:7, fontWeight:900, letterSpacing:"0.2em", color:palette.secondary, flexShrink:0, opacity:0.7 }}>RISING —</span>
          <div style={{ display:"flex", gap:5, overflowX:"auto", scrollbarWidth:"none" }}>
            {GENRE_ARTISTS[TMI_GENRES[risingIdx % TMI_GENRES.length]!]!.slice(3, 8).map((a, idx) => {
              const ap = GENRE_PALETTE[a.genre];
              return (
                <div key={`${a.name}-${idx}`} style={{ display:"flex", alignItems:"center", gap:4, padding:"3px 9px", flexShrink:0, background:`${ap.primary}10`, border:`1px solid ${ap.primary}30`, clipPath:"polygon(3px 0,100% 0,calc(100% - 3px) 100%,0 100%)" }}>
                  <span style={{ fontSize:8, fontWeight:900, color:ap.primary }}>{a.name}</span>
                  <span style={{ fontSize:7, color:a.delta > 0 ? "#00FF88" : "#FF4444", fontWeight:800 }}>{a.delta > 0 ? `▲${a.delta}` : `▼${Math.abs(a.delta)}`}</span>
                </div>
              );
            })}
          </div>
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
            const isHovered = hoveredCard === artist.name;
            return (
              <Link key={artist.name} href="/rankings" style={{ textDecoration:"none" }}>
                <div
                  onMouseEnter={() => setHoveredCard(artist.name)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    height:"100%",
                    background: isHovered ? `${ap.primary}14` : "rgba(255,255,255,0.03)",
                    border:`1px solid ${isHovered ? ap.primary+"77" : ap.primary+"33"}`,
                    clipPath: CARD_CLIPS[(i + 1) % CARD_CLIPS.length],
                    padding:"7px 6px",
                    display:"flex", flexDirection:"column",
                    animation:`tmiBillboardIn 0.4s ${i * 0.04}s cubic-bezier(0.7,0,0.3,1) both`,
                    cursor:"pointer", position:"relative", overflow:"hidden",
                    transition:"background 0.25s cubic-bezier(0.7,0,0.3,1),border-color 0.25s ease",
                    boxShadow: isHovered ? `0 0 14px ${ap.primary}33` : "none",
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
                  <div style={{ fontSize:8, fontWeight:900, color: isHovered ? "#fff" : "rgba(255,255,255,0.85)", lineHeight:1.2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
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

      {/* ── Battle headline rotor ──────────────────────────────────── */}
      <section style={{
        borderTop:`1px solid ${palette.primary}22`,
        borderBottom:`1px solid ${palette.secondary}22`,
        background:"rgba(0,0,0,0.58)",
        padding:"8px 0",
        position:"relative",
        zIndex:14,
        overflow:"hidden",
      }}>
        <div style={{
          display:"flex",
          whiteSpace:"nowrap",
          animation:"tmiHeadlineBelt 34s linear infinite",
          willChange:"transform",
        }}>
          {[0, 1].map((rep) => (
            <div key={rep} style={{ display:"inline-flex", alignItems:"center" }}>
              {BATTLE_HEADLINES.map((headline, idx) => (
                <div key={`${rep}-${idx}`} style={{ display:"inline-flex", alignItems:"center", gap:8, paddingLeft:24 }}>
                  <span style={{ fontSize:8, fontWeight:900, letterSpacing:"0.13em", color: idx % 2 === 0 ? "#FFD700" : "#00FFFF" }}>
                    {headline}
                  </span>
                  <span style={{ fontSize:8, color:"rgba(255,255,255,0.35)" }}>◆</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Live room preview minis ────────────────────────────────── */}
      <section style={{
        borderTop:`1px solid ${palette.primary}18`,
        background:"rgba(5,5,16,0.72)",
        padding:"10px 12px",
        display:"grid",
        gridTemplateColumns:"repeat(3, minmax(0,1fr))",
        gap:8,
        position:"relative",
        zIndex:14,
      }}>
        {LIVE_ROOM_PREVIEWS.map((room) => (
          <Link key={room.label} href={room.href} style={{ textDecoration:"none" }}>
            <div style={{
              position:"relative",
              minHeight:66,
              border:`1px solid ${room.accent}55`,
              background:`linear-gradient(145deg, ${room.accent}1f, rgba(0,0,0,0.45))`,
              clipPath:"polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,9px 100%,0 calc(100% - 9px))",
              padding:"8px 9px",
              boxShadow:"0 8px 16px rgba(0,0,0,0.32)",
            }}>
              <div style={{ position:"absolute", right:6, top:6, fontSize:7, fontWeight:900, color:room.accent, letterSpacing:"0.12em" }}>LIVE</div>
              <div style={{ fontSize:7, letterSpacing:"0.16em", color:"rgba(255,255,255,0.45)", fontWeight:900, marginBottom:6 }}>ROOM PREVIEW</div>
              <div style={{ fontSize:10, fontWeight:800, color:"#fff" }}>{room.label}</div>
              <div style={{ marginTop:7, fontSize:8, color:room.accent, fontWeight:900, letterSpacing:"0.08em" }}>ENTER FEED →</div>
            </div>
          </Link>
        ))}
      </section>

      {/* ── Tonight's Lineup ────────────────────────────────────────── */}
      <section style={{
        borderTop:`1px solid ${palette.primary}22`,
        background:"rgba(0,0,0,0.55)",
        backdropFilter:"blur(12px)",
        padding:"12px 14px 10px",
        position:"relative", zIndex:10,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <div style={{ fontSize:8, fontWeight:900, letterSpacing:"0.28em", color:palette.primary, opacity:0.9 }}>TONIGHT'S LINEUP</div>
          <div style={{ height:1, flex:1, background:`linear-gradient(90deg,${palette.primary}44,transparent)` }} />
          <Link href="/live/rooms" style={{ fontSize:7, fontWeight:800, color:"rgba(255,255,255,0.3)", textDecoration:"none", letterSpacing:"0.12em" }}>ALL EVENTS →</Link>
        </div>
        <div style={{ display:"flex", gap:8, overflowX:"auto", scrollbarWidth:"none" }}>
          {TONIGHT_EVENTS.map(ev => (
            <Link key={ev.title} href={ev.href} style={{ textDecoration:"none", flexShrink:0 }}>
              <div style={{ padding:"10px 14px", minWidth:158, background:`${ev.color}0a`, border:`1px solid ${ev.color}33`, clipPath:"polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))", transition:"background 0.2s" }}>
                <div style={{ fontSize:9, fontWeight:900, color:ev.color, letterSpacing:"0.12em", marginBottom:3 }}>{ev.time}</div>
                <div style={{ fontSize:11, fontWeight:800, color:"#fff", lineHeight:1.2, marginBottom:3 }}>{ev.title}</div>
                <div style={{ fontSize:8, color:"rgba(255,255,255,0.35)", letterSpacing:"0.08em" }}>{ev.format}</div>
              </div>
            </Link>
          ))}
          <Link href="/hub/performer" style={{ textDecoration:"none", flexShrink:0 }}>
            <div style={{ padding:"10px 14px", minWidth:110, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)", clipPath:"polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4, height:"100%" }}>
              <span style={{ fontSize:18 }}>＋</span>
              <span style={{ fontSize:8, fontWeight:900, color:"rgba(255,255,255,0.3)", letterSpacing:"0.12em" }}>HOST EVENT</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── CTA join strip ──────────────────────────────────────────── */}
      <section style={{
        borderTop:`1px solid ${palette.primary}15`,
        padding:"10px 14px",
        background:`linear-gradient(90deg,${palette.primary}07,${palette.secondary}04,${palette.primary}07)`,
        display:"flex", gap:8, justifyContent:"center", alignItems:"center", flexWrap:"wrap",
        position:"relative", zIndex:10,
      }}>
        <Link href="/signup?role=artist" style={{ textDecoration:"none" }}>
          <button style={{ padding:"7px 18px", background:`${palette.primary}18`, border:`1.5px solid ${palette.primary}66`, borderRadius:0, clipPath:"polygon(5px 0,100% 0,calc(100% - 5px) 100%,0 100%)", color:palette.primary, fontWeight:900, fontSize:9, letterSpacing:"0.1em", cursor:"pointer" }}>🎤 JOIN AS ARTIST</button>
        </Link>
        <Link href="/battles" style={{ textDecoration:"none" }}>
          <button style={{ padding:"7px 18px", background:"rgba(255,45,170,0.1)", border:"1.5px solid rgba(255,45,170,0.45)", borderRadius:0, clipPath:"polygon(5px 0,100% 0,calc(100% - 5px) 100%,0 100%)", color:"#FF2DAA", fontWeight:900, fontSize:9, letterSpacing:"0.1em", cursor:"pointer" }}>⚔️ BATTLE TONIGHT</button>
        </Link>
        <Link href="/magazine" style={{ textDecoration:"none" }}>
          <button style={{ padding:"7px 18px", background:"rgba(255,215,0,0.07)", border:"1.5px solid rgba(255,215,0,0.38)", borderRadius:0, clipPath:"polygon(5px 0,100% 0,calc(100% - 5px) 100%,0 100%)", color:"#FFD700", fontWeight:900, fontSize:9, letterSpacing:"0.1em", cursor:"pointer" }}>📰 READ THE INDEX</button>
        </Link>
        <Link href="/signup?role=fan" style={{ textDecoration:"none" }}>
          <button style={{ padding:"7px 18px", background:"rgba(0,255,136,0.07)", border:"1.5px solid rgba(0,255,136,0.32)", borderRadius:0, clipPath:"polygon(5px 0,100% 0,calc(100% - 5px) 100%,0 100%)", color:"#00FF88", fontWeight:900, fontSize:9, letterSpacing:"0.1em", cursor:"pointer" }}>✦ FAN MODE</button>
        </Link>
      </section>

      {/* ── Social proof bar ────────────────────────────────────────── */}
      <div style={{
        borderTop:`1px solid rgba(255,255,255,0.04)`,
        padding:"6px 14px",
        background:"rgba(0,0,0,0.5)",
        display:"flex", gap:12, justifyContent:"center", alignItems:"center", flexWrap:"wrap",
        position:"relative", zIndex:10,
      }}>
        <span style={{ fontSize:7, fontWeight:900, letterSpacing:"0.18em", color:"rgba(255,255,255,0.22)" }}>247 VOTES THIS WEEK</span>
        <span style={{ fontSize:7, color:"rgba(255,255,255,0.08)" }}>◆</span>
        <span style={{ fontSize:7, fontWeight:900, letterSpacing:"0.18em", color:"rgba(255,255,255,0.22)" }}>18 BATTLES FOUGHT</span>
        <span style={{ fontSize:7, color:"rgba(255,255,255,0.08)" }}>◆</span>
        <span style={{ fontSize:7, fontWeight:900, letterSpacing:"0.18em", color:"rgba(255,255,255,0.22)" }}>3 NEW ARTISTS INDEXED</span>
        {liveSponsorCount > 0 && <>
          <span style={{ fontSize:7, color:"rgba(255,255,255,0.08)" }}>◆</span>
          <span style={{ fontSize:7, fontWeight:900, letterSpacing:"0.18em", color:"#FFD700" }}>{liveSponsorCount} ACTIVE SPONSORS</span>
        </>}
        <span style={{ fontSize:7, color:"rgba(255,255,255,0.08)" }}>◆</span>
        <Link href="/rankings" style={{ fontSize:7, fontWeight:900, letterSpacing:"0.15em", color:palette.primary, textDecoration:"none", opacity:0.7 }}>VIEW THE INDEX →</Link>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          WEEKLY CYPHERS BOTTOM BANNER — matches reference
      ══════════════════════════════════════════════════════════════ */}
      <div style={{
        background:"#3B0764",
        borderTop:"4px solid #6D28D9",
        borderBottom:"3px solid #FFD700",
        padding:"14px 20px 16px",
        textAlign:"center",
        position:"relative",
        zIndex:20,
        flexShrink:0,
        overflow:"hidden",
        animation:"tmiWeeklyCyphersIn 0.8s cubic-bezier(.16,1,.3,1) both",
      }}>
        {/* Lightning bolts left + right */}
        <span aria-hidden style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:22, color:"#FFD700", filter:"drop-shadow(0 0 8px #FFD700)", animation:"tmiLightningFlash 1.8s ease-in-out infinite" }}>⚡</span>
        <span aria-hidden style={{ position:"absolute", left:38, top:"50%", transform:"translateY(-50%)", fontSize:16, color:"#FFD700", filter:"drop-shadow(0 0 6px #FFD700)", animation:"tmiLightningFlash 1.8s ease-in-out infinite 0.3s" }}>⚡</span>
        <span aria-hidden style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontSize:22, color:"#FFD700", filter:"drop-shadow(0 0 8px #FFD700)", animation:"tmiLightningFlash 1.8s ease-in-out infinite 0.6s" }}>⚡</span>
        <span aria-hidden style={{ position:"absolute", right:38, top:"50%", transform:"translateY(-50%)", fontSize:16, color:"#FFD700", filter:"drop-shadow(0 0 6px #FFD700)", animation:"tmiLightningFlash 1.8s ease-in-out infinite 0.9s" }}>⚡</span>
        <Link href="/battles/weekly-cypher" style={{ textDecoration:"none" }}>
          <div style={{
            fontFamily:"var(--font-tmi-editorial,'Playfair Display',Georgia,serif)",
            fontSize:"clamp(22px,5vw,36px)", fontWeight:900,
            color:"#FFD700", letterSpacing:"0.04em",
            fontStyle:"italic",
            textShadow:"0 0 24px rgba(255,215,0,0.5), 2px 2px 0 rgba(0,0,0,0.4)",
            lineHeight:1.1,
          }}>
            Weekly Cyphers!
          </div>
          <div style={{
            fontSize:"clamp(11px,2.5vw,17px)", fontWeight:900,
            color:"#FFD700", letterSpacing:"0.1em",
            textTransform:"uppercase", marginTop:3,
            textShadow:"1px 1px 0 rgba(0,0,0,0.5)",
          }}>
            Who took the crown this week?
          </div>
        </Link>
      </div>

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

      {/* ── Starburst burst confetti ────────────────────────────────── */}
      {burstPieces.map(piece => (
        <div key={piece.id} aria-hidden style={{
          position:"fixed", left:"50%", top:"42%",
          width:9, height:9, borderRadius:1,
          background:piece.color,
          boxShadow:`0 0 6px ${piece.color}`,
          animation:"tmiConfettiBurst 1.2s cubic-bezier(.16,1,.3,1) forwards",
          ["--bx" as string]: `${piece.bx}px`,
          ["--by" as string]: `${piece.by}px`,
          pointerEvents:"none", zIndex:502, marginLeft:-4, marginTop:-4,
        }} />
      ))}

      {/* ── Human burst layer — foreground presence faces ─────────── */}
      {burstFaces && [
        { x:"9%",  y:"54%", color:"#FF2DAA", emoji:"🎤", label:"LET'S GO!",   rotate:-8, delay:"0s",    size:94 },
        { x:"76%", y:"38%", color:"#00FFFF", emoji:"🎵", label:"IN THE MIX",  rotate:6,  delay:"0.28s", size:84 },
        { x:"80%", y:"66%", color:"#FFD700", emoji:"👑", label:"CROWN WATCH", rotate:-5, delay:"0.54s", size:74 },
      ].map((face, i) => (
        <div key={`face-${i}`} aria-hidden style={{
          position:"fixed", left:face.x, top:face.y,
          zIndex:28, pointerEvents:"none",
          animation:`tmiFacePop 0.72s cubic-bezier(.16,1,.3,1) ${face.delay} both`,
          ["--fr" as string]: `${face.rotate}deg`,
        }}>
          <div style={{
            width:face.size, height:face.size, borderRadius:"50%",
            background:`radial-gradient(circle at 38% 38%, ${face.color}2e, rgba(0,0,0,0.78))`,
            border:`3px solid ${face.color}`,
            boxShadow:`0 0 28px ${face.color}55, 0 0 56px ${face.color}18`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:Math.round(face.size * 0.38),
            animation:`tmiFaceBreath ${3.8 + i * 0.55}s ease-in-out infinite`,
            ["--fr" as string]: `${face.rotate}deg`,
          }}>
            {face.emoji}
          </div>
          <div style={{ textAlign:"center", fontSize:6, fontWeight:900, letterSpacing:"0.14em", color:face.color, textShadow:`0 0 10px ${face.color}`, marginTop:4, whiteSpace:"nowrap" }}>
            {face.label}
          </div>
        </div>
      ))}

      {/* ── First 3-second crown changed event ──────────────────────── */}
      {crownFlash && (
        <div aria-hidden style={{
          position:"fixed", left:"50%", top:"36%",
          zIndex:450, pointerEvents:"none",
          animation:"tmiCrownChangedFlash 2.2s cubic-bezier(.16,1,.3,1) forwards",
        }}>
          <div style={{
            background:"rgba(22,8,50,0.97)",
            border:"2px solid #FFD700",
            boxShadow:"0 0 48px rgba(255,215,0,0.55), 0 0 100px rgba(255,215,0,0.2)",
            padding:"14px 30px",
            clipPath:"polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
            textAlign:"center", minWidth:200,
          }}>
            <div style={{ fontSize:30, marginBottom:8 }}>👑</div>
            <div style={{ fontSize:13, fontWeight:900, letterSpacing:"0.18em", color:"#FFD700", textTransform:"uppercase" }}>
              CROWN CHANGED
            </div>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.65)", marginTop:5, letterSpacing:"0.06em" }}>
              {crownArtist.name} · {activeGenre}
            </div>
          </div>
        </div>
      )}

      {/* ── Global scanline overlay ─────────────────────────────────── */}
      <div aria-hidden style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:202, backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px)", backgroundSize:"100% 4px" }} />

      {/* ── Radial light leak overlay ───────────────────────────────── */}
      <div aria-hidden style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:203, background:`radial-gradient(ellipse at 0% 50%,${palette.primary}07 0%,transparent 40%),radial-gradient(ellipse at 100% 50%,${palette.secondary}05 0%,transparent 40%)`, transition:"background 1.2s ease" }} />

    </div>
  );
}
