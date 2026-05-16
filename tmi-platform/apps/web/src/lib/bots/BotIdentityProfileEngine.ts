import type { BotIdentityRole } from "@/lib/bots/BotFaceRegistry";

export type BotIdentityProfile = {
  botId: string;
  generatedIdentity: true;
  syntheticBot: true;
  generated: true;
  synthetic: true;
  source: "bot_face_generation_engine";
  face: string;
  name: string;
  style: string;
  role: BotIdentityRole;
  personality: string;
  visualTraits: string[];
  rankSlot: number;
  activityType: string;
  createdAt: number;
};

const identityMap = new Map<string, BotIdentityProfile>();

const FIRST_NAMES = ["Nova", "Cipher", "Echo", "Rift", "Kairo", "Lumi", "Zane", "Aria", "Vex", "Sora"];
const LAST_NAMES = ["Pulse", "Orbit", "Flux", "Vector", "Spark", "Rhythm", "Signal", "Neon", "Phase", "Core"];

const PERSONALITIES = [
  "analytical",
  "charismatic",
  "focused",
  "playful",
  "competitive",
  "supportive",
  "curious",
  "disciplined",
];

const STYLES = ["neon-editorial", "retro-zine", "street-future", "studio-clean", "performance-glow"];
const ACTIVITY_TYPES = ["streaming", "chatting", "ranking", "voting", "tipping", "moderating", "hosting"];

function hash(seed: string): number {
  let value = 0;
  for (let index = 0; index < seed.length; index += 1) {
    value = (value * 37 + seed.charCodeAt(index)) >>> 0;
  }
  return value;
}

function pick<T>(seed: number, values: readonly T[], shift: number): T {
  return values[(seed + shift) % values.length] as T;
}

export function createBotIdentityProfile(input: {
  botId: string;
  role: BotIdentityRole;
  seed: string;
  rankSlot?: number;
}): BotIdentityProfile {
  const h = hash(`${input.seed}:${input.role}:${input.botId}`);
  const first = pick(h, FIRST_NAMES, 3);
  const last = pick(h, LAST_NAMES, 11);
  const style = pick(h, STYLES, 17);
  const personality = pick(h, PERSONALITIES, 23);
  const activityType = pick(h, ACTIVITY_TYPES, 29);
  const rankSlot = input.rankSlot ?? ((h % 20) + 1);

  const profile: BotIdentityProfile = {
    botId: input.botId,
    generatedIdentity: true,
    syntheticBot: true,
    generated: true,
    synthetic: true,
    source: "bot_face_generation_engine",
    face: `/generated/bots/${input.botId}/face-${h.toString(16)}.webp`,
    name: `${first} ${last}`,
    style,
    role: input.role,
    personality,
    visualTraits: [style, personality, activityType],
    rankSlot,
    activityType,
    createdAt: Date.now(),
  };
  identityMap.set(profile.botId, profile);
  return profile;
}

export function listBotIdentityProfiles(): BotIdentityProfile[] {
  return [...identityMap.values()];
}

export function getBotIdentityProfile(botId: string): BotIdentityProfile | null {
  return identityMap.get(botId) ?? null;
}
