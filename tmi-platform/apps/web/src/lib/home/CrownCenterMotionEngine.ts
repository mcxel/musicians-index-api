// Crown Center Motion Engine — deterministic per-artist motion that always returns to center.
// Seed from artist ID ensures the same artist always gets the same pattern.

type MotionTarget = Record<string, Array<number | string>>;

export type MotionPlan = {
  animate: MotionTarget;
  transition: {
    duration: number;
    repeat: number;
    ease: string;
    times: number[];
    delay?: number;
  };
  crownOverlay?: {
    animate: MotionTarget;
    transition: {
      duration: number;
      repeat: number;
      ease: string;
      times: number[];
      delay?: number;
    };
  };
};

function seedFromId(value: string): number {
  return value.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}

/**
 * Crown holder (#1) motion plan.
 * Quarter-turn → slight orbit nudge → vanish/return — all resolve back to x:0 y:0 rotate:0.
 */
export function buildCrownCenterMotion(authorityId: string): MotionPlan {
  const seed = seedFromId(authorityId);
  const orbitOut = 7 + (seed % 5);
  const twist = ((seed % 7) - 3) * 1.8;
  const spinLead = 10 + (seed % 18);
  const duration = 6 + (seed % 2);
  const times = [0, 0.18, 0.44, 0.7, 1];

  return {
    animate: {
      scale: [1, 1.04, 1.09, 1.03, 1],
      x: [0, 0, orbitOut, -orbitOut * 0.28, 0],
      y: [0, -4, -10, 2, 0],
      rotate: [0, twist, spinLead + 90, twist * 0.5, 0],
      rotateY: [0, 0, 90, 18, 0],
      opacity: [1, 1, 0.76, 0.92, 1],
      filter: [
        "brightness(1) saturate(1)",
        "brightness(1.04) saturate(1.06)",
        "brightness(1.08) saturate(1.16)",
        "brightness(1.03) saturate(1.06)",
        "brightness(1) saturate(1)",
      ],
    },
    transition: {
      duration,
      repeat: Infinity,
      ease: "easeInOut",
      times,
    },
    crownOverlay: {
      animate: {
        opacity: [0, 1, 0, 0, 1],
        y: [-20, -28, -42, -24, -18],
        scale: [0.84, 1.12, 0.76, 0.86, 1],
        filter: [
          "drop-shadow(0 0 0px #FFD70000)",
          "drop-shadow(0 0 12px #FFD700) drop-shadow(0 0 24px #FFD70088)",
          "drop-shadow(0 0 0px #FFD70000)",
          "drop-shadow(0 0 0px #FFD70000)",
          "drop-shadow(0 0 10px #FFD700) drop-shadow(0 0 22px #FFD70066)",
        ],
      },
      transition: {
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        times,
      },
    },
  };
}

/**
 * Orbiting challenger motion — gentle drift that trails the crown holder.
 */
export function buildCrownOrbiterMotion(performerId: string, orbitIndex: number): MotionPlan {
  const seed      = seedFromId(`${performerId}:${orbitIndex}`);
  const driftX    = ((seed % 9) - 4) * 1.4;
  const driftY    = (((seed >> 1) % 7) - 3) * 1.5;
  const spiralLift = 4 + (seed % 6);
  const trailDelay = orbitIndex * 0.08;
  const spin      = ((seed % 10) - 5) * 2.2;

  return {
    animate: {
      x:       [0, driftX * 0.55, driftX, driftX * 0.35, 0],
      y:       [0, -spiralLift, driftY, spiralLift * 0.4, 0],
      rotate:  [0, spin * 0.45, spin, spin * 0.4, 0],
      scale:   [1, 1.03, 0.98, 1.02, 1],
      opacity: [0.94, 1, 0.88, 0.98, 0.94],
    },
    transition: {
      duration: seed % 2 === 0 ? 2 : 4,
      repeat:   Infinity,
      ease:     "easeInOut",
      times:    [0, 0.22, 0.5, 0.78, 1],
      delay:    trailDelay,
    },
  };
}
