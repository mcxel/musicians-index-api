import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyLedger() {
  console.log('🔍 Scanning TMI Database for Recent Beat Sales & Ledger Credits...\n');

  const recentLicenses = await prisma.beatLicense.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { beat: true },
  });

  if (recentLicenses.length === 0) {
    console.log('⚠️  No recent beat licenses found. Complete a Stripe Checkout first.');
    console.log('    Test card: 4242 4242 4242 4242 · any future date · any CVC\n');
    return;
  }

  for (const license of recentLicenses) {
    console.log(`[LICENSE] "${license.beat.title}" · ${license.type} · $${(license.price / 100).toFixed(2)}`);

    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where: { relatedId: license.stripeId },
    });

    if (ledgerEntries.length > 0) {
      const entry = ledgerEntries[0];
      console.log(`  ✅ LEDGER CREDITED — Producer ${entry.userId} received $${(entry.amount / 100).toFixed(2)} (${entry.type})`);
      console.log(`     ${entry.description}\n`);
    } else {
      console.log(`  ❌ LEDGER MISSING — Webhook did not create entry for Stripe session: ${license.stripeId}`);
      console.log('     Check: stripe listen --forward-to localhost:3000/api/stripe/webhook\n');
    }
  }
}

verifyLedger()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
