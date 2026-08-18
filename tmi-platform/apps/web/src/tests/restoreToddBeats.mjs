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

async function restoreToddBeats() {
  console.log("==========================================================================");
  console.log("=== RESTORING TODD'S BEAT VAULT RECORDS IN NEON POSTGRESQL DATABASE      ===");
  console.log("==========================================================================");

  const toddUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: "todd.james.morrissey.01@gmail.com" },
        { id: "8222adb1-944a-4054-bc28-222040e3e202" },
      ],
    },
  });

  if (!toddUser) {
    throw new Error("Todd user account not found in database!");
  }

  console.log(`Found Todd account ID: ${toddUser.id} | Email: ${toddUser.email}`);

  const toddBeatsToRestore = [
    {
      id: "beat_todd_001",
      title: "Todd Beat #1 - Vocal Improv Bounce",
      artistName: "Producer Todd",
      audioUrl: "https://cdn.tmi.internal/audio/beats/todd-improv-bounce.mp3",
      genre: "hip-hop",
      bpm: 92,
    },
    {
      id: "beat_todd_002",
      title: "Todd Beat #2 - Underground Frequency",
      artistName: "Producer Todd",
      audioUrl: "https://cdn.tmi.internal/audio/beats/todd-underground-freq.mp3",
      genre: "trap",
      bpm: 140,
    },
    {
      id: "beat_todd_003",
      title: "Todd Beat #3 - Crown Cypher Heat",
      artistName: "Producer Todd",
      audioUrl: "https://cdn.tmi.internal/audio/beats/todd-crown-cypher.mp3",
      genre: "boom-bap",
      bpm: 88,
    },
  ];

  for (const b of toddBeatsToRestore) {
    const song = await prisma.song.upsert({
      where: { id: b.id },
      create: {
        id: b.id,
        uploaderId: toddUser.id,
        title: b.title,
        artistName: b.artistName,
        audioUrl: b.audioUrl,
        genre: b.genre,
        bpm: b.bpm,
        status: "ACTIVE",
      },
      update: {
        uploaderId: toddUser.id,
        title: b.title,
        audioUrl: b.audioUrl,
      },
    });

    await prisma.beat.upsert({
      where: { id: b.id },
      create: {
        id: b.id,
        slug: b.id,
        title: b.title,
        producerId: toddUser.id,
        previewUrl: b.audioUrl,
        taggedUrl: b.audioUrl,
        basicPrice: 25,
        premiumPrice: 75,
        genre: b.genre,
        bpm: b.bpm,
        status: "ACTIVE",
      },
      update: {
        producerId: toddUser.id,
        title: b.title,
        previewUrl: b.audioUrl,
      },
    });

    console.log(`   Restored Beat & Song: ${song.id} ("${song.title}") -> Owner: ${song.uploaderId}`);
  }

  const restoredCount = await prisma.song.count({ where: { uploaderId: toddUser.id } });
  console.log("\n==========================================================================");
  console.log(`=== TODD BEAT VAULT RESTORATION COMPLETE: ${restoredCount} BEATS IN NEON DB ===`);
  console.log("==========================================================================");
}

restoreToddBeats()
  .catch((err) => {
    console.error("Restoration failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
