/**
 * apps/api/src/seed-testers.ts
 *
 * TMI Tester Provisioning Seed Script
 *
 * Provisions Diamond-tier entitlements for the three primary launch testers.
 * Safe to re-run — all operations are upserts.
 *
 * Run: npx ts-node src/seed-testers.ts
 *      (or: npx tsx src/seed-testers.ts)
 *
 * Testers:
 *   Marcel       — berntmusic33@gmail.com       — ADMIN    — Full platform access + governance cluster root
 *   Justin King  — $JUSTIN_EMAIL                — ADMIN    — Governance cluster member, artist persona
 *   Jay Paul     — $JPAUL_EMAIL                 — ADMIN    — Governance cluster member, beat producer persona
 *   Twan King    — antoineking@gmail.com         — ARTIST   — Artist + fan entitlements
 *   Kreach       — kreacher.616@gmail.com        — ARTIST   — Artist + fan entitlements
 */

import { PrismaClient, Role } from '.prisma/client';

const prisma = new PrismaClient();

// ── Constants ────────────────────────────────────────────────────────────────

const TEST_PRODUCT_ID  = 'prod_tmi_diamond_test';
const TEST_PRICE_ID    = 'price_tmi_diamond_monthly_test';
const DIAMOND_CREDITS  = 10_000;   // fanCredits for each tester wallet
const SEED_BALANCE     = 5_000;    // availableBalance (cents or platform currency)
const PERIOD_END       = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

interface TesterSpec {
  name: string;
  email: string;
  role: Role;
  username: string;
  stageName?: string;
  genres?: string[];
  bio: string;
  isProducer?: boolean;   // Beat producer — gets beat-lab access flag in ArtistProfile skills
  isGovernance?: boolean; // Part of governance cluster — gets cluster metadata in subscription
}

