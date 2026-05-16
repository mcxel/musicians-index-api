import { evaluateMagazineReward } from "@/lib/magazine/MagazineRewardEngine";

export function resolveArticleReadReward(sessionId: string) {
  return evaluateMagazineReward(sessionId);
}
