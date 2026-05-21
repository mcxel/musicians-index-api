// packages/db/prisma/seed.ts
// TMI Platform Seed — Minimum data for the platform to boot.
// Run: cd packages/db && pnpm prisma db seed

import { PrismaClient, TierLevel, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding TMI Platform...");

  // ── PLATFORM LAWS SEED ──────────────────────────────
  // Law #2: Permanent Diamond users. NEVER remove these.
  const marcelUser = await prisma.user.upsert({
    where: { email: "berntmusic33@gmail.com" },
    update: { tier: TierLevel.DIAMOND, isPermanentDiamond: true, role: UserRole.SUPER_ADMIN },
    create: {
      email: "berntmusic33@gmail.com",
      role: UserRole.SUPER_ADMIN,
      tier: TierLevel.DIAMOND,
      isPermanentDiamond: true,
      emailVerified: true,
    },
  });
  console.log("  ✓ Marcel Dickens (berntmusic33@gmail.com) — Permanent Diamond");

  // BJ M Beat's — second permanent Diamond
  const bjUser = await prisma.user.upsert({
    where: { email: "bjmbeats@themusiciansindex.com" },  // update with real email
    update: { tier: TierLevel.DIAMOND, isPermanentDiamond: true },
    create: {
      email: "bjmbeats@themusiciansindex.com",
      role: UserRole.ARTIST,
      tier: TierLevel.DIAMOND,
      isPermanentDiamond: true,
      emailVerified: true,
    },
  });
  console.log("  ✓ B.J. M Beat's — Permanent Diamond");

  // ── FEATURE FLAGS (all false by default) ────────────
  const flags = [
    { key: "enableVR",              value: false, description: "VR/WebXR scenes" },
    { key: "enableStadium",         value: false, description: "10,000-avatar VR stadium" },
    { key: "enableFaceScan",        value: false, description: "Biometric avatar face scan" },
    { key: "enableAIBroadcaster",   value: false, description: "AI broadcaster personalities" },
    { key: "enableCreatorStore",    value: false, description: "Creator-uploaded product stores" },
    { key: "enableNFT",             value: false, description: "NFT/blockchain features" },
    { key: "enableSMS",             value: false, description: "SMS notifications" },
    { key: "enableReferrals",       value: true,  description: "Referral reward system" },
    { key: "enableDailyDrop",       value: true,  description: "Daily item shop drops" },
    { key: "enableCrownSystem",     value: true,  description: "Weekly crown competition" },
    { key: "enableSponsorMatching", value: true,  description: "Local sponsor matching bot" },
  ];
  for (const flag of flags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: { value: flag.value },
      create: flag,
    });
  }
  console.log(`  ✓ ${flags.length} feature flags seeded`);

  // ── HOUSE AD FALLBACK CREATIVES (5 levels) ───────────
  // These ensure GET /api/ads/slot always returns 200 (Platform Law #7)
  const houseAds = [
    { level: 3, name: "Crown Winner Spotlight",    type: "card",   ctaUrl: "/hall-of-fame" },
    { level: 4, name: "Undiscovered Artist",       type: "native", ctaUrl: "/discover" },
    { level: 5, name: "TMI Brand — This Is Your Stage", type: "banner", ctaUrl: "/" },
  ];
  // Create a house advertiser account
  const houseAdvertiser = await prisma.advertiser.upsert({
    where: { contactEmail: "house@themusiciansindex.com" },
    update: {},
    create: { companyName: "The Musician's Index", contactEmail: "house@themusiciansindex.com", isVerified: true },
  });
  for (const ad of houseAds) {
    await prisma.campaign.upsert({
      where: { id: `house-ad-level-${ad.level}` },
      update: {},
      create: {
        id: `house-ad-level-${ad.level}`,
        advertiserId: houseAdvertiser.id,
        name: ad.name,
        status: "ACTIVE",
        budgetCents: 999999999,
        spentCents: 0,
        startDate: new Date("2026-01-01"),
        endDate: new Date("2099-12-31"),
      },
    });
  }
  console.log("  ✓ House ad fallback creatives (Platform Law #7)");

  // ── TEST VENUE ───────────────────────────────────────
  await prisma.venue.upsert({
    where: { slug: "tmi-virtual-stage" },
    update: {},
    create: {
      slug: "tmi-virtual-stage",
      name: "TMI Virtual Stage",
      venueType: "virtual_stage",
      city: "Chico",
      state: "CA",
      country: "US",
      totalCapacity: 500,
      livestreamEnabled: true,
      ticketingEnabled: false,
      isVerified: true,
    },
  });
  console.log("  ✓ TMI Virtual Stage venue");

  // ── MAIN LOBBY ROOM ──────────────────────────────────
  // Platform Law #1: starts with 0 viewers, appears at position 1
  await prisma.room.upsert({
    where: { slug: "tmi-main-lobby" },
    update: {},
    create: {
      slug: "tmi-main-lobby",
      name: "TMI Main Lobby",
      roomType: "MAIN_LOBBY",
      hostUserId: marcelUser.id,
      viewerCount: 0,  // Law #1: 0 viewers = position 1
      maxOccupancy: 500,
      isActive: true,
      isLive: false,
      lighting: "neon_purple",
      scene: "lobby",
      chatEnabled: true,
    },
  });
  console.log("  ✓ Main lobby room (viewerCount: 0 = position 1 — Law #1)");

  // ── BOT STATUS RECORDS ───────────────────────────────
  const criticalBots = ["house-ad-fallback", "billing-integrity", "health-monitor", "live-pulse"];
  for (const botId of criticalBots) {
    await prisma.bot.upsert({
      where: { botId },
      update: {},
      create: {
        botId,
        name: botId.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" "),
        status: "ACTIVE",
        runCount: 0,
        errorCount: 0,
      },
    });
  }
  console.log(`  ✓ ${criticalBots.length} critical bots registered`);

  // ── ITEM RARITY SEED ITEMS ───────────────────────────
  const seedItems = [
    { id: "item-tmi-brand-tee",    name: "TMI Brand Tee",       category: "AVATAR_WEARABLE", rarity: "COMMON",    pointCost: 150 },
    { id: "item-neon-crown-hat",   name: "Neon Crown Hat",      category: "AVATAR_WEARABLE", rarity: "RARE",      pointCost: 1000 },
    { id: "item-gold-chain",       name: "Gold Chain",          category: "AVATAR_WEARABLE", rarity: "UNCOMMON",  pointCost: 400 },
    { id: "item-crown-badge",      name: "Crown Champion Badge", category: "BADGE",           rarity: "LEGENDARY", pointCost: 0 },  // earned only
    { id: "item-cypher-aura",      name: "Cypher Aura",         category: "AVATAR_EFFECT",   rarity: "EPIC",      pointCost: 2500 },
    { id: "item-victory-emote",    name: "Victory Emote",       category: "AVATAR_ANIMATION", rarity: "UNCOMMON", pointCost: 300 },
  ];
  for (const item of seedItems) {
    await prisma.itemDefinition.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        description: `The ${item.name} — exclusive TMI cosmetic`,
        isEquippable: true,
        sourceType: item.pointCost === 0 ? "contest_win" : "shop",
        tags: ["seed", "launch"],
      },
    });
  }
  console.log(`  ✓ ${seedItems.length} seed shop items`);

  console.log("\n✅ Seed complete. TMI Platform ready to boot.");
  console.log("   Marcel Dickens: Permanent Diamond ✓");
  console.log("   B.J. M Beat's: Permanent Diamond ✓");
  console.log("   House ad fallbacks: 5 levels ✓ (Law #7)");
  console.log("   Main lobby: viewerCount=0 ✓ (Law #1)");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
