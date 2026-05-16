/**
 * SponsorPerformanceEngine
 * Computes the definitive ROI, spend returns, and performance grades for sponsors.
 */

export type PerformanceGrade = "A" | "B" | "C" | "D" | "F";

export interface SponsorPerformanceRecord {
  sponsorId: string;
  totalSpendCents: number;
  totalReturnCents: number;
  roiPercentage: number;
  conversionRatio: number;
  performanceGrade: PerformanceGrade;
}

export class SponsorPerformanceEngine {
  static calculatePerformance(sponsorId: string, spendCents: number, returnCents: number, clicks: number, conversions: number): SponsorPerformanceRecord {
    const roi = spendCents > 0 ? ((returnCents - spendCents) / spendCents) * 100 : 0;
    const ratio = clicks > 0 ? conversions / clicks : 0;
    
    let grade: PerformanceGrade = "F";
    if (roi > 200) grade = "A";
    else if (roi > 50) grade = "B";
    else if (roi > 0) grade = "C";
    else if (roi > -50) grade = "D";

    return {
      sponsorId,
      totalSpendCents: spendCents,
      totalReturnCents: returnCents,
      roiPercentage: roi,
      conversionRatio: ratio,
      performanceGrade: grade,
    };
  }
}