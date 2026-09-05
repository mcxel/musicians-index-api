import prisma from "@/lib/prisma";
import { SavedPerformanceStatus } from "@prisma/client";
import { EXPIRY_WARNING_DAYS } from "./SavedPerformancePolicy";

/**
 * Fire expiration warning notifications at the 30-day, 7-day, and 24-hour
 * marks. Called from the daily expiration sweep job.
 */
export async function fireExpirationWarnings(): Promise<number> {
  const now = new Date();
  let fired = 0;

  for (const days of EXPIRY_WARNING_DAYS) {
    const windowStart = new Date(now.getTime() + days * 86_400_000 - 3_600_000);
    const windowEnd = new Date(now.getTime() + days * 86_400_000 + 3_600_000);

    const records = await prisma.savedPerformance.findMany({
      where: {
        status: {
          in: [
            SavedPerformanceStatus.ACTIVE,
            SavedPerformanceStatus.EXPIRING_SOON,
            SavedPerformanceStatus.RENEWED,
          ],
        },
        expiresAt: { gte: windowStart, lte: windowEnd },
      },
      select: { id: true, ownerId: true, title: true, expiresAt: true },
    });

    for (const record of records) {
      const label = days === 1 ? "24 hours" : `${days} days`;
      await prisma.notification.create({
        data: {
          userId: record.ownerId,
          type: "saved_performance_expiry_warning",
          title: `"${record.title}" expires in ${label}`,
          body: `Renew or download your saved performance before it is permanently deleted.`,
          href: `/saved-performances`,
          metadata: {
            recordingId: record.id,
            expiresAt: record.expiresAt.toISOString(),
            daysRemaining: days,
            actions: ["KEEP", "DOWNLOAD", "DELETE_NOW"],
          },
        },
      });
      fired++;
    }
  }

  return fired;
}