const TESTERS: TesterSpec[] = [
  // ── Governance Cluster ───────────────────────────────────────────────────
  {
    name:        'Marcel Dickens',
    email:       'berntmusic33@gmail.com',
    role:        Role.ADMIN,
    username:    'marcel',
    stageName:   'Bernt Music',
    genres:      ['Hip-Hop', 'R&B', 'Soul'],
    bio:         'TMI Founder & Platform Director — Governance Cluster Root',
    isGovernance: true,
  },
  {
    name:        'Justin King',
    email:       process.env.JUSTIN_EMAIL ?? (() => { throw new Error('JUSTIN_EMAIL env var required'); })(),
    role:        Role.ADMIN,
    username:    'justinking',
    stageName:   'Justin King',
    genres:      ['R&B', 'Soul', 'Gospel'],
    bio:         'TMI Co-Director — Governance Cluster Member',
    isGovernance: true,
  },
  {
    name:        'Jay Paul Sanchez',
    email:       process.env.JPAUL_EMAIL ?? (() => { throw new Error('JPAUL_EMAIL env var required'); })(),
    role:        Role.ADMIN,
    username:    'jaypaulsanchez',
    stageName:   'Jay Paul Sanchez',
    genres:      ['Electronic', 'Trap', 'Hip-Hop', 'Beats'],
    bio:         'TMI Beat Producer & Governance Cluster Member — Beat submission for games, battles, cyphers',
    isProducer:  true,
    isGovernance: true,
  },
  // ── Launch Testers ───────────────────────────────────────────────────────
  {
    name:      'Twan King',
    email:     'antoineking@gmail.com',
    role:      Role.ARTIST,
    username:  'twanking',
    stageName: 'Twan King',
    genres:    ['R&B', 'Hip-Hop', 'Soul'],
    bio:       'Artist / Tester — BerntoutGlobal XXL Season I',
  },
  {
    name:      'Kreach',
    email:     'kreacher.616@gmail.com',
    role:      Role.ARTIST,
    username:  'kreach',
    stageName: 'Kreach',
    genres:    ['Electronic', 'Trap', 'Afrobeats'],
    bio:       'Artist / Tester — BerntoutGlobal XXL Season I',
  },
  // ── Early Access Cohort ──────────────────────────────────────────────────
  {
    name:      'KG',
    email:     process.env.KG_EMAIL ?? (() => { throw new Error('KG_EMAIL env var required'); })(),
    role:      Role.ARTIST,
    username:  'kg',
    stageName: 'KG',
    genres:    ['Hip-Hop', 'Trap', 'R&B'],
    bio:       'Diamond Producer — BerntoutGlobal XXL Season I',
    isProducer: true,
  },
  {
    name:      'Savage Guns',
    email:     process.env.SAVAGE_GUNS_EMAIL ?? (() => { throw new Error('SAVAGE_GUNS_EMAIL env var required'); })(),
    role:      Role.ARTIST,
    username:  'savageguns',
    stageName: 'Savage Guns',
    genres:    ['Hip-Hop', 'Drill', 'Trap'],
    bio:       'Artist — BerntoutGlobal XXL Season I (90-day diamond trial)',
  },
  {
    name:      'Jason Smith',
    email:     'sharingmyblessing1978@gmail.com',
    role:      Role.ADMIN,
    username:  'jasonsmith',
    stageName: 'Jason Smith',
    genres:    ['Gospel', 'R&B', 'Hip-Hop'],
    bio:       'Founder — Lifetime Diamond · Promoter + Performer + Fan',
    isGovernance: true,
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function log(msg: string) {
  console.log(`  ${msg}`);
}

function section(label: string) {
  console.log(`\n${'─'.repeat(56)}`);
  console.log(`  ${label}`);
  console.log('─'.repeat(56));
}

// ── Steps ────────────────────────────────────────────────────────────────────

async function ensureDiamondProduct() {
  section('Ensuring Diamond Product + Price');

  await prisma.product.upsert({
    where:  { id: TEST_PRODUCT_ID },
    create: {
      id:          TEST_PRODUCT_ID,
      active:      true,
      name:        'TMI Diamond Tier (Test)',
      description: 'Full Diamond-tier access for launch testers.',
      metadata:    { tier: 'diamond', env: 'test' },
    },
    update: { active: true },
  });
  log(`✓  Product: ${TEST_PRODUCT_ID}`);

  await prisma.price.upsert({
    where:  { id: TEST_PRICE_ID },
    create: {
      id:          TEST_PRICE_ID,
      productId:   TEST_PRODUCT_ID,
      active:      true,
      description: 'TMI Diamond Monthly (Test)',
      unitAmount:  2999,
      currency:    'usd',
      type:        'recurring',
      interval:    'month',
      metadata:    { tier: 'diamond', env: 'test' },
    },
    update: { active: true },
  });
  log(`✓  Price: ${TEST_PRICE_ID}  ($29.99/month)`);
}

async function provisionTester(spec: TesterSpec) {
  section(`${spec.name}  <${spec.email}>`);

  // 1. Upsert user
  const user = await prisma.user.upsert({
    where:  { email: spec.email },
    create: {
      name:                  spec.name,
      email:                 spec.email,
      role:                  spec.role,
      emailVerified:         new Date(),
      passwordHash:          null, // Use forgot-password to set
      onboardingState:       'COMPLETE',
      onboardingCompletedAt: new Date(),
      termsAccepted:         true,
    },
    update: {
      role:                  spec.role,
      emailVerified:         new Date(),
      onboardingState:       'COMPLETE',
      onboardingCompletedAt: new Date(),
      termsAccepted:         true,
    },
  });
  log(`✓  User: ${user.id}  role=${user.role}`);

  // 2. Upsert UserProfile
  await prisma.userProfile.upsert({
    where:  { userId: user.id },
    create: {
      userId:      user.id,
      displayName: spec.name,
      username:    spec.username,
      bio:         spec.bio,
    },
    update: {
      displayName: spec.name,
      username:    spec.username,
      bio:         spec.bio,
    },
  });
  log(`✓  UserProfile: @${spec.username}`);

  // 3. Upsert Wallet with Diamond-tier seeded credits
  await prisma.wallet.upsert({
    where:  { userId: user.id },
    create: {
      userId:           user.id,
      availableBalance: SEED_BALANCE,
      pendingBalance:   0,
      lifetimeEarnings: 0,
      fanCredits:       DIAMOND_CREDITS,
      stripeOnboarded:  false,
    },
    update: {
      fanCredits:       DIAMOND_CREDITS,
      availableBalance: SEED_BALANCE,
    },
  });
  log(`✓  Wallet: ${DIAMOND_CREDITS} fanCredits, ${SEED_BALANCE} balance`);

  // 4. Upsert ArtistProfile for ARTIST or governance ADMIN (all cluster members get artist profiles)
  const needsArtistProfile = spec.role === Role.ARTIST || (spec.isGovernance && spec.stageName);
  if (needsArtistProfile && spec.stageName) {
    const baseSkills = ['Live Performance', 'Recording'];
    const producerSkills = spec.isProducer
      ? ['Beat Production', 'Sound Design', 'Mixing', 'Mastering', 'Battle Submission', 'Cypher Submission', 'Game Audio']
      : baseSkills;

    await prisma.artistProfile.upsert({
      where:  { userId: user.id },
      create: {
        userId:    user.id,
        stageName: spec.stageName,
        slug:      spec.username,
        genres:    spec.genres ?? [],
        skills:    producerSkills,
        verified:  true,
        followers: 0,
        views:     0,
      },
      update: {
        stageName: spec.stageName,
        verified:  true,
        genres:    spec.genres ?? [],
      },
    });
    log(`✓  ArtistProfile: "${spec.stageName}"  verified=true`);
  }

  // 5. Upsert FanProfile (all testers get fan access too)
  await prisma.fanProfile.upsert({
    where:  { userId: user.id },
    create: {
      userId:         user.id,
      favoriteGenres: spec.genres ?? ['Hip-Hop', 'R&B'],
      bio:            spec.bio,
      followers:      0,
    },
    update: {
      favoriteGenres: spec.genres ?? ['Hip-Hop', 'R&B'],
    },
  });
  log(`✓  FanProfile created`);

  // 6. Upsert Diamond Subscription
  const subId = `sub_test_tester_${user.id}`;
  await prisma.subscription.upsert({
    where:  { id: subId },
    create: {
      id:                 subId,
      userId:             user.id,
      status:             'active',
      priceId:            TEST_PRICE_ID,
      cancelAtPeriodEnd:  false,
      created:            new Date(),
      currentPeriodStart: new Date(),
      currentPeriodEnd:   PERIOD_END,
      metadata: {
        tier:        'diamond',
        env:         'test',
        tester:      true,
        governance:  spec.isGovernance ?? false,
        producer:    spec.isProducer ?? false,
        clusterId:   spec.isGovernance ? 'tmi-launch-governance-v1' : null,
        seededAt:    new Date().toISOString(),
      },
    },
    update: {
      status:            'active',
      currentPeriodEnd:  PERIOD_END,
      cancelAtPeriodEnd: false,
      metadata: {
        tier:        'diamond',
        env:         'test',
        tester:      true,
        governance:  spec.isGovernance ?? false,
        producer:    spec.isProducer ?? false,
        clusterId:   spec.isGovernance ? 'tmi-launch-governance-v1' : null,
        updatedAt:   new Date().toISOString(),
      },
    },
  });
  log(`✓  Subscription: Diamond · active · expires ${PERIOD_END.toLocaleDateString()}`);
  if (spec.isGovernance) log(`✓  Governance: cluster=tmi-launch-governance-v1`);
  if (spec.isProducer)   log(`✓  Producer: beat-lab + battle/cypher/game submission enabled`);

  return user.id;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n════════════════════════════════════════════════════════');
  console.log('  TMI TESTER PROVISIONING SEED');
  console.log('  Governance: Marcel · Justin King · Jay Paul Sanchez · Jason Smith');
  console.log('  Testers:    Twan King · Kreach · KG · Savage Guns');
  console.log('  Tier: Diamond  |  Env: Test');
  console.log('════════════════════════════════════════════════════════');

  await ensureDiamondProduct();

  const results: Array<{ name: string; email: string; userId: string }> = [];
  for (const spec of TESTERS) {
    const userId = await provisionTester(spec);
    results.push({ name: spec.name, email: spec.email, userId });
  }

  console.log('\n════════════════════════════════════════════════════════');
  console.log('  PROVISION COMPLETE');
  console.log('════════════════════════════════════════════════════════\n');

  for (const r of results) {
    console.log(`  ✅  ${r.name.padEnd(20)}  ${r.email.padEnd(32)}  id=${r.userId}`);
  }

  console.log('\n  NEXT STEPS:');
  console.log('  1. Each tester uses "Forgot Password" to set their initial password.');
  console.log('  2. Log in at /auth and confirm role + Diamond tier in /hub');
  console.log('  3. Verify analytics access at /artists/[slug]/analytics');
  console.log('  4. Marcel verifies admin access at /admin/observatory');
  console.log('  5. Confirm telemetry at /admin/diagnostics/testers\n');
}

main()
  .catch((e) => {
    console.error('\n  ✗  Provisioning failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
