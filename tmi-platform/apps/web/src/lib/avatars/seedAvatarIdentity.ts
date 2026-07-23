import { prisma } from "@/lib/prisma";
import { getAvatarProceduralDNA } from "./ProceduralStyleMatrix";

// Rule 26 Identity Policy: Avatar & Inventory is Fan-only. Callers must
// gate on role === "FAN" themselves — this helper does not check role so
// it stays reusable for the provisioning step and the lazy GET auto-seed
// in /api/avatar/profile without importing role logic twice.
export async function seedAvatarIdentity(userId: string) {
  const existing = await prisma.avatarIdentity.findUnique({
    where: { userId },
    include: {
      dna: true,
      progress: true,
      preferences: true,
      unlocks: true,
      memory: true,
      behaviorWeights: true,
      experienceJournal: true,
    },
  });
  if (existing) return existing;

  const dnaInfo = getAvatarProceduralDNA(userId);
  return prisma.avatarIdentity.create({
    data: {
      userId,
      dna: {
        create: {
          danceStyle: dnaInfo.swagger,
          reactionSpeed: dnaInfo.timingOffsetMs,
          confidence: dnaInfo.intensityMultiplier,
          introvertExtrovert: 0.5,
          idleStyle: "idle_breath",
          favoriteGenres: [],
          movementIntensity: dnaInfo.intensityMultiplier,
          eyeContactTendency: 0.75,
        },
      },
      progress: {
        create: {
          concertsAttended: 0,
          battlesWatched: 0,
          battlesEntered: 0,
          cyphersJoined: 0,
          challengesCompleted: 0,
          performancesGiven: 0,
          hoursInVenue: 0,
          streakDays: 0,
          supporterLevel: 1,
          xp: 0,
        },
      },
      preferences: {
        create: {
          primaryColor: "#FF2DAA",
          glowEnabled: true,
        },
      },
      memory: {
        create: {
          topPerformers: [],
          topVenues: [],
          frequentReactions: [],
        },
      },
      behaviorWeights: {
        create: {
          comedyAffinity: 0.5,
          danceAffinity: 0.5,
          competitionIntensity: 0.5,
          socialParticipation: 0.5,
          musicResponsiveness: 0.5,
          calmness: 0.5,
        },
      },
      unlocks: {
        create: {
          unlockKey: "CROWD_WAVE",
        },
      },
    },
    include: {
      dna: true,
      progress: true,
      preferences: true,
      unlocks: true,
      memory: true,
      behaviorWeights: true,
      experienceJournal: true,
    },
  });
}
