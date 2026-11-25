import prisma from "@/lib/prisma";

/**
 * Platform-wide community conversation — one singleton row, kind:"community".
 * Reuses the existing Conversation/Message models (no schema change): a
 * community Conversation has no participantIds gating, since every
 * authenticated user may read and post to it. Private DM threads keep using
 * kind:"fan-fan" (default) with real participantIds as before.
 */
const COMMUNITY_KIND = "community";
/** Fixed id (not cuid()) so upsert is race-safe across concurrent cold starts. */
export const COMMUNITY_CONVERSATION_ID = "community-platform-wide";

export async function getOrCreateCommunityConversation(): Promise<string> {
  try {
    const conversation = await prisma.conversation.upsert({
      where: { id: COMMUNITY_CONVERSATION_ID },
      create: { id: COMMUNITY_CONVERSATION_ID, kind: COMMUNITY_KIND, participantIds: [] },
      update: {},
      select: { id: true },
    });
    return conversation.id;
  } catch (err) {
    // Two concurrent first-callers (e.g. the feed's poll GET and a POST landing
    // at the same moment) can both miss the row and race the CREATE branch of
    // upsert — Postgres's unique constraint then rejects the loser. The row now
    // exists either way, so just read it back rather than treating this as fatal.
    if ((err as { code?: string })?.code === "P2002") {
      return COMMUNITY_CONVERSATION_ID;
    }
    throw err;
  }
}
