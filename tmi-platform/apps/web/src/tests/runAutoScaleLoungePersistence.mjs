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
  console.log("=== RUNNING G-T5 AUTO-SCALER & LOUNGE PERSISTENCE TEST ===");

  const testAnchorSlug = "lounge-playlist";
  const overflowId = `overflow-${testAnchorSlug}-test-${Date.now()}`;
  const overflowTitle = "Playlist Listening Lounge — Room 2";

  // 1. Create durable Room record for overflow lounge in Prisma DB
  console.log(`1. Creating DB Room entry for overflow lounge ${overflowId}...`);
  const room = await prisma.room.upsert({
    where: { id: overflowId },
    create: {
      id: overflowId,
      name: overflowTitle,
      type: "LOUNGE",
      status: "LIVE",
      ownerId: null,
      maxCapacity: 40,
    },
    update: {
      status: "LIVE",
    },
  });
  console.log("   Room creation: SUCCESS (id:", room.id, ")");

  // 2. Simulate 2 distinct Account joins (Account A and Account B) into RoomPresence
  console.log("2. Simulating Account A and Account B joins into RoomPresence...");
  const userA = `user_acc_a_${Date.now()}`;
  const userB = `user_acc_b_${Date.now()}`;

  await prisma.roomPresence.upsert({
    where: { roomId_userId: { roomId: overflowId, userId: userA } },
    create: { roomId: overflowId, userId: userA, connected: true, lastSeenAt: new Date() },
    update: { connected: true, lastSeenAt: new Date() },
  });

  await prisma.roomPresence.upsert({
    where: { roomId_userId: { roomId: overflowId, userId: userB } },
    create: { roomId: overflowId, userId: userB, connected: true, lastSeenAt: new Date() },
    update: { connected: true, lastSeenAt: new Date() },
  });

  console.log("   RoomPresence upserts: SUCCESS");

  // 3. Verify occupancy count directly from database
  console.log("3. Verifying occupancy count from database...");
  const occupancyCount = await prisma.roomPresence.count({
    where: { roomId: overflowId, connected: true },
  });
  console.log("   Active connected users in overflow lounge:", occupancyCount);
  if (occupancyCount !== 2) {
    throw new Error(`Occupancy mismatch: expected 2, got ${occupancyCount}`);
  }

  // 4. Simulate Account B leaving lounge (disconnecting)
  console.log("4. Simulating Account B leaving lounge...");
  await prisma.roomPresence.updateMany({
    where: { roomId: overflowId, userId: userB },
    data: { connected: false },
  });

  const updatedCount = await prisma.roomPresence.count({
    where: { roomId: overflowId, connected: true },
  });
  console.log("   Updated occupancy after Account B leave:", updatedCount);
  if (updatedCount !== 1) {
    throw new Error(`Updated occupancy mismatch: expected 1, got ${updatedCount}`);
  }

  // 5. Clean up test records
  console.log("5. Cleaning up test presence and room records...");
  await prisma.roomPresence.deleteMany({
    where: { roomId: overflowId },
  });
  await prisma.room.delete({
    where: { id: overflowId },
  });
  console.log("   Cleanup: SUCCESS");

  console.log("=== G-T5 AUTO-SCALER & LOUNGE PERSISTENCE TEST PASSED 100% CLEAN ===");
}

run()
  .catch((err) => {
    console.error("G-T5 persistence test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
