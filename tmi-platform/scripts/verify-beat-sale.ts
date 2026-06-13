const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyLedger() {
  console.log("🔍 Scanning TMI Database for Recent Beat Sales & Ledger Credits...\n");

  const recentLicenses = await prisma.beatLicense.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      beat: true
    }
  });

  if (recentLicenses.length === 0) {
    console.log("⚠️ No recent beat licenses found. Make sure you complete the Stripe Checkout first!");
    return;
  }

  for (const license of recentLicenses) {
    console.log(`[LICENSE PURCHASED] Beat: "${license.beat.title}" | Type: ${license.type} | Price: $${(license.price / 100).toFixed(2)}`);
    
    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where: { relatedId: license.stripeId }
    });

    if (ledgerEntries.length > 0) {
      const entry = ledgerEntries[0];
      console.log(`✅ [LEDGER CREDITED] Producer ID: ${entry.userId} received $${(entry.amount / 100).toFixed(2)} (${entry.type})`);
      console.log(`   Description: ${entry.description}\n`);
    } else {
      console.log(`❌ [LEDGER MISSING] Webhook did not create a ledger entry for Session ID: ${license.stripeId}\n`);
    }
  }
}

verifyLedger().finally(() => prisma.$disconnect());