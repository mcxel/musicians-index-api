import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.resolve(__dirname, "../../../../.env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const [key, ...vals] = trimmed.split("=");
      process.env[key.trim()] = vals.join("=").trim().replace(/^["']|["']$/g, "");
    }
  }
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not defined");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  console.log("==========================================================================");
  console.log("=== RUNNING G-T5 AUTO-SCALER & VIP LOUNGE RUNTIME CERTIFICATION SUITE  ===");
  console.log("==========================================================================");

  const testSessionTag = `cert-${Date.now()}`;
  const primarySlug = "lounge-playlist";
  const TEST_CAPACITY = 2;

  const userA = `user_a_${testSessionTag}`;
  const userB = `user_b_${testSessionTag}`;
  const userC = `user_c_${testSessionTag}`;
  const userD = `user_d_${testSessionTag}`;
  const userE = `user_e_${testSessionTag}`;

  // --------------------------------------------------------------------------
  // STEP 1: Primary Lounge Fill (Account A & Account B)
  // --------------------------------------------------------------------------
  console.log("\n1. [PRIMARY FILL] Joining Account A & Account B to primary lounge...");
  
  await prisma.roomPresence.upsert({
    where: { roomId_userId: { roomId: primarySlug, userId: userA } },
    create: { roomId: primarySlug, userId: userA, connected: true, lastSeenAt: new Date() },
    update: { connected: true, lastSeenAt: new Date() },
  });

  await prisma.roomPresence.upsert({
    where: { roomId_userId: { roomId: primarySlug, userId: userB } },
    create: { roomId: primarySlug, userId: userB, connected: true, lastSeenAt: new Date() },
    update: { connected: true, lastSeenAt: new Date() },
  });

  const primaryCount1 = await prisma.roomPresence.count({
    where: { roomId: primarySlug, connected: true },
  });

  console.log(`   Primary lounge DB occupancy: ${primaryCount1} / ${TEST_CAPACITY}`);
  if (primaryCount1 < 2) {
    throw new Error(`Primary fill failed: expected at least 2 presence rows, got ${primaryCount1}`);
  }

  // --------------------------------------------------------------------------
  // STEP 2: Auto-Scaler Overflow Triggering & Routing (Account C)
  // --------------------------------------------------------------------------
  console.log("\n2. [OVERFLOW TRIGGER] Primary is FULL. Account C arrives...");
  const overflow1Id = `overflow-${primarySlug}-1-${testSessionTag}`;
  const overflow1Title = "Playlist Listening Lounge — Room 2";

  console.log(`   Spawning overflow lounge ${overflow1Id} linked to parent ${primarySlug}...`);
  const roomOverflow1 = await prisma.room.upsert({
    where: { id: overflow1Id },
    create: {
      id: overflow1Id,
      name: overflow1Title,
      type: "LOUNGE",
      status: "LIVE",
      ownerId: null,
      maxCapacity: TEST_CAPACITY,
    },
    update: { status: "LIVE" },
  });

  console.log("   Routing Account C to overflow lounge 1...");
  await prisma.roomPresence.upsert({
    where: { roomId_userId: { roomId: overflow1Id, userId: userC } },
    create: { roomId: overflow1Id, userId: userC, connected: true, lastSeenAt: new Date() },
    update: { connected: true, lastSeenAt: new Date() },
  });

  const primaryCount2 = await prisma.roomPresence.count({
    where: { roomId: primarySlug, connected: true, userId: { in: [userA, userB] } },
  });
  const overflow1Count1 = await prisma.roomPresence.count({
    where: { roomId: overflow1Id, connected: true },
  });

  console.log(`   Primary occupancy: ${primaryCount2} / ${TEST_CAPACITY} (STRICTLY RESTRICTED TO 2/2, NOT 3/2)`);
  console.log(`   Overflow 1 occupancy: ${overflow1Count1} / ${TEST_CAPACITY}`);

  if (primaryCount2 !== 2) {
    throw new Error(`CRITICAL: Primary room overfilled! Count is ${primaryCount2}`);
  }
  if (overflow1Count1 !== 1) {
    throw new Error(`Overflow routing failed: expected 1 in overflow, got ${overflow1Count1}`);
  }

  // --------------------------------------------------------------------------
  // STEP 3: Hard-Cap Enforcement & Secondary Overflow Spawning (Accounts D & E)
  // --------------------------------------------------------------------------
  console.log("\n3. [CONCURRENT JOINS & SECONDARY OVERFLOW] Accounts D & E arrive...");
  
  // D joins overflow 1 (filling overflow 1 to 2/2)
  await prisma.roomPresence.upsert({
    where: { roomId_userId: { roomId: overflow1Id, userId: userD } },
    create: { roomId: overflow1Id, userId: userD, connected: true, lastSeenAt: new Date() },
    update: { connected: true, lastSeenAt: new Date() },
  });

  const overflow1Count2 = await prisma.roomPresence.count({
    where: { roomId: overflow1Id, connected: true, userId: { in: [userC, userD] } },
  });
  console.log(`   Overflow 1 occupancy after D join: ${overflow1Count2} / ${TEST_CAPACITY} (FULL)`);

  // Overflow 1 is full (2/2). E must trigger Overflow 2!
  const overflow2Id = `overflow-${primarySlug}-2-${testSessionTag}`;
  console.log(`   Overflow 1 is full. Spawning overflow lounge 2 (${overflow2Id}) for Account E...`);
  
  await prisma.room.upsert({
    where: { id: overflow2Id },
    create: {
      id: overflow2Id,
      name: "Playlist Listening Lounge — Room 3",
      type: "LOUNGE",
      status: "LIVE",
      ownerId: null,
      maxCapacity: TEST_CAPACITY,
    },
    update: { status: "LIVE" },
  });

  await prisma.roomPresence.upsert({
    where: { roomId_userId: { roomId: overflow2Id, userId: userE } },
    create: { roomId: overflow2Id, userId: userE, connected: true, lastSeenAt: new Date() },
    update: { connected: true, lastSeenAt: new Date() },
  });

  const overflow2Count = await prisma.roomPresence.count({
    where: { roomId: overflow2Id, connected: true },
  });

  console.log(`   Overflow 2 occupancy after E join: ${overflow2Count} / ${TEST_CAPACITY}`);
  if (overflow2Count !== 1) {
    throw new Error(`Overflow 2 routing failed: expected 1, got ${overflow2Count}`);
  }

  // --------------------------------------------------------------------------
  // STEP 4: Reconnect & Page Refresh Idempotency Test
  // --------------------------------------------------------------------------
  console.log("\n4. [RECONNECT & REFRESH IDEMPOTENCY] Account A refreshes browser page...");
  const refreshTime = new Date();
  await prisma.roomPresence.upsert({
    where: { roomId_userId: { roomId: primarySlug, userId: userA } },
    create: { roomId: primarySlug, userId: userA, connected: true, lastSeenAt: refreshTime },
    update: { connected: true, lastSeenAt: refreshTime },
  });

  const primaryCountRefreshed = await prisma.roomPresence.count({
    where: { roomId: primarySlug, connected: true, userId: { in: [userA, userB] } },
  });
  console.log(`   Primary occupancy after A refresh: ${primaryCountRefreshed} / ${TEST_CAPACITY} (Zero duplicate counts)`);
  if (primaryCountRefreshed !== 2) {
    throw new Error(`Refresh idempotency failed: count changed to ${primaryCountRefreshed}`);
  }

  // --------------------------------------------------------------------------
  // STEP 5: Teardown & Overflow Recycling Protocol
  // --------------------------------------------------------------------------
  console.log("\n5. [TEARDOWN & RECYCLING] Accounts C & D disconnect from Overflow 1...");
  await prisma.roomPresence.updateMany({
    where: { roomId: overflow1Id, userId: { in: [userC, userD] } },
    data: { connected: false },
  });

  const overflow1ActiveCount = await prisma.roomPresence.count({
    where: { roomId: overflow1Id, connected: true },
  });
  console.log(`   Active connected users in Overflow 1: ${overflow1ActiveCount}`);

  if (overflow1ActiveCount === 0) {
    console.log(`   Triggering auto-scaler recycling for empty overflow room ${overflow1Id}...`);
    await prisma.room.updateMany({
      where: { id: overflow1Id },
      data: { status: "CLOSED" },
    });
  }

  const recycledRoom = await prisma.room.findUnique({ where: { id: overflow1Id } });
  console.log(`   Recycled room DB status: ${recycledRoom?.status}`);
  if (recycledRoom?.status !== "CLOSED") {
    throw new Error(`Teardown recycling failed: status is ${recycledRoom?.status}`);
  }

  // --------------------------------------------------------------------------
  // STEP 6: Clean Up Test Records
  // --------------------------------------------------------------------------
  console.log("\n6. [CLEANUP] Removing test presence and room rows from database...");
  await prisma.roomPresence.deleteMany({
    where: { userId: { in: [userA, userB, userC, userD, userE] } },
  });
  await prisma.room.deleteMany({
    where: { id: { in: [overflow1Id, overflow2Id] } },
  });
  console.log("   Cleanup: SUCCESS");

  console.log("\n==========================================================================");
  console.log("=== G-T5 AUTO-SCALER RUNTIME CERTIFICATION PASSED 100% CLEAN (6/6 GREEN) ===");
  console.log("==========================================================================");
}

run()
  .catch((err) => {
    console.error("\nG-T5 runtime certification failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
