export type NumberAnimationConfig = {
  from: number;
  to: number;
  durationMs: number;
  easing?: (t: number) => number;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function animateNumberAt(progressMs: number, config: NumberAnimationConfig): number {
  const easing = config.easing ?? easeOutCubic;
  const raw = Math.max(0, Math.min(1, progressMs / Math.max(1, config.durationMs)));
  const t = easing(raw);
  return config.from + (config.to - config.from) * t;
}
