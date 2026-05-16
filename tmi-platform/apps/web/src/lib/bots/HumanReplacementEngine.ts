import { getBotFaceRegistryRecord, setBotFaceIdentityStatus } from "@/lib/bots/BotFaceRegistry";

export type ReplacementSlotType =
  | "rank-slot"
  | "visual-slot"
  | "profile-card"
  | "article-slot"
  | "room-slot"
  | "battle-slot";

export type ReplacementQueueItem = {
  replacementId: string;
  botId: string;
  humanUserId: string;
  slots: ReplacementSlotType[];
  status: "queued" | "transferred" | "archived" | "cancelled";
  createdAt: number;
  updatedAt: number;
};

export type ArchivedBotIdentity = {
  botId: string;
  archivedAt: number;
  reason: "human-replacement";
  registrySnapshot: ReturnType<typeof getBotFaceRegistryRecord>;
  transferredToUserId: string;
  slots: ReplacementSlotType[];
};

const replacementQueue = new Map<string, ReplacementQueueItem>();
const archivedIdentityMap = new Map<string, ArchivedBotIdentity>();

function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

export function queueHumanReplacement(input: {
  botId: string;
  humanUserId: string;
  slots: ReplacementSlotType[];
}): ReplacementQueueItem {
  const now = Date.now();
  const next: ReplacementQueueItem = {
    replacementId: id("replace"),
    botId: input.botId,
    humanUserId: input.humanUserId,
    slots: [...new Set(input.slots)],
    status: "queued",
    createdAt: now,
    updatedAt: now,
  };
  replacementQueue.set(next.replacementId, next);
  return next;
}

export function listHumanReplacementQueue(): ReplacementQueueItem[] {
  return [...replacementQueue.values()];
}

export function completeHumanReplacement(replacementId: string): ReplacementQueueItem | null {
  const current = replacementQueue.get(replacementId);
  if (!current) return null;

  const transferred: ReplacementQueueItem = {
    ...current,
    status: "transferred",
    updatedAt: Date.now(),
  };
  replacementQueue.set(replacementId, transferred);

  const registrySnapshot = getBotFaceRegistryRecord(current.botId);
  if (registrySnapshot) {
    const archived: ArchivedBotIdentity = {
      botId: current.botId,
      archivedAt: Date.now(),
      reason: "human-replacement",
      registrySnapshot,
      transferredToUserId: current.humanUserId,
      slots: current.slots,
    };
    archivedIdentityMap.set(current.botId, archived);
    setBotFaceIdentityStatus(current.botId, "locked");
  }

  return transferred;
}

export function listArchivedBotIdentities(): ArchivedBotIdentity[] {
  return [...archivedIdentityMap.values()];
}
