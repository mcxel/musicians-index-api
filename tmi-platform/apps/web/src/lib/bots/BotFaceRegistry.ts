export type BotIdentityRole =
  | "fan-bot"
  | "artist-bot"
  | "performer-bot"
  | "venue-bot"
  | "sponsor-bot"
  | "advertiser-bot"
  | "producer-bot"
  | "reporter-bot"
  | "host-bot"
  | "co-host-bot"
  | "security-sentinel-bot"
  | "crowd-bot"
  | "support-bot"
  | "diagnostic-bot"
  | "big-ace-support-bot";

export type BotIdentityUsage =
  | "profile"
  | "room"
  | "article"
  | "rank-slot"
  | "battle-slot"
  | "venue-slot"
  | "admin-observe";

export type BotFaceRegistryRecord = {
  botId: string;
  role: BotIdentityRole;
  faceHash: string;
  motionHash: string;
  profileHash: string;
  generated: true;
  synthetic: true;
  source: "bot_face_generation_engine";
  createdAt: number;
  usage: BotIdentityUsage[];
  duplicate: boolean;
  status: "pending" | "approved" | "rejected" | "locked";
  metadata: {
    name: string;
    personality: string;
    style: string;
  };
};

const faceRegistryByBot = new Map<string, BotFaceRegistryRecord>();
const botIdByFaceHash = new Map<string, string>();

export function listBotFaceRegistryRecords(): BotFaceRegistryRecord[] {
  return [...faceRegistryByBot.values()];
}

export function getBotFaceRegistryRecord(botId: string): BotFaceRegistryRecord | null {
  return faceRegistryByBot.get(botId) ?? null;
}

export function isDuplicateFaceHash(faceHash: string, excludeBotId?: string): boolean {
  const existingBotId = botIdByFaceHash.get(faceHash);
  if (!existingBotId) return false;
  if (excludeBotId && existingBotId === excludeBotId) return false;
  return true;
}

export function registerBotFaceIdentity(
  input: Omit<BotFaceRegistryRecord, "createdAt" | "duplicate" | "status"> & { status?: BotFaceRegistryRecord["status"] },
): BotFaceRegistryRecord {
  const duplicate = isDuplicateFaceHash(input.faceHash, input.botId);
  if (duplicate) {
    throw new Error(`duplicate-face-hash:${input.faceHash}`);
  }

  const record: BotFaceRegistryRecord = {
    ...input,
    createdAt: Date.now(),
    duplicate: false,
    status: input.status ?? "pending",
  };
  faceRegistryByBot.set(record.botId, record);
  botIdByFaceHash.set(record.faceHash, record.botId);
  return record;
}

export function setBotFaceIdentityStatus(
  botId: string,
  status: BotFaceRegistryRecord["status"],
): BotFaceRegistryRecord | null {
  const current = faceRegistryByBot.get(botId);
  if (!current) return null;
  const next: BotFaceRegistryRecord = { ...current, status };
  faceRegistryByBot.set(botId, next);
  return next;
}

export function markBotFaceIdentityUsage(botId: string, usage: BotIdentityUsage): BotFaceRegistryRecord | null {
  const current = faceRegistryByBot.get(botId);
  if (!current) return null;
  if (current.usage.includes(usage)) return current;
  const next: BotFaceRegistryRecord = { ...current, usage: [...current.usage, usage] };
  faceRegistryByBot.set(botId, next);
  return next;
}

export function listBotFaceDuplicates(): Array<{ faceHash: string; botIds: string[] }> {
  const grouped = new Map<string, string[]>();
  for (const record of faceRegistryByBot.values()) {
    const current = grouped.get(record.faceHash) ?? [];
    grouped.set(record.faceHash, [...current, record.botId]);
  }
  return [...grouped.entries()]
    .filter((entry) => entry[1].length > 1)
    .map(([faceHash, botIds]) => ({ faceHash, botIds }));
}
