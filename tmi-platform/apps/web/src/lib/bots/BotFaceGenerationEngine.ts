import {
  registerBotFaceIdentity,
  type BotFaceRegistryRecord,
  type BotIdentityRole,
} from "@/lib/bots/BotFaceRegistry";
import { createBotIdentityProfile, type BotIdentityProfile } from "@/lib/bots/BotIdentityProfileEngine";
import { generateBotFaceVariation, type BotFaceVariation } from "@/lib/bots/BotFaceVariationEngine";
import { generateBotExpressionAssets, type BotExpressionAsset } from "@/lib/bots/BotExpressionEngine";
import { generateBotMotionPortraitLoops, type BotMotionLoop } from "@/lib/bots/BotMotionPortraitEngine";

export type BotFaceAssetSuite = {
  botId: string;
  profile: BotIdentityProfile;
  variation: BotFaceVariation;
  faceImage: string;
  portraitImage: string;
  profileImage: string;
  bannerPortrait: string;
  cardPortrait: string;
  roomCard: string;
  activityBadge: string;
  expressionSet: BotExpressionAsset[];
  motionPortraits: BotMotionLoop[];
  faceHash: string;
  profileHash: string;
  motionHash: string;
  registryRecord: BotFaceRegistryRecord;
};

function stableHash(input: string): string {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = (hash * 16777619) >>> 0;
  }
  return `h_${hash.toString(16).padStart(8, "0")}`;
}

function buildRefs(botId: string, faceHash: string, profileHash: string): {
  faceImage: string;
  portraitImage: string;
  profileImage: string;
  bannerPortrait: string;
  cardPortrait: string;
  roomCard: string;
  activityBadge: string;
} {
  return {
    faceImage: `/generated/bots/${botId}/face/${faceHash}.webp`,
    portraitImage: `/generated/bots/${botId}/portrait/${profileHash}.webp`,
    profileImage: `/generated/bots/${botId}/profile/${profileHash}.webp`,
    bannerPortrait: `/generated/bots/${botId}/banner/${profileHash}.webp`,
    cardPortrait: `/generated/bots/${botId}/card/${profileHash}.webp`,
    roomCard: `/generated/bots/${botId}/room-card/${profileHash}.webp`,
    activityBadge: `/generated/bots/${botId}/badges/${profileHash}.webp`,
  };
}

export function generateUniqueBotFaceAssets(input: {
  botId: string;
  role: BotIdentityRole;
  seed?: string;
  rankSlot?: number;
}): BotFaceAssetSuite {
  const baseSeed = input.seed ?? `${input.botId}:${input.role}:${Date.now()}`;

  let attempt = 0;
  let profile: BotIdentityProfile | null = null;
  let variation: BotFaceVariation | null = null;
  let faceHash = "";
  let profileHash = "";

  while (attempt < 12) {
    const seeded = `${baseSeed}:a${attempt}`;
    profile = createBotIdentityProfile({
      botId: input.botId,
      role: input.role,
      seed: seeded,
      rankSlot: input.rankSlot,
    });
    variation = generateBotFaceVariation(seeded, input.role);
    faceHash = stableHash(`${seeded}:${profile.name}:${variation.style}:${variation.pose}:${variation.hair}`);
    profileHash = stableHash(`${faceHash}:${profile.personality}:${profile.activityType}`);

    try {
      const motionPortraitsProbe = generateBotMotionPortraitLoops({
        botId: input.botId,
        faceHash,
        style: profile.style,
      });
      const motionHashProbe = stableHash(motionPortraitsProbe.map((entry) => entry.motionHash).join("|"));
      const record = registerBotFaceIdentity({
        botId: input.botId,
        role: input.role,
        generated: true,
        synthetic: true,
        source: "bot_face_generation_engine",
        faceHash,
        profileHash,
        motionHash: motionHashProbe,
        usage: ["profile"],
        metadata: {
          name: profile.name,
          personality: profile.personality,
          style: profile.style,
        },
      });

      const refs = buildRefs(input.botId, faceHash, profileHash);
      const expressionSet = generateBotExpressionAssets({
        botId: input.botId,
        baseSeed: faceHash,
        style: profile.style,
      });
      const motionPortraits = generateBotMotionPortraitLoops({
        botId: input.botId,
        faceHash,
        style: profile.style,
      });

      return {
        botId: input.botId,
        profile,
        variation,
        ...refs,
        expressionSet,
        motionPortraits,
        faceHash,
        profileHash,
        motionHash: motionHashProbe,
        registryRecord: record,
      };
    } catch {
      attempt += 1;
    }
  }

  throw new Error(`bot-face-generation-failed:${input.botId}`);
}

const SAMPLE_BOT_ROLES: BotIdentityRole[] = [
  "artist-bot",
  "performer-bot",
  "fan-bot",
  "host-bot",
  "venue-bot",
  "sponsor-bot",
  "advertiser-bot",
  "big-ace-support-bot",
];

export function ensureSampleBotIdentityFaces(): BotFaceAssetSuite[] {
  const generated: BotFaceAssetSuite[] = [];
  for (let index = 0; index < SAMPLE_BOT_ROLES.length; index += 1) {
    const botId = `synthetic-bot-${index + 1}`;
    try {
      const suite = generateUniqueBotFaceAssets({
        botId,
        role: SAMPLE_BOT_ROLES[index] as BotIdentityRole,
        seed: `seed-${botId}`,
        rankSlot: index + 1,
      });
      generated.push(suite);
    } catch {
      continue;
    }
  }
  return generated;
}

