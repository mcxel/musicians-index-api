/**
 * WriterNotificationOrchestration — thin seam, not a new engine
 * (Writer Phase A, 2026-09-16).
 *
 * Reuses the existing generic Follow graph and Notification/
 * NotificationPreference models exactly as found during reconciliation —
 * no WriterFollow, no WriterNotificationEngine. Must only be called from a
 * genuine publication transition (EditorialSubmissionEngine.markPublished),
 * never from draft/revision/preview saves.
 */

import prisma from "@/lib/prisma";

const NOTIFICATION_TYPE = "writer_publication";
const NOTIFICATION_CHANNEL = "in_app";

export interface NotifyFollowersInput {
  writerUserId: string;
  title: string;
  href: string;
}

export interface NotifyFollowersResult {
  followerCount: number;
  notifiedCount: number;
  optedOutCount: number;
}

/** Called only on a real, qualifying publication event. */
export async function notifyFollowersOfWriterPublication(
  input: NotifyFollowersInput,
): Promise<NotifyFollowersResult> {
  const followers = await prisma.follow.findMany({
    where: { followingId: input.writerUserId },
    select: { followerId: true },
  });

  if (followers.length === 0) {
    return { followerCount: 0, notifiedCount: 0, optedOutCount: 0 };
  }

  const followerIds = followers.map((f) => f.followerId);

  const optOuts = await prisma.notificationPreference.findMany({
    where: {
      userId: { in: followerIds },
      type: NOTIFICATION_TYPE,
      channel: NOTIFICATION_CHANNEL,
      enabled: false,
    },
    select: { userId: true },
  });
  const optedOutSet = new Set(optOuts.map((o) => o.userId));

  const eligibleFollowerIds = followerIds.filter((id) => !optedOutSet.has(id));

  if (eligibleFollowerIds.length > 0) {
    await prisma.notification.createMany({
      data: eligibleFollowerIds.map((userId) => ({
        userId,
        type: NOTIFICATION_TYPE,
        title: "New from a writer you follow",
        body: input.title,
        href: input.href,
      })),
    });
  }

  return {
    followerCount: followerIds.length,
    notifiedCount: eligibleFollowerIds.length,
    optedOutCount: optedOutSet.size,
  };
}
