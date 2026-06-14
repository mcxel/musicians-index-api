// tmi-platform/apps/api/src/seed-admin.ts
//
// Bootstrap script for TMI initial accounts.
// Creates accounts without passwords — each admin must use "Forgot Password" to set theirs.
// Family Diamond accounts are pre-created with age-protection flags.
// Run once: pnpm ts-node apps/api/src/seed-admin.ts
//
import { PrismaClient, Role } from '.prisma/client';

const prisma = new PrismaClient();

// ── Full Admin Accounts ──────────────────────────────────────────────────────
// Role: ADMIN — full platform access; observe/monitor mode, NOT participation.
// Each admin has a dedicated hub: /admin/marcel, /admin/micah, /admin/jay-paul,
// /admin/justin-king, /admin/big-ace
const ADMIN_ACCOUNTS = [
  {
    name:  'Marcel Dickens',
    email: process.env.MARCEL_EMAIL ?? '[REPLACE_WITH_MARCEL_EMAIL]',
    adminHub: '/admin/marcel',
    note: 'Founder/Super Admin',
  },
  {
    name:  'Micah Hatchett',
    email: process.env.MICAH_EMAIL  ?? '[REPLACE_WITH_MICAH_EMAIL]',
    adminHub: '/admin/micah',
    note: 'USAstreamteam / Dev Assistant',
  },
  {
    name:  'Jay Paul Sanchez',
    email: process.env.JPAUL_EMAIL  ?? '[REPLACE_WITH_JPAUL_EMAIL]',
    adminHub: '/admin/jay-paul',
    note: 'TMI Administration / Beat Producer (BJM)',
  },
  {
    name:  'Justin King',
    email: process.env.JUSTIN_EMAIL ?? '[REPLACE_WITH_JUSTIN_EMAIL]',
    adminHub: '/admin/justin-king',
    note: 'Platform Ops / Observer',
  },
  {
    name:  'Big Ace',
    email: process.env.BIGACE_EMAIL ?? '[REPLACE_WITH_BIGACE_EMAIL]',
    adminHub: '/admin/big-ace',
    note: 'Executive AI — AI agent account',
  },
];

// ── Family Diamond Accounts ──────────────────────────────────────────────────
// Role: FAN — Diamond tier; NO admin authority.
// MJ and Melody are under 16: NO public performer, NO public messaging,
// NO livestreaming, NO payment processing.
// Enforcement is managed via /admin/minor-safety and /admin/age-gates.
const FAMILY_ACCOUNTS = [
  {
    name:    'Dylan',
    email:   process.env.DYLAN_EMAIL   ?? '[REPLACE_WITH_DYLAN_EMAIL]',
    tier:    'DIAMOND',
    isMinor: false,
    note:    'Family Diamond — age 16+',
  },
  {
    name:    'MJ',
    email:   process.env.MJ_EMAIL      ?? '[REPLACE_WITH_MJ_EMAIL]',
    tier:    'DIAMOND',
    isMinor: true,
    note:    'Family Diamond — under 16 / age-restricted',
  },
  {
    name:    'Melody',
    email:   process.env.MELODY_EMAIL  ?? '[REPLACE_WITH_MELODY_EMAIL]',
    tier:    'DIAMOND',
    isMinor: true,
    note:    'Family Diamond — under 16 / age-restricted',
  },
];

async function upsertAdmin(acc: (typeof ADMIN_ACCOUNTS)[number]) {
  const existing = await prisma.user.findUnique({ where: { email: acc.email } });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        role:            Role.ADMIN,
        emailVerified:   existing.emailVerified ?? new Date(),
        onboardingState: 'COMPLETE',
      },
    });
    console.log(`  ✓ ${acc.name} (${acc.note}) — updated to ADMIN`);
  } else {
    await prisma.user.create({
      data: {
        name:             acc.name,
        email:            acc.email,
        role:             Role.ADMIN,
        emailVerified:    new Date(),
        passwordHash:     null,
        onboardingState:  'COMPLETE',
        onboardingCompletedAt: new Date(),
      },
    });
    console.log(`  ✓ ${acc.name} (${acc.note}) — created as ADMIN`);
  }
}

async function upsertFamily(acc: (typeof FAMILY_ACCOUNTS)[number]) {
  const existing = await prisma.user.findUnique({ where: { email: acc.email } });

  const data = {
    role:              Role.FAN,
    emailVerified:     new Date(),
    tier:              acc.tier,
    onboardingState:   'COMPLETE' as const,
    onboardingCompletedAt: new Date(),
    // Minors: disable official link submission; payment/stream enforcement via admin panels
    canSubmitOfficialPlatformLinks: !acc.isMinor,
  };

  if (existing) {
    await prisma.user.update({ where: { id: existing.id }, data });
    console.log(`  ✓ ${acc.name} (${acc.note}) — updated as DIAMOND FAN${acc.isMinor ? ' [MINOR RESTRICTED]' : ''}`);
  } else {
    await prisma.user.create({
      data: { name: acc.name, email: acc.email, passwordHash: null, ...data },
    });
    console.log(`  ✓ ${acc.name} (${acc.note}) — created as DIAMOND FAN${acc.isMinor ? ' [MINOR RESTRICTED]' : ''}`);
  }
}

async function main() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  TMI Platform — Admin + Family Account Bootstrap');
  console.log('═══════════════════════════════════════════════════\n');

  const placeholders = [
    ...ADMIN_ACCOUNTS.map(a => a.email),
    ...FAMILY_ACCOUNTS.map(a => a.email),
  ].filter(e => e.startsWith('['));

  if (placeholders.length > 0) {
    console.error('ERROR: Replace all placeholder emails before running, or set env vars:\n');
    console.error('  MARCEL_EMAIL, MICAH_EMAIL, JPAUL_EMAIL, JUSTIN_EMAIL, BIGACE_EMAIL');
    console.error('  DYLAN_EMAIL, MJ_EMAIL, MELODY_EMAIL\n');
    process.exit(1);
  }

  console.log('► Admin accounts (5):');
  for (const acc of ADMIN_ACCOUNTS) {
    await upsertAdmin(acc);
  }

  console.log('\n► Family Diamond accounts (3):');
  for (const acc of FAMILY_ACCOUNTS) {
    await upsertFamily(acc);
  }

  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║  ✅ Bootstrap complete.                           ║');
  console.log('║                                                   ║');
  console.log('║  NEXT STEPS:                                      ║');
  console.log('║  1. Admins use "Forgot Password" to set theirs.   ║');
  console.log('║  2. Configure MJ + Melody restrictions at:        ║');
  console.log('║     /admin/minor-safety  /admin/age-gates         ║');
  console.log('║  3. Verify admin hubs accessible at /admin/*      ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
}

main()
  .catch(e => {
    console.error('\n✗ Bootstrap script failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
