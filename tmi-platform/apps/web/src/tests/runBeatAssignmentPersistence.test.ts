const fs = require("fs");
const path = require("path");

// Load .env if DATABASE_URL is missing
if (!process.env.DATABASE_URL) {
  try {
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
  } catch (err) {
    /* ignore */
  }
}

const {
  persistBeatAssignmentToDb,
  restoreBeatAssignmentFromDb,
  deleteBeatAssignmentFromDb,
  attachCompetitionBeat,
} = require("../lib/competition/CompetitionBeatRoomEngine");

async function run() {
  console.log("=== RUNNING G-MED BEAT ASSIGNMENT PERSISTENCE TEST ===");

  const testRoomId = `room-gmed-test-${Date.now()}`;
  const testBeat = {
    beatId: `beat-todd-${Date.now()}`,
    title: "Todd Midnight Cypher Beat",
    genre: "Hip-Hop",
    bpm: 94,
    audioUrl: "/audio/beats/todd-cypher.mp3",
    producerName: "ProducerTodd",
    source: "beat-locker",
  };

  // 1. Attach in memory & persist to Prisma DB
  console.log(`1. Attaching beat ${testBeat.beatId} to room ${testRoomId}...`);
  const attachRes = attachCompetitionBeat({
    roomId: testRoomId,
    lane: "battle",
    beat: testBeat,
  });
  if (!attachRes.ok || !attachRes.state?.attached) {
    throw new Error(`Attach beat failed: ${attachRes.error}`);
  }
  console.log("   Attach in memory: SUCCESS");

  const dbSaved = await persistBeatAssignmentToDb({
    roomId: testRoomId,
    lane: "battle",
    beat: attachRes.state.attached,
    assignedBy: "todd_user_id",
  });
  console.log(`   Persist to DB: ${dbSaved ? "SUCCESS" : "FAILED"}`);
  if (!dbSaved) throw new Error("Database persistence failed");

  // 2. Restore from DB (simulating server restart / process recycle)
  console.log("2. Restoring assignment directly from DB...");
  const restored = await restoreBeatAssignmentFromDb(testRoomId);
  if (!restored) {
    throw new Error("Failed to restore BeatAssignment from DB");
  }
  console.log("   Restored beatId:", restored.beatId);
  console.log("   Restored title:", restored.title);
  console.log("   Restored audioUrl:", restored.audioUrl);

  if (restored.beatId !== testBeat.beatId) {
    throw new Error(`beatId mismatch: expected ${testBeat.beatId}, got ${restored.beatId}`);
  }
  if (restored.audioUrl !== testBeat.audioUrl) {
    throw new Error(`audioUrl mismatch: expected ${testBeat.audioUrl}, got ${restored.audioUrl}`);
  }

  // 3. Clean up test record
  console.log("3. Deleting assignment from DB...");
  const deleted = await deleteBeatAssignmentFromDb(testRoomId);
  console.log(`   Deleted from DB: ${deleted ? "SUCCESS" : "FAILED"}`);

  console.log("=== G-MED PERSISTENCE TEST PASSED 100% CLEAN ===");
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
