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

async function auditToddBeats() {
  console.log("==========================================================================");
  console.log("=== TODD BEAT VAULT AUDIT: NEON POSTGRESQL DATABASE SEARCH              ===");
  console.log("==========================================================================");

  // 1. Search Users matching "todd", "producer", "bjm", "performer"
  console.log("\n1. Searching Users in Neon DB...");
  const users = await prisma.user.findMany({
    include: { userProfile: true },
  });
  console.log(`   Found ${users.length} total user records:`);
  for (const u of users) {
    console.log(`   - User ID: ${u.id} | Email: ${u.email} | DisplayName: ${u.userProfile?.displayName ?? "N/A"}`);
  }

  // 2. Search Songs in Neon DB
  console.log("\n2. Searching Songs table in Neon DB...");
  const songs = await prisma.song.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  console.log(`   Total Songs found in database: ${songs.length}`);
  for (const s of songs) {
    console.log(`   - Song ID: ${s.id} | Title: "${s.title}" | Artist: "${s.artistName ?? s.artist ?? "N/A"}" | Uploader: ${s.uploaderId} | URL: ${s.audioUrl}`);
  }

  // 3. Search Beats table (G-MED model) in Neon DB
  console.log("\n3. Searching Beats table (G-MED model) in Neon DB...");
  try {
    const beats = await prisma.beat.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    console.log(`   Total Beat rows found in database: ${beats.length}`);
    for (const b of beats) {
      console.log(`   - Beat ID: ${b.id} | Title: "${b.title}" | Producer: ${b.producerId || b.uploaderId || "N/A"} | URL: ${b.audioUrl || b.fileUrl || "N/A"}`);
    }
  } catch (err) {
    console.log("   Prisma beat model query warning:", err.message);
  }

  // 4. Search BeatAssignments
  console.log("\n4. Searching BeatAssignments in Neon DB...");
  try {
    const assignments = await prisma.beatAssignment.findMany({
      take: 20,
    });
    console.log(`   Total BeatAssignments found: ${assignments.length}`);
    for (const ba of assignments) {
      console.log(`   - Room: ${ba.roomId} | Beat ID: ${ba.beatId} | AssignedBy: ${ba.assignedBy}`);
    }
  } catch (err) {
    console.log("   BeatAssignment query warning:", err.message);
  }

  // 5. Total count summary across all media tables
  const totalSongs = await prisma.song.count();
  const totalUsers = await prisma.user.count();
  const totalPlaylists = await prisma.playlist.count();

  console.log("\n==========================================================================");
  console.log("=== DB SUMMARY: Total Users:", totalUsers, "| Total Songs:", totalSongs, "| Total Playlists:", totalPlaylists);
  console.log("==========================================================================");
}

auditToddBeats()
  .catch((err) => {
    console.error("Audit failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
