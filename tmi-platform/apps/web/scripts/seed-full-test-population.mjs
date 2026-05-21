#!/usr/bin/env node
/**
 * seed-full-test-population.mjs
 *
 * Generates a complete TEST-only synthetic world with strict mode tagging:
 * - 60 fans
 * - 60 artists
 * - 60 sponsors
 * - 60 advertisers
 * - 60 venues
 * - 60 performers
 * - 10 mods/admins
 * - 5 hosts
 *
 * Plus rotation-ready ad ecosystem datasets:
 * - 40 sponsor brands
 * - 40 advertiser campaigns
 * - 40 video ads
 */

import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const OUTPUT_DIR = join(root, "src", "lib", "seeds");
const OUTPUT_FILE = join(OUTPUT_DIR, "fullTestPopulation.generated.json");
const DATA_DIR = join(root, "data");
const PUBLIC_SPONSOR_DIR = join(root, "public", "sponsors");
const PUBLIC_ADS_DIR = join(root, "public", "ads");

const TIERS = ["FREE", "PRO", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"];
const ARTIST_ADDONS = ["NONE", "LIVE_PLUS", "PROMO_PLUS", "LABEL_PLUS"];
const ROLE_SURFACES = {
  fan: "/home/2",
  artist: "/home/3",
  performer: "/home/9",
  sponsor: "/home/5",
  advertiser: "/home/5",
  venue: "/venues",
  host: "/home/3",
  admin: "/admin/observatory",
};

const GENRES = ["Hip Hop", "R&B", "Pop", "Electronic", "Rock", "Afrobeat", "Local", "Worldwide", "Global"];
const VENUE_TYPES = ["nightclub", "bar", "living-room", "amphitheater", "festival", "watch-party", "cypher-stage", "game-show-stage", "vip-front-row"];

const SPONSOR_BRANDS_40 = [
  { id: "pulse-audio", name: "Pulse Audio", category: "Audio" },
  { id: "neon-drip", name: "Neon Drip", category: "Fashion" },
  { id: "volt-energy", name: "Volt Energy", category: "Energy" },
  { id: "skyline-tech", name: "Skyline Tech", category: "Tech" },
  { id: "luxora", name: "Luxora", category: "Luxury" },
  { id: "beatforge", name: "BeatForge", category: "Music Gear" },
  { id: "nova-wear", name: "Nova Wear", category: "Streetwear" },
  { id: "hyperfuel", name: "HyperFuel", category: "Energy" },
  { id: "sonicgrid", name: "SonicGrid", category: "Audio" },
  { id: "velourx", name: "VelourX", category: "Luxury" },
  { id: "urbanphase", name: "UrbanPhase", category: "Fashion" },
  { id: "aether-tech", name: "Aether Tech", category: "Tech" },
  { id: "echo-labs", name: "Echo Labs", category: "Audio" },
  { id: "flare-energy", name: "Flare Energy", category: "Energy" },
  { id: "zenwear", name: "ZenWear", category: "Lifestyle" },
  { id: "drift-motors", name: "Drift Motors", category: "Automotive" },
  { id: "halo-beats", name: "Halo Beats", category: "Audio" },
  { id: "fusioncore", name: "FusionCore", category: "Tech" },
  { id: "glowclub", name: "GlowClub", category: "Lifestyle" },
  { id: "primekicks", name: "PrimeKicks", category: "Footwear" },
  { id: "nexusgear", name: "NexusGear", category: "Tech" },
  { id: "urbanvibe", name: "UrbanVibe", category: "Streetwear" },
  { id: "lume-energy", name: "Lume Energy", category: "Energy" },
  { id: "audiolux", name: "AudioLux", category: "Audio" },
  { id: "nextwave", name: "NextWave", category: "Tech" },
  { id: "streetnova", name: "StreetNova", category: "Fashion" },
  { id: "hyperbeats", name: "HyperBeats", category: "Audio" },
  { id: "zenithwear", name: "ZenithWear", category: "Fashion" },
  { id: "voltgear", name: "VoltGear", category: "Tech" },
  { id: "aura-labs", name: "Aura Labs", category: "Tech" },
  { id: "pulsefit", name: "PulseFit", category: "Fitness" },
  { id: "nightcore", name: "NightCore", category: "Audio" },
  { id: "echo-street", name: "Echo Street", category: "Streetwear" },
  { id: "nova-auto", name: "Nova Auto", category: "Automotive" },
  { id: "luxbeats", name: "LuxBeats", category: "Audio" },
  { id: "aetherwear", name: "AetherWear", category: "Fashion" },
  { id: "vortex-energy", name: "Vortex Energy", category: "Energy" },
  { id: "gridtech", name: "GridTech", category: "Tech" },
  { id: "urbanhalo", name: "UrbanHalo", category: "Lifestyle" },
  { id: "primeaudio", name: "PrimeAudio", category: "Audio" },
];

function id(prefix, n) {
  return `${prefix}-${String(n).padStart(3, "0")}`;
}

function pick(arr, i) {
  return arr[i % arr.length];
}

function artistImage(i) {
  const slot = (i % 10) + 1;
  const ext = slot <= 4 ? "png" : "jpg";
  return `/artists/artist-${String(slot).padStart(2, "0")}.${ext}`;
}

function baseWallet(i, scale = 1) {
  return {
    cash: 0,
    points: 0,
    testCash: 5000 * scale + i * 35,
    testPoints: 9000 * scale + i * 55,
  };
}

function rolePermissions(role) {
  const map = {
    fan: ["watch", "vote", "tip", "join-room", "shop"],
    artist: ["go-live", "upload-track", "tip", "join-contest", "book-venue"],
    performer: ["perform", "join-battle", "go-live", "tip"],
    sponsor: ["create-campaign", "buy-placement", "issue-giveaway", "view-analytics"],
    advertiser: ["create-ad", "manage-budget", "view-report", "buy-video-slot"],
    venue: ["sell-tickets", "assign-seats", "door-scan", "host-event"],
    host: ["start-show", "transition-scene", "announce-winner", "moderate-room"],
    admin: ["ban", "mute", "override", "patch-route", "reset-economy"],
  };
  return map[role] || [];
}

function roleAllowedActions(role) {
  return rolePermissions(role);
}

function makeAccount(role, n, opts = {}) {
  const tag = opts.tag || role;
  const displayName = opts.displayName || `${role.toUpperCase()} ${String(n).padStart(2, "0")}`;
  const username = `${tag}${String(n).padStart(2, "0")}`.toLowerCase();
  const tier = pick(TIERS, n);
  const walletScale = role === "sponsor" || role === "advertiser" ? 12 : role === "venue" ? 8 : role === "artist" ? 5 : 3;

  return {
    id: id(role, n),
    displayName,
    username,
    role,
    mode: "TEST",
    testCycleId: "cycle-2026-04-full",
    tier,
    artistAddOnTier: role === "artist" ? pick(ARTIST_ADDONS, n) : "NONE",
    profileImage: opts.profileImage || artistImage(n),
    bannerImage: opts.bannerImage || `/tmi-curated/home${(n % 5) + 1}.${(n % 5) === 0 ? "jpg" : "png"}`,
    avatarRef: `avatar-${role}-${String(n).padStart(3, "0")}`,
    wallet: baseWallet(n, walletScale),
    xp: 1500 + n * 30,
    inventory: {
      emotes: ["wave", "fire", "crown"],
      props: ["mic", "light-ring"],
      cosmetics: ["jacket-neon", "cap-urban"],
    },
    permissions: rolePermissions(role),
    allowedActions: roleAllowedActions(role),
    homeSurface: ROLE_SURFACES[role],
    analyticsIdentity: `${role}:${username}`,
    routeTargets: ["/home/1", ROLE_SURFACES[role], "/admin/observatory"],
    starterActivity: {
      room: "/room/random",
      state: "ACTIVE",
      lastAction: "seeded",
    },
    subscription: {
      tier,
      renewalCycle: "monthly",
      status: "active",
    },
    auth: {
      email: `${username}@test.tmi.local`,
      password: `Test!${String(1000 + n)}`,
      activated: true,
    },
    ...opts.extra,
  };
}

function makeFans(count = 60) {
  return Array.from({ length: count }, (_, i) =>
    makeAccount("fan", i + 1, {
      tag: "fan",
      displayName: `Fan ${String(i + 1).padStart(2, "0")}`,
      extra: {
        favoriteGenre: pick(GENRES, i),
        socialMode: i % 2 === 0 ? "hype" : "chill",
      },
    }),
  );
}

function makeArtists(count = 60) {
  return Array.from({ length: count }, (_, i) =>
    makeAccount("artist", i + 1, {
      tag: "artist",
      displayName: `Artist ${String(i + 1).padStart(2, "0")}`,
      extra: {
        genre: pick(GENRES, i),
        rankingScore: Number((100 - i * 0.8).toFixed(2)),
      },
    }),
  );
}

function makePerformers(count = 60) {
  return Array.from({ length: count }, (_, i) =>
    makeAccount("performer", i + 1, {
      tag: "performer",
      displayName: `Performer ${String(i + 1).padStart(2, "0")}`,
      extra: {
        specialty: pick(["dance", "vocals", "hype", "instrumental"], i),
      },
    }),
  );
}

function makeSponsors(count = 60) {
  return Array.from({ length: count }, (_, i) => {
    const brand = SPONSOR_BRANDS_40[i % SPONSOR_BRANDS_40.length];
    return makeAccount("sponsor", i + 1, {
      tag: "sponsor",
      displayName: `${brand.name} Sponsor`,
      bannerImage: `/sponsors/${brand.id}.svg`,
      extra: {
        sponsorBrandId: brand.id,
        category: brand.category,
        campaignBudget: 10000 + i * 650,
      },
    });
  });
}

function makeAdvertisers(count = 60) {
  return Array.from({ length: count }, (_, i) => {
    const brand = SPONSOR_BRANDS_40[i % SPONSOR_BRANDS_40.length];
    return makeAccount("advertiser", i + 1, {
      tag: "advertiser",
      displayName: `${brand.name} Campaign Ops`,
      bannerImage: `/sponsors/${brand.id}.svg`,
      extra: {
        sponsorBrandId: brand.id,
        targetingProfile: pick(["global", "local", "genre"], i),
        dailyBudget: 500 + i * 50,
      },
    });
  });
}

function makeVenues(count = 60) {
  return Array.from({ length: count }, (_, i) =>
    makeAccount("venue", i + 1, {
      tag: "venue",
      displayName: `Venue ${String(i + 1).padStart(2, "0")}`,
      extra: {
        venueType: pick(VENUE_TYPES, i),
        capacity: 120 + (i % 12) * 80,
        seatMode: i % 2 === 0 ? "assigned" : "standing",
      },
    }),
  );
}

function makeHosts(count = 5) {
  const names = ["Tiara", "Michael Gregory", "Gregory Marcel", "Ray Journey", "Finny Maxwell"];
  return Array.from({ length: count }, (_, i) =>
    makeAccount("host", i + 1, {
      tag: "host",
      displayName: names[i] || `Host ${i + 1}`,
      extra: {
        showRole: pick(["monday-night-stage", "yearly-contest", "battle-of-the-bands"], i),
      },
    }),
  );
}

function makeAdmins(count = 10) {
  return Array.from({ length: count }, (_, i) =>
    makeAccount("admin", i + 1, {
      tag: i < 5 ? "mod" : "admin",
      displayName: i < 5 ? `Mod ${String(i + 1).padStart(2, "0")}` : `Admin ${String(i - 4).padStart(2, "0")}`,
      extra: {
        moderationScope: i < 5 ? "rooms" : "global",
      },
    }),
  );
}

function makeAdvertiserCampaigns() {
  return SPONSOR_BRANDS_40.map((s, i) => ({
    id: `campaign-${String(i + 1).padStart(3, "0")}`,
    name: `${s.name} Campaign`,
    sponsorId: s.id,
    advertiserAccount: `advertiser${String((i % 60) + 1).padStart(2, "0")}`,
    mode: "TEST",
  }));
}

function makeVideoAds() {
  return SPONSOR_BRANDS_40.map((s, i) => ({
    id: `video-${String(i + 1).padStart(3, "0")}`,
    title: `${s.name} Ad`,
    sponsorId: s.id,
    type: ["pre-roll", "mid-roll", "billboard"][i % 3],
    thumbnail: `/ads/video-${String(i + 1).padStart(3, "0")}.svg`,
    videoUrl: `/ads/video-${String(i + 1).padStart(3, "0")}.mp4`,
    duration: 10 + (i % 3) * 5,
    mode: "TEST",
  }));
}

function writeSvg(path, title, colorA, colorB) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${colorA}"/><stop offset="100%" stop-color="${colorB}"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/><circle cx="160" cy="120" r="110" fill="rgba(255,255,255,0.16)"/><circle cx="1020" cy="520" r="140" fill="rgba(255,255,255,0.12)"/><text x="80" y="350" fill="white" font-size="72" font-family="Arial" font-weight="900" letter-spacing="2">${title}</text></svg>`;
  writeFileSync(path, svg, "utf8");
}

