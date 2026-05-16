export type MotionQualityReport = {
  motionId: string;
  score: number;
  checks: {
    timingValid: boolean;
    smoothness: boolean;
    brandStyle: boolean;
    integrity: boolean;
  };
  approved: boolean;
};

const reports = new Map<string, MotionQualityReport>();

export function evaluateMotionQuality(input: {
  motionId: string;
  durationSeconds: number;
  styleHint?: string;
  frameRate?: number;
  outputRef?: string;
}): MotionQualityReport {
  const checks = {
    timingValid: [2, 4, 5, 6, 7].includes(input.durationSeconds),
    smoothness: (input.frameRate ?? 30) >= 24,
    brandStyle: (input.styleHint ?? "tmi").includes("tmi") || (input.styleHint ?? "").includes("neon"),
    integrity: Boolean(input.outputRef),
  };

  let score = 0;
  score += checks.timingValid ? 25 : 0;
  score += checks.smoothness ? 25 : 0;
  score += checks.brandStyle ? 25 : 0;
  score += checks.integrity ? 25 : 0;

  const report: MotionQualityReport = {
    motionId: input.motionId,
    score,
    checks,
    approved: score >= 70,
  };

  reports.set(report.motionId, report);
  return report;
}

export function getMotionQualityReport(motionId: string): MotionQualityReport | null {
  return reports.get(motionId) ?? null;
}

export function listMotionQualityReports(): MotionQualityReport[] {
  return [...reports.values()].sort((a, b) => b.score - a.score);
}
