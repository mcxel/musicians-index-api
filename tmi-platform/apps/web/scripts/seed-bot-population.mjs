#!/usr/bin/env node
/**
 * seed-bot-population.mjs
 * Seeds 115 synthetic bot accounts across all TMI roles.
 *
 * Distribution:
 *   50  fans          (general audience)
 *   20  artists       (30–40% streaming, 25–30% social)
 *   15  performers    (live-show focused)
 *   10  sponsors      (10–15% marketplace, passive)
 *   10  advertisers   (campaign-builder focused)
 *    5  hosts         (Monday stage, contests, game shows)
 *    5  admin/mod     (enforcement, fallback detection)
 *
 * Output: writes to src/lib/bots/botPopulation.generated.json
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "../src/lib/bots");
const OUT_FILE = join(OUT_DIR, "botPopulation.generated.json");

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = (prefix, n) => `${prefix}-${String(n).padStart(3, "0")}`;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pct = (lo, hi) => Math.round(lo + Math.random() * (hi - lo));

const FAN_NAMES = [
  "Aria M","Dex K","Kira J","Leo B","Oryn T","Vex S","Zael W","Pyre L",
  "Nyx C","Coda F","Remi D","Silo P","Tane H","Ula V","Wave R","Xen A",
  "Yara G","Zion Q","Fen O","Glow I","Haze U","Idra N","Jolt E","Keel Y",
  "Luma Z","Mach X","Nara B","Opal M","Pike K","Quin J","Rave T","Swirl S",
  "Tide W","Una L","Vane C","Wisp F","Xyla D","Yule P","Zest H","Aero V",
  "Blaze R","Crest A","Drift G","Edge Q","Flux E","Gust Y","Halo Z","Iris B",
  "Jade M","Koi K",
];

const ARTIST_NAMES = [
  "Nova Kane","Ari Volt","Rhyme Lane","Echo Vee","Lex Royal",
  "Kato Drift","Juno Arc","Pulse Ray","Vera Cross","Dex Milo",
  "Mox Fire","Rina Sky","Levi Tone","Axel Boom","Cleo Verse",
  "Sand Trap","Neon Fist","Vibe Rez","Haze Lord","Drift Wave",
];

const PERFORMER_NAMES = [
  "Step One","Flex T","Cypher K","Break Ray","Pop Lock D",
  "Groove V","Drift C","Wave Rider","Spin Mox","Flow State",
  "Bounce L","Slide P","Turn Q","Glide S","Snap W",
];

const SPONSOR_NAMES = [
  "SoundWave Audio","BeatBox Pro","Urban Pulse Records","Crown Energy",
  "Mic Drop Media","Wave Label","Studio X","Neon Ink","Bass Forge","Loop Corp",
];

const ADV_NAMES = [
  "AdPulse Co","Reach Media","Click Surge","Impression Lab","Spot Brand",
  "Target Arc","Promo Flux","BrandDrift","Campaign Pro","VibeSell",
];

const HOST_NAMES = ["Tiara","Michael Gregory","Gregory Marcel","Ray Journey","Finny Maxwell"];

const ADMIN_NAMES = [
  "Mod-Alpha","Mod-Beta","Sentinel-1","Sentinel-2","Admin-Root",
];

const GENRES = ["Hip Hop","R&B","EDM","Pop","Afrobeats","Latin","Drill","Gospel","Soul","Neo-Soul"];
const ACTIVITY_LEVELS = ["low","medium","high","very-high"];

const HOME_SURFACES = [
  "/home/1","/home/2","/home/3","/home/4","/home/5",
  "/home/6","/home/7","/home/8","/home/9","/home/10",
];

// ─── Factory functions ────────────────────────────────────────────────────────
function makeFan(n, name) {
  const streamPct  = pct(30, 45);
  const socialPct  = pct(20, 30);
  const browsePct  = pct(10, 20);
  const passivePct = 100 - streamPct - socialPct - browsePct;
  return {
    id: uid("fan", n),
    displayName: name,
    role: "fan",
    personaType: pick(["superfan","casual","newcomer","hype-follower","chart-watcher"]),
    activityLevel: pick(ACTIVITY_LEVELS),
    goals: ["vote","watch-streams","earn-rewards","follow-artists"],
    homeSurface: pick(HOME_SURFACES),
    favoriteGenre: pick(GENRES),
    allowedActions: ["vote","react","tip","join-room","claim-reward","browse-charts"],
    timeAllocation: {
      streaming: streamPct,
      socialEngagement: socialPct,
      browsing: browsePct,
      passive: Math.max(0, passivePct),
    },
    styleProfile: { vibe: pick(["hype","chill","analytical","loyal"]) },
    status: "ACTIVE",
  };
}

function makeArtist(n, name) {
  const streamPct  = pct(30, 40);
  const socialPct  = pct(25, 30);
  const mktPct     = pct(10, 15);
  const passivePct = 100 - streamPct - socialPct - mktPct;
  return {
    id: uid("artist", n),
    displayName: name,
    role: "artist",
    personaType: pick(["emerging","underground","mainstream-contender","legacy","digital-native"]),
    activityLevel: pick(ACTIVITY_LEVELS),
    goals: ["climb-top10","release-music","earn-crown","collaborate"],
    homeSurface: pick(["/home/6","/home/7","/home/9","/home/12"]),
    genre: pick(GENRES),
    allowedActions: ["post-track","go-live","enter-cypher","join-battle","sponsor-deal","accept-booking"],
    timeAllocation: {
      streaming: streamPct,
      socialEngagement: socialPct,
      marketplace: mktPct,
      passive: Math.max(0, passivePct),
    },
    streamingProfile: {
      avgSessionLength: pct(20, 90),
      peakHours: pick(["evening","late-night","weekend-afternoon"]),
    },
    status: "ACTIVE",
  };
}

function makePerformer(n, name) {
  return {
    id: uid("performer", n),
    displayName: name,
    role: "performer",
    personaType: pick(["dancer","hypeman","vocalist","instrumentalist","visual-artist"]),
    activityLevel: pick(["medium","high","very-high"]),
    goals: ["get-booked","perform-live","gain-followers","win-battle"],
    homeSurface: pick(["/home/3","/home/8","/home/9"]),
    specialty: pick(["choreography","spoken-word","live-improv","beatbox","freestyle"]),
    allowedActions: ["accept-booking","go-live","enter-battle","post-performance-clip"],
    timeAllocation: {
      streaming: pct(40, 60),
      socialEngagement: pct(20, 30),
      marketplace: pct(5, 10),
      passive: pct(10, 20),
    },
    status: "ACTIVE",
  };
}

function makeSponsor(n, name) {
  return {
    id: uid("sponsor", n),
    displayName: name,
    role: "sponsor",
    personaType: pick(["label-sponsor","brand-sponsor","media-sponsor","merch-sponsor"]),
    activityLevel: pick(["low","medium"]),
    goals: ["run-campaign","get-impressions","activate-drops","measure-ctr"],
    homeSurface: "/home/5",
    allowedActions: ["create-campaign","upload-creative","view-analytics","request-placement"],
    timeAllocation: {
      streaming: 0,
      socialEngagement: pct(10, 20),
      marketplace: pct(40, 60),
      passive: pct(25, 40),
    },
    marketingProfile: {
      campaignBudget: pct(500, 10000),
      preferredSlots: pick([["billboard-hero"],["lobby-wall"],["cypher-banner"],["billboard-hero","lobby-wall"]]),
    },
    status: "ACTIVE",
  };
}

function makeAdvertiser(n, name) {
  return {
    id: uid("advertiser", n),
    displayName: name,
    role: "advertiser",
    personaType: pick(["performance-advertiser","brand-awareness","retargeting","event-promoter"]),
    activityLevel: pick(["medium","high"]),
    goals: ["drive-clicks","grow-reach","promote-events","A/B-test-creatives"],
    homeSurface: "/home/5",
    allowedActions: ["create-ad","set-targeting","view-report","pause-campaign","request-slot"],
    timeAllocation: {
      streaming: 0,
      socialEngagement: pct(5, 15),
      marketplace: pct(50, 70),
      passive: pct(20, 35),
    },
    marketingProfile: {
      dailyBudget: pct(50, 2000),
      preferredFormats: pick([["banner"],["video"],["banner","video"]]),
    },
    status: "ACTIVE",
  };
}

function makeHost(n, name) {
  const showMap = {
    "Tiara":           ["monday-night-stage","yearly-contest","crown-reveal"],
    "Michael Gregory": ["battle-of-the-bands"],
    "Gregory Marcel":  ["cypher-arena","dirty-dozens"],
    "Ray Journey":     ["monthly-idol","deal-or-feud"],
    "Finny Maxwell":   ["world-dance-party","name-that-tune","circles-squares"],
  };
  return {
    id: uid("host", n),
    displayName: name,
    role: "host",
    personaType: "professional-host",
    activityLevel: "high",
    goals: ["run-show","engage-crowd","maintain-energy","transition-scenes"],
    homeSurface: "/home/3",
    primaryShows: showMap[name] ?? [],
    allowedActions: ["open-show","call-act","announce-winner","trigger-transition","call-crowd-calm"],
    timeAllocation: {
      streaming: pct(60, 80),
      socialEngagement: pct(15, 25),
      marketplace: 0,
      passive: pct(5, 15),
    },
    scheduleProfile: {
      preferredDays: pick([["monday"],["monday","wednesday"],["thursday","saturday"]]),
      avgShowLength: pct(45, 120),
    },
    status: "ACTIVE",
  };
}

function makeAdmin(n, name) {
  return {
    id: uid("admin", n),
    displayName: name,
    role: name.startsWith("Mod") ? "moderator" : "admin",
    personaType: name.startsWith("Sentinel") ? "sentinel-bot" : "admin-bot",
    activityLevel: "very-high",
    goals: ["enforce-rules","detect-dead-routes","catch-behavior-anomalies","monitor-fallbacks"],
    homeSurface: "/admin/observatory",
    allowedActions: ["ban-user","mute-user","remove-content","escalate","trigger-fallback","patch-route"],
    timeAllocation: {
      streaming: 0,
      socialEngagement: 0,
      monitoring: 70,
      enforcement: 30,
    },
    status: "ACTIVE",
  };
}

// ─── Generate population ──────────────────────────────────────────────────────
const population = [
  ...FAN_NAMES.slice(0, 50).map((name, i) => makeFan(i + 1, name)),
  ...ARTIST_NAMES.map((name, i)    => makeArtist(i + 1, name)),
  ...PERFORMER_NAMES.map((name, i) => makePerformer(i + 1, name)),
  ...SPONSOR_NAMES.map((name, i)   => makeSponsor(i + 1, name)),
  ...ADV_NAMES.map((name, i)       => makeAdvertiser(i + 1, name)),
  ...HOST_NAMES.map((name, i)      => makeHost(i + 1, name)),
  ...ADMIN_NAMES.map((name, i)     => makeAdmin(i + 1, name)),
];

const summary = {
  generated: new Date().toISOString(),
  total: population.length,
  byRole: {
    fan:        population.filter((b) => b.role === "fan").length,
    artist:     population.filter((b) => b.role === "artist").length,
    performer:  population.filter((b) => b.role === "performer").length,
    sponsor:    population.filter((b) => b.role === "sponsor").length,
    advertiser: population.filter((b) => b.role === "advertiser").length,
    host:       population.filter((b) => b.role === "host").length,
    admin:      population.filter((b) => b.role === "admin" || b.role === "moderator").length,
  },
  population,
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify(summary, null, 2), "utf8");
console.log(`✅ Seeded ${population.length} bot accounts → ${OUT_FILE}`);
console.log(`   Fans: ${summary.byRole.fan} | Artists: ${summary.byRole.artist} | Performers: ${summary.byRole.performer}`);
console.log(`   Sponsors: ${summary.byRole.sponsor} | Advertisers: ${summary.byRole.advertiser} | Hosts: ${summary.byRole.host} | Admin: ${summary.byRole.admin}`);
