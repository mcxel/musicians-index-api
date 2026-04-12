export const HOMEPAGE_MOTION_PRESETS = {
  pageEnter: {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { durationMs: 360 },
  },
  cardHoverLift: {
    transform: 'translateY(-4px) scale(1.01)',
    transition: 'transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease',
  },
  livePulse: {
    animation: 'homeLivePulse 1.8s ease-in-out infinite',
  },
  beltStagger: {
    childDelayMs: 80,
    durationMs: 320,
  },
} as const;

export function toTransitionMs(durationMs?: number): string {
  return `${durationMs ?? 240}ms`;
}
