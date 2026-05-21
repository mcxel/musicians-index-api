// packages/db/prisma/seed.ts
// Run: pnpm prisma db seed
// Seeds: Marcel Diamond + BJ M Beat's Diamond + test data for dev

import { PrismaClient, Prisma } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding TMI database...
");

  // ── PLATFORM OWNER — PERMANENT DIAMOND ─────────────────────────
  // Platform Law #2: Marcel Dickens + BJ M Beat's are permanent Diamond forever
  const marcel = await prisma.user.upsert({
    where: { email: "berntmusic33@gmail.com" },
    update: { isPermanentDiamond: true, tier: "DIAMOND", role: "ADMIN" },
    create: {
      email: "berntmusic33@gmail.com",
      displayName: "Marcel Dickens",
      username: "berntmusic33",
      isPermanentDiamond: true,
      tier: "DIAMOND",
      role: "ADMIN",
      isVerified: true,
      emailVerified: new Date(),
    },
  });
  console.log(`✓ Marcel Dickens (PERMANENT DIAMOND) — ${marcel.id}`);

  const bj = await prisma.user.upsert({
    where: { email: "bjmbeat@themusiciansindex.com" },
    update: { isPermanentDiamond: true, tier: "DIAMOND" },
    create: {
      email: "bjmbeat@themusiciansindex.com",
      displayName: "B.J. M Beat's",
      username: "bjmbeats",
      isPermanentDiamond: true,
      tier: "DIAMOND",
      role: "MEMBER",
      isVerified: true,
      emailVerified: new Date(),
    },
  });
  console.log(`✓ B.J. M Beat's (PERMANENT DIAMOND) — ${bj.id}`);

  // ── TEST ARTIST ────────────────────────────────────────────────
  const testArtist = await prisma.user.upsert({
    where: { email: "testartist@tmi.dev" },
    update: {},
    create: {
      email: "testartist@tmi.dev",
      displayName: "Test Artist",
      username: "testartist",
      tier: "PRO",
      role: "MEMBER",
      isVerified: true,
      emailVerified: new Date(),
    },
  });
  const artistProfile = await prisma.artist.upsert({
    where: { userId: testArtist.id },
    update: {},
    create: {
      userId: testArtist.id,
      stageName: "Test Artist",
      slug: "test-artist",
      stationSlug: "test-artist-station",   // Platform Law #9 + #10: "stations" not "channels"
      bio: "Test artist for development seeding.",
      genre: "Hip Hop",
      city: "Chico",
      state: "CA",
      isVerified: true,
    },
  });
  console.log(`✓ Test artist — slug: ${artistProfile.slug}, stationSlug: ${artistProfile.stationSlug}`);

  // ── TEST VENUE ─────────────────────────────────────────────────
  const testVenue = await prisma.venue.upsert({
    where: { slug: "test-venue" },
    update: {},
    create: {
      name: "Test Venue",
      slug: "test-venue",
      city: "Chico",
      state: "CA",
      venueType: "CLUB",
      totalCapacity: 200,
      isVerified: true,
      ownerId: marcel.id,
    },
  });
  console.log(`✓ Test venue — ${testVenue.name}`);

  // ── HOUSE AD CREATIVES — 5-LEVEL FALLBACK (Platform Law #7) ───
  // Every level must have content so /api/ads/slot/* ALWAYS returns 200
  const houseAds = [
    { name: "TMI Crown Winner Spotlight",  zone: "HOME1_HERO",           level: 3 },
    { name: "TMI Undiscovered Artist",     zone: "HOME1_HERO",           level: 4 },
    { name: "TMI Brand House Ad",          zone: "HOME1_HERO",           level: 5 },
    { name: "TMI Editorial Spotlight",     zone: "HOME2_EDITORIAL_BELT", level: 3 },
    { name: "TMI Platform Brand",          zone: "HOME2_EDITORIAL_BELT", level: 5 },
    { name: "TMI Live World Banner",       zone: "HOME3_LOBBY_WALL",     level: 3 },
    { name: "TMI Platform Brand",          zone: "HOME3_LOBBY_WALL",     level: 5 },
    { name: "TMI Sponsor Deck",            zone: "HOME4_PREMIUM",        level: 3 },
    { name: "TMI Platform Brand",          zone: "HOME4_PREMIUM",        level: 5 },
    { name: "TMI Game Show Fallback",      zone: "GAME_END_SCREEN",      level: 5 },
    { name: "TMI Live Room Fallback",      zone: "LIVE_ROOM_OVERLAY",    level: 5 },
    { name: "TMI Stadium Fallback",        zone: "STADIUM_BILLBOARD",    level: 5 },
  ];
  for (const ad of houseAds) {
    await prisma.adCreative.upsert({
      where: { name_zoneId: { name: ad.name, zoneId: ad.zone } },
      update: {},
      create: {
        name: ad.name,
        type: "NATIVE",
        assetUrl: `/public/ads/house/${ad.zone.toLowerCase()}-level${ad.level}.png`,
        ctaUrl: "https://themusiciansindex.com",
        isHouseAd: true,
        fallbackLevel: ad.level,
        zoneId: ad.zone,
        isActive: true,
      },
    });
  }
  console.log(`✓ ${houseAds.length} house ad creatives (Platform Law #7 fallback chain)`);

  // ── FEATURE FLAGS (all false by default) ──────────────────────
  const flags = [
    { key:"vr_enabled",              defaultValue:false, description:"Enable VR/WebXR features" },
    { key:"stadium_enabled",         defaultValue:false, description:"Enable VR Stadium" },
    { key:"face_scan_enabled",       defaultValue:false, description:"Enable face scan avatar creation" },
    { key:"ai_broadcaster_enabled",  defaultValue:false, description:"Enable AI broadcaster personalities" },
    { key:"store_enabled",           defaultValue:true,  description:"Enable item shop" },
    { key:"rewards_enabled",         defaultValue:true,  description:"Enable rewards and giveaways" },
    { key:"stadium_vr_capacity",     defaultValue:false, description:"Enable 10k avatar stadium mode" },
    { key:"sms_enabled",             defaultValue:false, description:"Enable SMS notifications" },
  ];
  for (const flag of flags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: { key: flag.key, value: String(flag.defaultValue), description: flag.description, isActive: true },
    });
  }
  console.log(`✓ ${flags.length} feature flags seeded (all default false except store + rewards)`);

  // ── TEST ROOM (discovery-first) ────────────────────────────────
  const testRoom = await prisma.room.upsert({
    where: { slug: "dev-test-room" },
    update: {},
    create: {
      name: "Dev Test Room",
      slug: "dev-test-room",
      hostId: testArtist.id,
      roomType: "LIVE_STAGE",
      scene: "live-stage",
      isActive: true,     // Platform Law #8: room stays active even with 0 members
      viewerCount: 0,     // Platform Law #1: 0 viewers = position 1 in lobby wall
      isLive: false,
      lighting: "neon_purple",
    },
  });
  console.log(`✓ Dev test room (0 viewers — position 1 in lobby sort)`);

  // ── TEST WALLET FOR MARCEL ─────────────────────────────────────
  await prisma.wallet.upsert({
    where: { userId: marcel.id },
    update: {},
    create: {
      userId: marcel.id,
      balanceCents: 0,
      pendingCents: 0,
      lifetimeEarnedCents: 0,
      requiresBigAceApproval: true,  // Platform Law #5
    },
  });
  console.log(`✓ Marcel wallet (Big Ace approval required — Platform Law #5)`);

  console.log("
✅ SEED COMPLETE");
  console.log("   Marcel: PERMANENT DIAMOND ✓");
  console.log("   BJ M Beat's: PERMANENT DIAMOND ✓");
  console.log("   House ads: 12 fallback creatives ✓ (Law #7)");
  console.log("   Feature flags: 8 defaults ✓");
  console.log("   Test room: 0 viewers = position 1 ✓ (Law #1)");
  console.log("
   Run pnpm test:discovery to verify lobby sort");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
