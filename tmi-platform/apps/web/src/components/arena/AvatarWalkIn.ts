/**
 * PROMPT #3B: South Park-style wobble walk-in animation
 * Animates avatar from spawn point to seat with fun tilting motion
 */

export interface WalkInState {
  x: number;
  y: number;
  tilt: number; // rotation in degrees
  scale: number;
  progress: number; // 0 to 1
}

export interface WalkInConfig {
  duration: number; // milliseconds
  wobbleAmount: number; // degrees of tilt
  wobbleSpeed: number; // oscillations per second
  bounceSettleAmount: number; // final bounce scale
  bounceSettleDuration: number; // milliseconds
}

const DEFAULT_CONFIG: WalkInConfig = {
  duration: 1200,
  wobbleAmount: 8,
  wobbleSpeed: 4,
  bounceSettleAmount: 0.15,
  bounceSettleDuration: 300,
};

/**
 * Easing function: ease in-out cubic
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Easing function: bounce out (for settle)
 */
function bounceOut(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
}

/**
 * Animate avatar from spawn to seat with South Park wobble
 * @returns Cancel function to stop animation
 */
export function animateToSeat(
  from: { x: number; y: number },
  to: { x: number; y: number },
  onUpdate: (state: WalkInState) => void,
  onDone: () => void,
  config: Partial<WalkInConfig> = {}
): () => void {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const startTime = Date.now();
  let animationId: number | null = null;
  let isSettling = false;
  let settleStartTime = 0;

  const tick = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / cfg.duration, 1);
    const eased = easeInOutCubic(progress);

    if (!isSettling) {
      // Main walk animation
      const x = from.x + (to.x - from.x) * eased;
      const y = from.y + (to.y - from.y) * eased;

      // Wobble: side-to-side tilt (sine wave)
      const wobblePhase = (elapsed / 1000) * cfg.wobbleSpeed * 2 * Math.PI;
      const tilt = Math.sin(wobblePhase) * cfg.wobbleAmount * (1 - progress); // fade wobble as we arrive

      // Slight backward lean during walk
      const backwardLean = -cfg.wobbleAmount * 0.5 * (1 - progress);

      onUpdate({
        x,
        y,
        tilt: tilt + backwardLean,
        scale: 1,
        progress,
      });

      if (progress >= 1) {
        // Start settle bounce
        isSettling = true;
        settleStartTime = Date.now();
      } else {
        animationId = requestAnimationFrame(tick);
      }
    } else {
      // Settle bounce animation
      const settleElapsed = Date.now() - settleStartTime;
      const settleProgress = Math.min(settleElapsed / cfg.bounceSettleDuration, 1);
      const bounceEased = bounceOut(settleProgress);

      // Small bounce scale
      const scaleOffset = cfg.bounceSettleAmount * (1 - bounceEased);
      const scale = 1 + scaleOffset;

      onUpdate({
        x: to.x,
        y: to.y,
        tilt: 0,
        scale,
        progress: 1,
      });

      if (settleProgress >= 1) {
        // Animation complete
        onUpdate({
          x: to.x,
          y: to.y,
          tilt: 0,
          scale: 1,
          progress: 1,
        });
        onDone();
      } else {
        animationId = requestAnimationFrame(tick);
      }
    }
  };

  animationId = requestAnimationFrame(tick);

  // Return cancel function
  return () => {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  };
}

/**
 * Quick pop-in animation for rejoining users (no walk)
 */
export function animatePopIn(
  position: { x: number; y: number },
  onUpdate: (state: WalkInState) => void,
  onDone: () => void,
  duration: number = 400
): () => void {
  const startTime = Date.now();
  let animationId: number | null = null;

  const tick = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const bounceEased = bounceOut(progress);

    // Scale from 0 to 1 with bounce
    const scale = bounceEased;

    onUpdate({
      x: position.x,
      y: position.y,
      tilt: 0,
      scale,
      progress,
    });

    if (progress >= 1) {
      onUpdate({
        x: position.x,
        y: position.y,
        tilt: 0,
        scale: 1,
        progress: 1,
      });
      onDone();
    } else {
      animationId = requestAnimationFrame(tick);
    }
  };

  animationId = requestAnimationFrame(tick);

  return () => {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  };
}

/**
 * Walk-out animation (reverse of walk-in)
 */
export function animateWalkOut(
  from: { x: number; y: number },
  exitDirection: 'LEFT' | 'RIGHT' | 'BACK',
  onUpdate: (state: WalkInState) => void,
  onDone: () => void,
  duration: number = 800
): () => void {
  const exitOffsets = {
    LEFT: { x: -200, y: 0 },
    RIGHT: { x: 200, y: 0 },
    BACK: { x: 0, y: -200 },
  };

  const offset = exitOffsets[exitDirection];
  const to = { x: from.x + offset.x, y: from.y + offset.y };

  const startTime = Date.now();
  let animationId: number | null = null;

  const tick = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);

    const x = from.x + (to.x - from.x) * eased;
    const y = from.y + (to.y - from.y) * eased;

    // Slight wobble while walking out
    const wobblePhase = (elapsed / 1000) * 4 * 2 * Math.PI;
    const tilt = Math.sin(wobblePhase) * 6;

    // Fade out
    const scale = 1 - progress * 0.3;

    onUpdate({
      x,
      y,
      tilt,
      scale,
      progress,
    });

    if (progress >= 1) {
      onDone();
    } else {
      animationId = requestAnimationFrame(tick);
    }
  };

  animationId = requestAnimationFrame(tick);

  return () => {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  };
}
