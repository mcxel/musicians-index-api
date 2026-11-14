/**
 * runLeaderboardTruthAndCameraPhysics.test.ts
 *
 * P0 Certification Suite:
 * - LEADERBOARD TRUTH PURGE (Elimination of artificial bot / seed scores)
 * - CAMERA ORIENTATION & MIRRORING PHYSICS (Dynamic mobile rotation & front/rear laws)
 *
 * Gates Covered:
 * LEADER-TRUTH-01…10, CAM-ORI-01…15
 */

import { readFileSync } from "fs";
import path from "path";
import {
  classifyParticipant,
  isCompetitiveEligible,
  purgeAndRankHumanLeaderboard,
} from "../lib/rankings/LeaderboardTruthDirector";
import {
  calculateCameraPreviewPhysics,
  resolveDeviceScreenAngle,
} from "../lib/camera/CameraOrientationPhysicsDirector";
import { isRankedEligible, type PerformerIdentity } from "../lib/performers/PerformerRegistry";

const root = path.resolve(__dirname, "../..");

function readSrc(relPath: string): string {
  return readFileSync(path.join(root, relPath), "utf8");
}

describe("P0 Leaderboard Truth Purge — Eliminating Artificial Bot/Seed Scores", () => {
  const votePageSrc = readSrc("src/app/vote/page.tsx");
  const performerRegistrySrc = readSrc("src/lib/performers/PerformerRegistry.ts");
  const snapshotSrc = readSrc("src/lib/rankings/UniversalRankingSnapshot.ts");

  test("LEADER-TRUTH-01…04: Proven seed and bot identities are classified and excluded", () => {
    // Wavetek
    expect(classifyParticipant({ id: "wavetek", name: "Wavetek" })).toBe("SEED");
    expect(isCompetitiveEligible({ id: "wavetek", name: "Wavetek" })).toBe(false);

    // Zuri Bloom
    expect(classifyParticipant({ id: "zuri-bloom", name: "Zuri Bloom" })).toBe("SEED");
    expect(isCompetitiveEligible({ id: "zuri-bloom", name: "Zuri Bloom" })).toBe(false);

    // Krypt
    expect(classifyParticipant({ id: "krypt", name: "Krypt" })).toBe("SEED");
    expect(isCompetitiveEligible({ id: "krypt", name: "Krypt" })).toBe(false);

    // Explicit bots
    expect(classifyParticipant({ id: "bot:eng-02", name: "[BOT] Apex" })).toBe("BOT");
    expect(isCompetitiveEligible({ id: "bot:eng-02", name: "[BOT] Apex" })).toBe(false);

    // QA / Test accounts
    expect(classifyParticipant({ id: "test-user-99", name: "QA Tester" })).toBe("QA_AUTOMATION");
    expect(isCompetitiveEligible({ id: "test-user-99", name: "QA Tester" })).toBe(false);
  });

  test("LEADER-TRUTH-05…08: Real human scores preserved and re-ranked sequentially", () => {
    const candidates = [
      { id: "wavetek", name: "Wavetek", score: 98400, isSeed: true },
      { id: "human-marcel", name: "Marcel Real", score: 12500, rankingEligible: true },
      { id: "zuri-bloom", name: "Zuri Bloom", score: 85000, isSeed: true },
      { id: "human-alice", name: "Alice Singer", score: 19800, rankingEligible: true },
      { id: "bot:001", name: "[BOT] Filler", score: 50000, isBot: true },
    ];

    const { rankedEntries, excludedEntries } = purgeAndRankHumanLeaderboard(candidates);

    // Excluded bots & seeds
    expect(excludedEntries).toHaveLength(3);
    expect(excludedEntries.map((e) => e.id)).toEqual(["wavetek", "zuri-bloom", "bot:001"]);

    // Ranked humans ONLY
    expect(rankedEntries).toHaveLength(2);
    expect(rankedEntries[0].id).toBe("human-alice");
    expect(rankedEntries[0].rank).toBe(1); // Takes #1 Crown
    expect(rankedEntries[0].badge).toBe("CROWN");
    expect(rankedEntries[0].classification).toBe("REAL_HUMAN");

    expect(rankedEntries[1].id).toBe("human-marcel");
    expect(rankedEntries[1].rank).toBe(2);
    expect(rankedEntries[1].badge).toBe("TOP 5");
  });

  test("LEADER-TRUTH-09 & 10: PerformerRegistry & VotePage enforce truth authority", () => {
    // PerformerRegistry excludes seeds from isRankedEligible
    const fakePerformer = {
      id: "fake-bot",
      slug: "fake-bot",
      name: "Fake Bot",
      profileImageUrl: "/bot-images/Bot image 1.png",
      coverImageUrl: "/tmi-curated/mag-20.jpg",
      city: "Atlanta",
      countryName: "USA",
      flag: "🇺🇸",
      category: "Hip-Hop" as const,
      tier: "Diamond" as const,
      rank: 1,
      xp: 50000,
      fanCount: 100,
      likes: 100,
      isLive: false,
      audienceCount: 0,
      timeLive: "0m",
      roomId: "room-fake",
      achievementIds: [],
      profileRoute: "/performers/fake-bot",
      liveRoomRoute: "/live/rooms/room-fake",
      articleIds: [],
    };
    expect(isRankedEligible(fakePerformer)).toBe(false);

    // VotePage uses purgeAndRankHumanLeaderboard
    expect(votePageSrc).toContain("purgeAndRankHumanLeaderboard");
    expect(votePageSrc).not.toMatch(
      /const CROWN_LEADERBOARD\s*=\s*\[\s*\{\s*rank:\s*1,\s*name:\s*"Wavetek"/,
    );

    // UniversalRankingSnapshot disallows bots by default in competitive candidates
    expect(snapshotSrc).toContain("options: { allowBots?: boolean } = { allowBots: false }");
  });
});

describe("P0 Mobile Camera Orientation Physics & Mirroring Law", () => {
  const selfCamSrc = readSrc("src/components/live/SelfViewCamera.tsx");
  const localCamSrc = readSrc("src/components/live/LocalCameraFeed.tsx");
  const hookSrc = readSrc("src/hooks/useCameraOrientationPhysics.ts");

  test("CAM-ORI-01…03: Front camera preview receives natural mirror across all orientations", () => {
    // Portrait (0°)
    const portrait = calculateCameraPreviewPhysics({
      facingMode: "user",
      screenAngle: 0,
      isSelfPreview: true,
    });
    expect(portrait.transform).toBe("scaleX(-1)");
    expect(portrait.isMirrored).toBe(true);

    // Landscape Left (90°)
    const landscapeLeft = calculateCameraPreviewPhysics({
      facingMode: "user",
      screenAngle: 90,
      isSelfPreview: true,
    });
    expect(landscapeLeft.transform).toBe("scaleX(-1)");
    expect(landscapeLeft.isMirrored).toBe(true);

    // Landscape Right (270°)
    const landscapeRight = calculateCameraPreviewPhysics({
      facingMode: "user",
      screenAngle: 270,
      isSelfPreview: true,
    });
    expect(landscapeRight.transform).toBe("scaleX(-1)");
    expect(landscapeRight.isMirrored).toBe(true);
  });

  test("CAM-ORI-04…06: Rear camera NEVER receives selfie mirroring (truth-to-world)", () => {
    // Portrait Rear
    const portraitRear = calculateCameraPreviewPhysics({
      facingMode: "environment",
      screenAngle: 0,
      isSelfPreview: true,
    });
    expect(portraitRear.transform).toBe("none");
    expect(portraitRear.isMirrored).toBe(false);

    // Landscape Rear
    const landscapeRear = calculateCameraPreviewPhysics({
      facingMode: "environment",
      screenAngle: 90,
      isSelfPreview: true,
    });
    expect(landscapeRear.transform).toBe("none");
    expect(landscapeRear.isMirrored).toBe(false);
  });

  test("CAM-ORI-07 & 08: Remote broadcast output does NOT inherit selfie preview mirror", () => {
    const remoteOutput = calculateCameraPreviewPhysics({
      facingMode: "user",
      screenAngle: 0,
      isSelfPreview: false, // Broadcast consumer
    });
    expect(remoteOutput.transform).toBe("none");
    expect(remoteOutput.isMirrored).toBe(false);
  });

  test("CAM-ORI-09…15: Components integrate reactive useCameraOrientationPhysics hook", () => {
    expect(selfCamSrc).toContain("useCameraOrientationPhysics");
    expect(selfCamSrc).toContain("orientationPhysics.transform");
    expect(localCamSrc).toContain("useCameraOrientationPhysics");
    expect(localCamSrc).toContain("orientationPhysics.transform");
    expect(hookSrc).toContain("addEventListener(\"orientationchange\"");
    expect(hookSrc).toContain("window.screen.orientation.addEventListener(\"change\"");
  });
});
