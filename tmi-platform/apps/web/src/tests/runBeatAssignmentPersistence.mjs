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
  console.log("=== RUNNING G-MED PRISMA BEAT ASSIGNMENT PERSISTENCE TEST ===");

  const testRoomId = `room-gmed-test-${Date.now()}`;
  const testBeatId = `beat-todd-${Date.now()}`;
  const audioUrl = "/audio/beats/todd-cypher.mp3";
  const title = "Todd Midnight Cypher Beat";

  // 1. Create canonical Beat row in Prisma DB
  console.log(`1. Upserting canonical Beat row ${testBeatId}...`);
  const beat = await prisma.beat.upsert({
    where: { id: testBeatId },
    create: {
      id: testBeatId,
      producerId: "todd_producer_id",
      producerName: "ProducerTodd",
      slug: `beat-${testBeatId.toLowerCase()}`,
      title,
      genre: "Hip-Hop",
      bpm: 94,
      previewUrl: audioUrl,
      taggedUrl: audioUrl,
      audioAssetUrl: audioUrl,
      basicPrice: 0,
      premiumPrice: 0,
      status: "PUBLISHED",
    },
    update: {
      title,
      audioAssetUrl: audioUrl,
    },
  });
  console.log("   Beat row upsert: SUCCESS (id:", beat.id, ")");

  // 2. Create BeatAssignment row linking beat to testRoomId
  console.log(`2. Creating BeatAssignment for room ${testRoomId}...`);
  const assignment = await prisma.beatAssignment.upsert({
    where: {
      beatId_targetType_targetId: {
        beatId: testBeatId,
        targetType: "battle",
        targetId: testRoomId,
      },
    },
    create: {
      beatId: testBeatId,
      targetType: "battle",
      targetId: testRoomId,
      assignedAt: new Date(),
    },
    update: {
      assignedAt: new Date(),
    },
  });
  console.log("   BeatAssignment upsert: SUCCESS (id:", assignment.id, ")");

  // 3. Query back BeatAssignment from DB (simulating server restart / process recycle)
  console.log("3. Restoring BeatAssignment from database...");
  const restored = await prisma.beatAssignment.findFirst({
    where: { targetId: testRoomId },
    include: { beat: true },
    orderBy: { assignedAt: "desc" },
  });

  if (!restored || !restored.beat) {
    throw new Error("Failed to restore BeatAssignment from database");
  }

  console.log("   Restored assignment targetId:", restored.targetId);
  console.log("   Restored beatId:", restored.beat.id);
  console.log("   Restored beat title:", restored.beat.title);
  console.log("   Restored audioUrl:", restored.beat.audioAssetUrl || restored.beat.previewUrl);

  if (restored.beat.id !== testBeatId) {
    throw new Error(`beatId mismatch: expected ${testBeatId}, got ${restored.beat.id}`);
  }

  // 4. Delete assignment & beat
  console.log("4. Cleaning up BeatAssignment record...");
  await prisma.beatAssignment.deleteMany({
    where: { targetId: testRoomId },
  });
  await prisma.beat.delete({
    where: { id: testBeatId },
  });
  console.log("   Cleanup: SUCCESS");

  console.log("=== G-MED PERSISTENCE TEST PASSED 100% CLEAN ===");
}

run()
  .catch((err) => {
    console.error("G-MED persistence test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