function ensureDirs() {
  [OUTPUT_DIR, DATA_DIR, PUBLIC_SPONSOR_DIR, PUBLIC_ADS_DIR].forEach((d) => mkdirSync(d, { recursive: true }));
}

function build() {
  ensureDirs();

  SPONSOR_BRANDS_40.forEach((brand, i) => {
    writeSvg(join(PUBLIC_SPONSOR_DIR, `${brand.id}.svg`), brand.name, i % 2 === 0 ? "#0ea5e9" : "#d946ef", i % 2 === 0 ? "#1d4ed8" : "#7e22ce");
    writeSvg(join(PUBLIC_ADS_DIR, `video-${String(i + 1).padStart(3, "0")}.svg`), `${brand.name} VIDEO`, i % 2 === 0 ? "#111827" : "#1f2937", i % 2 === 0 ? "#0891b2" : "#c026d3");
  });

  const fans = makeFans(60);
  const artists = makeArtists(60);
  const sponsors = makeSponsors(60);
  const advertisers = makeAdvertisers(60);
  const venues = makeVenues(60);
  const performers = makePerformers(60);
  const admins = makeAdmins(10);
  const hosts = makeHosts(5);

  const sponsorBrands = SPONSOR_BRANDS_40;
  const advertiserCampaigns = makeAdvertiserCampaigns();
  const videoAds = makeVideoAds();

  const accounts = [...fans, ...artists, ...sponsors, ...advertisers, ...venues, ...performers, ...admins, ...hosts];

  const output = {
    generatedAt: new Date().toISOString(),
    mode: "TEST",
    isolation: {
      enforceTestCashOnly: true,
      blockLiveCrossTransactions: true,
      walletFields: ["testCash", "testPoints"],
    },
    counts: {
      fans: fans.length,
      artists: artists.length,
      sponsors: sponsors.length,
      advertisers: advertisers.length,
      venues: venues.length,
      performers: performers.length,
      admins: admins.length,
      hosts: hosts.length,
      totalAccounts: accounts.length,
      sponsorBrands: sponsorBrands.length,
      advertiserCampaigns: advertiserCampaigns.length,
      videoAds: videoAds.length,
    },
    tiersCovered: TIERS,
    artistAddOnsCovered: ARTIST_ADDONS,
    accounts,
    sponsorBrands,
    advertiserCampaigns,
    videoAds,
  };

  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), "utf8");
  writeFileSync(join(DATA_DIR, "sponsors.json"), JSON.stringify(sponsorBrands, null, 2), "utf8");
  writeFileSync(join(DATA_DIR, "advertisers.json"), JSON.stringify(advertiserCampaigns, null, 2), "utf8");
  writeFileSync(join(DATA_DIR, "videos.json"), JSON.stringify(videoAds, null, 2), "utf8");

  console.log("✅ Full TEST population seeded");
  console.log(`   Accounts: ${accounts.length} (fans ${fans.length}, artists ${artists.length}, sponsors ${sponsors.length}, advertisers ${advertisers.length}, venues ${venues.length}, performers ${performers.length}, admins ${admins.length}, hosts ${hosts.length})`);
  console.log(`   Sponsor brands: ${sponsorBrands.length} | Campaigns: ${advertiserCampaigns.length} | Video ads: ${videoAds.length}`);
  console.log(`   Output: ${OUTPUT_FILE}`);
}

build();
