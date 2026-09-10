import prisma from "@/lib/prisma";
import type { EditorialPerformance as DbEditorialPerformance } from "@prisma/client";
import type { EditorialPerformance } from "@/lib/editorial-economy/types";

function fromDb(row: DbEditorialPerformance): EditorialPerformance {
  return {
    submissionId: row.submissionId,
    verifiedUniqueReaders: row.verifiedUniqueReaders,
    readCompletionRate: row.readCompletionRate,
    artistProfileConversions: row.artistProfileConversions,
    followsGenerated: row.followsGenerated,
    tipsGeneratedUsd: row.tipsGeneratedUsd,
    sponsorRevenueUsd: row.sponsorRevenueUsd,
    suspiciousTrafficRatio: row.suspiciousTrafficRatio,
  };
}

class EditorialPerformanceEngine {
  async upsert(performance: EditorialPerformance): Promise<EditorialPerformance> {
    const row = await prisma.editorialPerformance.upsert({
      where: { submissionId: performance.submissionId },
      create: performance,
      update: {
        verifiedUniqueReaders: performance.verifiedUniqueReaders,
        readCompletionRate: performance.readCompletionRate,
        artistProfileConversions: performance.artistProfileConversions,
        followsGenerated: performance.followsGenerated,
        tipsGeneratedUsd: performance.tipsGeneratedUsd,
        sponsorRevenueUsd: performance.sponsorRevenueUsd,
        suspiciousTrafficRatio: performance.suspiciousTrafficRatio,
      },
    });
    return fromDb(row);
  }

  async get(submissionId: string): Promise<EditorialPerformance | undefined> {
    const row = await prisma.editorialPerformance.findUnique({ where: { submissionId } });
    return row ? fromDb(row) : undefined;
  }

  async list(): Promise<EditorialPerformance[]> {
    const rows = await prisma.editorialPerformance.findMany();
    return rows.map(fromDb);
  }

  async verifiedEngagementScore(submissionId: string): Promise<number> {
    const metric = await this.get(submissionId);
    if (!metric) return 0;

    const completionWeight = Math.max(0, Math.min(1, metric.readCompletionRate));
    const suspiciousPenalty = Math.max(0, 1 - metric.suspiciousTrafficRatio);

    const raw =
      metric.verifiedUniqueReaders * 0.1 +
      completionWeight * 120 +
      metric.artistProfileConversions * 4 +
      metric.followsGenerated * 2 +
      metric.tipsGeneratedUsd * 0.5;

    return Math.round(raw * suspiciousPenalty);
  }
}

export const editorialPerformanceEngine = new EditorialPerformanceEngine();
