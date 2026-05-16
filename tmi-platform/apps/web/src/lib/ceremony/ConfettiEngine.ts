/**
 * ConfettiEngine
 * Configures and controls confetti bursts for ceremony events.
 * Outputs burst configuration that React components consume.
 * No DOM dependency — pure config layer.
 *
 * Usage:
 *   const burst = confettiEngine.getBurst("battle");
 *   // pass burst config to <ConfettiCanvas burst={burst} />
 */

export interface ConfettiParticle {
  color: string;
  shape: "rect" | "circle" | "star" | "crown";
  size: number; // px
  weight: number; // 0–1, affects fall speed
}

export interface ConfettiBurst {
  burstId: string;
  particleCount: number;
  particles: ConfettiParticle[];
  originX: number;   // 0–1 relative
  originY: number;   // 0–1 relative
  spread: number;    // degrees
  velocity: number;  // px/frame
  gravity: number;   // 0–2
  durationMs: number;
  fadeDurationMs: number;
  /** Multi-burst: if > 0, fires additional bursts at interval */
  repeatCount: number;
  repeatIntervalMs: number;
}

const BATTLE_COLORS  = ["#FFD700", "#FF2DAA", "#00FFFF", "#ffffff", "#AA2DFF"];
const CYPHER_COLORS  = ["#FF2DAA", "#AA2DFF", "#ffffff", "#FFD700", "#ff6b35"];
const CONTEST_COLORS = ["#00FFFF", "#FFD700", "#ffffff", "#00FF88", "#FF2DAA"];
const UPSET_COLORS   = ["#FF6B35", "#FF2DAA", "#FFD700", "#AA2DFF", "#ffffff"];

function buildParticles(colors: string[], count: number, hasCrown = false): ConfettiParticle[] {
  const shapes: ConfettiParticle["shape"][] = hasCrown
    ? ["crown", "star", "rect", "circle"]
    : ["rect", "circle", "star"];

  return Array.from({ length: count }, (_, i) => ({
    color: colors[i % colors.length],
    shape: shapes[i % shapes.length],
    size: 6 + Math.floor(i % 5) * 2,
    weight: 0.3 + (i % 4) * 0.2,
  }));
}

class ConfettiEngine {
  private bursts = new Map<string, ConfettiBurst>();

  /**
   * Get a pre-configured burst for a context.
   */
  getBurst(
    context: "battle" | "cypher" | "dirty-dozens" | "contest" | "upset",
    opts?: { originX?: number; originY?: number }
  ): ConfettiBurst {
    const colorMap = {
      battle:         BATTLE_COLORS,
      cypher:         CYPHER_COLORS,
      "dirty-dozens": CYPHER_COLORS,
      contest:        CONTEST_COLORS,
      upset:          UPSET_COLORS,
    };
    const colors = colorMap[context] ?? BATTLE_COLORS;
    const hasCrown = context === "battle" || context === "contest";

    const burst: ConfettiBurst = {
      burstId: `burst-${context}-${Date.now()}`,
      particleCount: context === "upset" ? 200 : 150,
      particles: buildParticles(colors, 150, hasCrown),
      originX: opts?.originX ?? 0.5,
      originY: opts?.originY ?? 0.3,
      spread: context === "upset" ? 180 : 140,
      velocity: context === "upset" ? 18 : 14,
      gravity: 0.6,
      durationMs: context === "upset" ? 5000 : 4000,
      fadeDurationMs: 1500,
      repeatCount: context === "upset" ? 3 : 2,
      repeatIntervalMs: 600,
    };

    this.bursts.set(burst.burstId, burst);
    return burst;
  }

  /**
   * Dual-origin burst: fires from top-left and top-right simultaneously.
   */
  getDualBurst(context: "battle" | "cypher" | "contest"): [ConfettiBurst, ConfettiBurst] {
    return [
      this.getBurst(context, { originX: 0.15, originY: 0.0 }),
      this.getBurst(context, { originX: 0.85, originY: 0.0 }),
    ];
  }

  /** Crown-only burst — fewer particles, more crown shapes */
  getCrownBurst(): ConfettiBurst {
    return {
      burstId: `burst-crown-${Date.now()}`,
      particleCount: 60,
      particles: buildParticles(["#FFD700", "#FFA500", "#ffffff"], 60, true),
      originX: 0.5,
      originY: 0.1,
      spread: 80,
      velocity: 20,
      gravity: 0.4,
      durationMs: 3000,
      fadeDurationMs: 1000,
      repeatCount: 0,
      repeatIntervalMs: 0,
    };
  }

  getBurstById(burstId: string): ConfettiBurst | undefined {
    return this.bursts.get(burstId);
  }
}

export const confettiEngine = new ConfettiEngine();
