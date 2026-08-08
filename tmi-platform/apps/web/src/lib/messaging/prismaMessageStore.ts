/** Prisma Conversation/Message store for /api/messages */
import { prisma } from "@/lib/prisma";

export type MessageKind = string;
function sortedPair(a: string, b: string): [string, string] { return a < b ? [a, b] : [b, a]; }

export async function listConversationsForUser(userId: string) {
  return prisma.conversation.findMany({
    where: { participantIds: { has: userId }, isArchived: false },
    include: {
      messages: {
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
        take: 40,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
}

export async function getOrCreateConversation(opts: {
  userId: string;
  recipientId: string;
  kind?: MessageKind;
}) {
  const [a, b] = sortedPair(opts.userId, opts.recipientId);
  const candidates = await prisma.conversation.findMany({
    where: { participantIds: { hasEvery: [a, b] }, isArchived: false },
    take: 20,
  });
  const existing = candidates.find(
    (c) => c.participantIds.length === 2 && c.participantIds.includes(a) && c.participantIds.includes(b),
  );
  if (existing) return existing;
  return prisma.conversation.create({
    data: { kind: opts.kind ?? "fan-fan", participantIds: [a, b] },
  });
}

export async function getConversationForUser(conversationId: string, userId: string) {
  const convo = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        where: { isDeleted: false },
        orderBy: { createdAt: "asc" },
        take: 200,
      },
    },
  });
  if (!convo || !convo.participantIds.includes(userId)) return null;
  return convo;
}

export async function sendMessage(opts: {
  conversationId: string;
  senderId: string;
  senderName: string;
  body: string;
  messageType?: string;
  mediaUrl?: string;
  valueUsdCents?: number;
}) {
  const msg = await prisma.message.create({
    data: {
      conversationId: opts.conversationId,
      senderId: opts.senderId,
      senderName: opts.senderName,
      body: opts.body,
      messageType: opts.messageType ?? "text",
      mediaUrl: opts.mediaUrl,
      valueUsdCents: opts.valueUsdCents,
      readByIds: [opts.senderId],
    },
  });
  await prisma.conversation.update({
    where: { id: opts.conversationId },
    data: { updatedAt: new Date() },
  });
  return msg;
}

export async function markConversationRead(conversationId: string, userId: string) {
  const unread = await prisma.message.findMany({
    where: {
      conversationId,
      isDeleted: false,
      NOT: { readByIds: { has: userId } },
    },
    select: { id: true, readByIds: true },
    take: 200,
  });
  for (const m of unread) {
    if (m.readByIds.includes(userId)) continue;
    await prisma.message.update({
      where: { id: m.id },
      data: { readByIds: { set: [...m.readByIds, userId] } },
    });
  }
}

export async function softDeleteMessage(conversationId: string, messageId: string, userId: string) {
  const msg = await prisma.message.findFirst({
    where: { id: messageId, conversationId, senderId: userId },
  });
  if (!msg) return false;
  await prisma.message.update({
    where: { id: messageId },
    data: { isDeleted: true, deletedAt: new Date() },
  });
  return true;
}

export function unreadCountForUser(
  messages: { senderId: string; readByIds: string[] }[],
  userId: string,
): number {
  return messages.filter((m) => m.senderId !== userId && !m.readByIds.includes(userId)).length;
}

export type ShareMeta = {
  playlistId?: string;
  trackId?: string;
  shareSlug?: string;
  shareId?: string;
  cardId?: string;
};

export function encodeShareMeta(meta: ShareMeta | undefined, mediaUrl?: string): string | undefined {
  if (!meta && !mediaUrl) return undefined;
  const hasMeta = meta && Object.values(meta).some(Boolean);
  if (!hasMeta) return mediaUrl;
  return JSON.stringify({ ...(meta ?? {}), mediaUrl: mediaUrl || undefined });
}

export function decodeShareMeta(raw: string | null | undefined): ShareMeta & { mediaUrl?: string } {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as ShareMeta & { mediaUrl?: string };
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    /* plain url */
  }
  return { mediaUrl: raw };
}

export async function resolveParticipants(ids: string[]) {
  const { resolveSessionDisplayName } = await import("@/lib/auth/resolveSessionIdentity");
  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, displayName: true, email: true, role: true, image: true },
  });
  const byId = new Map(users.map((u) => [u.id, u]));
  return ids.map((id) => {
    const u = byId.get(id);
    const role = (u?.role ?? "FAN").toString().toLowerCase();
    return {
      userId: id,
      displayName: resolveSessionDisplayName({
        email: u?.email,
        dbDisplayName: u?.displayName,
        userId: id,
      }),
      avatarUrl: u?.image ?? "",
      role: role === "performer" || role === "artist" ? "artist" : role === "sponsor" ? "sponsor" : role === "admin" || role === "staff" ? "admin" : "fan",
    };
  });
}
