import type { EditorialPerformance } from "@/lib/editorial-economy/types";

class EditorialPerformanceEngine {
  private readonly metrics = new Map<string, EditorialPerformance>();

  upsert(performance: EditorialPerformance): EditorialPerformance {
    this.metrics.set(performance.submissionId, performance);
    return performance;
  }

  get(submissionId: string): EditorialPerformance | undefined {
    return this.metrics.get(submissionId);
  }

  list(): EditorialPerformance[] {
    return Array.from(this.metrics.values());
  }

  verifiedEngagementScore(submissionId: string): number {
    const metric = this.metrics.get(submissionId);
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
