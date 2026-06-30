/**
 * TMI Design System — Glow Effects
 *
 * Text glow, color bloom, and neon effects for the platform.
 * Used on buttons, headlines, feature labels, and active states.
 *
 * @see CLAUDE.md Rule 7 (Visual Design Language), Rule 18 (Visual Identity Formula)
 */

export const TMI_GLOW = {
  // Text Shadow Glow Levels
  textGlow: {
    subtle: (color: string) => `0 0 10px ${color}, 0 0 20px ${color}33`,
    normal: (color: string) => `0 0 15px ${color}, 0 0 30px ${color}66, 0 0 45px ${color}33`,
    intense: (color: string) => `0 0 20px ${color}, 0 0 40px ${color}88, 0 0 60px ${color}44`,
  },

  // Box Shadow Glow Levels (for elements, not text)
  boxGlow: {
    subtle: (color: string) => `0 0 10px ${color}66, 0 0 20px ${color}33`,
    normal: (color: string) => `0 0 15px ${color}88, 0 0 30px ${color}66, inset 0 0 10px ${color}22`,
    intense: (color: string) => `0 0 20px ${color}99, 0 0 40px ${color}77, 0 0 60px ${color}44, inset 0 0 15px ${color}33`,
  },

  // Backdrop Filter Glow (for glass morphism effects)
  backdropGlow: {
    subtle: 'blur(10px)',
    normal: 'blur(20px)',
    intense: 'blur(30px)',
  },

  // Filter Effects
  filters: {
    // Boost color brightness
    brighten: (amount: number = 1.2) => `brightness(${amount})`,

    // Enhance color saturation
    saturate: (amount: number = 1.3) => `saturate(${amount})`,

    // Color shift/hue
    hueShift: (degrees: number = 10) => `hue-rotate(${degrees}deg)`,

    // Drop shadow glow
    glowShadow: (color: string) => `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 20px ${color}88)`,

    // Neon bloom effect
    neonBloom: (color: string) => `drop-shadow(0 0 5px ${color}) drop-shadow(0 0 10px ${color}) drop-shadow(0 0 20px ${color}88)`,
  },

  // Gradient Overlays for Glass Cards
  glassGradient: {
    // Subtle top-to-bottom glow
    subtle: (color: string) => `linear-gradient(180deg, ${color}22 0%, ${color}00 100%)`,

    // Medium intensity
    normal: (color: string) => `linear-gradient(180deg, ${color}33 0%, ${color}00 100%)`,

    // Strong glow at top
    intense: (color: string) => `linear-gradient(180deg, ${color}44 0%, ${color}00 100%)`,
  },

  // Chrome/Metallic Effects
  metallic: {
    // Glossy highlight (for text)
    glossyTextShadow: '0 2px 4px rgba(255, 255, 255, 0.2)',

    // Chrome surface reflection
    chromeReflection: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',

    // Metallic sheen
    sheenEffect: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)',
  },

  // Neon Border Effects
  neoBorder: {
    // Glowing border
    subtle: (color: string) => ({
      border: `1px solid ${color}66`,
      boxShadow: `0 0 10px ${color}44`,
    }),

    normal: (color: string) => ({
      border: `1px solid ${color}88`,
      boxShadow: `0 0 15px ${color}66, inset 0 0 5px ${color}22`,
    }),

    intense: (color: string) => ({
      border: `2px solid ${color}`,
      boxShadow: `0 0 20px ${color}88, 0 0 40px ${color}66, inset 0 0 10px ${color}33`,
    }),
  },

  // Particle/Sparkle Effects
  particles: {
    // Subtle sparkle on hover
    sparkleSmall: {
      size: '2-3px',
      count: '3-5',
      duration: '600ms',
      opacity: '0.6-0.8',
    },

    // Medium sparkle for active states
    sparkleMedium: {
      size: '4-5px',
      count: '5-8',
      duration: '800ms',
      opacity: '0.7-0.9',
    },

    // Intense sparkle for special moments
    sparkleIntense: {
      size: '5-8px',
      count: '8-12',
      duration: '1000ms',
      opacity: '0.8-1.0',
    },
  },
} as const;

/**
 * Generate text glow CSS for a given color and intensity
 * @example generateTextGlow('#00ffff', 'normal')
 */
export function generateTextGlow(
  color: string,
  intensity: 'subtle' | 'normal' | 'intense' = 'normal',
): string {
  return TMI_GLOW.textGlow[intensity](color);
}

/**
 * Generate box glow CSS for a given color and intensity
 * @example generateBoxGlow('#00ffff', 'normal')
 */
export function generateBoxGlow(
  color: string,
  intensity: 'subtle' | 'normal' | 'intense' = 'normal',
): string {
  return TMI_GLOW.boxGlow[intensity](color);
}

/**
 * Apply full glow styling to an element
 * @example applyGlowStyle('#00ffff', 'button')
 */
export function applyGlowStyle(
  color: string,
  elementType: 'text' | 'box' = 'box',
  intensity: 'subtle' | 'normal' | 'intense' = 'normal',
): React.CSSProperties {
  if (elementType === 'text') {
    return {
      textShadow: TMI_GLOW.textGlow[intensity](color),
    };
  }

  return {
    boxShadow: TMI_GLOW.boxGlow[intensity](color),
  };
}

/**
 * Create a neon border with glow
 * @example applyNeoBorder('#00ffff', 'normal')
 */
export function applyNeoBorder(
  color: string,
  intensity: 'subtle' | 'normal' | 'intense' = 'normal',
): React.CSSProperties {
  return TMI_GLOW.neoBorder[intensity](color);
}

/**
 * Generate a glowing gradient overlay (for cards, panels)
 * @example generateGlowGradient('#00ffff', 'normal')
 */
export function generateGlowGradient(
  color: string,
  intensity: 'subtle' | 'normal' | 'intense' = 'normal',
): string {
  return TMI_GLOW.glassGradient[intensity](color);
}

/**
 * Apply a neon border animation class
 * @example getNeoBorderAnimation('#00ffff')
 */
export function getNeoBorderAnimation(color: string): React.CSSProperties {
  return {
    border: `1px solid ${color}`,
    boxShadow: `0 0 10px ${color}66, 0 0 20px ${color}44`,
    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
  };
}

/**
 * Get metallic/glossy text effect
 */
export function getGlossyTextEffect(): React.CSSProperties {
  return {
    textShadow: TMI_GLOW.metallic.glossyTextShadow,
  };
}

/**
 * Generate sparkle particle CSS (for hover effects)
 * Returns inline styles suitable for particle container
 */
export function generateParticleEffect(
  intensity: 'small' | 'medium' | 'intense' = 'medium',
): React.CSSProperties {
  const particle = TMI_GLOW.particles[`sparkle${intensity.charAt(0).toUpperCase() + intensity.slice(1)}` as keyof typeof TMI_GLOW.particles];

  return {
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  };
}
