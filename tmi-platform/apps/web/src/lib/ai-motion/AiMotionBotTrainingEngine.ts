import { listMotionMemory } from "./AiMotionMemoryEngine";

export type MotionBotTrainingSnapshot = {
  totalSamples: number;
  successfulSamples: number;
  successRate: number;
  bestDuration?: number;
};

export function trainMotionBots(): MotionBotTrainingSnapshot {
  const samples = listMotionMemory();
  const totalSamples = samples.length;
  const successful = samples.filter((s) => s.successful);
  const successRate = totalSamples === 0 ? 0 : successful.length / totalSamples;

  const durationCount = new Map<number, number>();
  for (const s of successful) {
    durationCount.set(s.durationSeconds, (durationCount.get(s.durationSeconds) ?? 0) + 1);
  }

  let bestDuration: number | undefined;
  let bestCount = -1;
  for (const [duration, count] of durationCount) {
    if (count > bestCount) {
      bestCount = count;
      bestDuration = duration;
    }
  }

  return {
    totalSamples,
    successfulSamples: successful.length,
    successRate,
    bestDuration,
  };
}
