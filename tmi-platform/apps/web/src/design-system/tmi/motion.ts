/**
 * TMI Design System — Motion Language
 *
 * Purposeful animation for a live broadcast network.
 * No constant movement, no distracting effects.
 * Chrome sweeps, neon pulses, smooth transitions only.
 *
 * @see CLAUDE.md Rule 18 (Visual Identity Formula)
 */

export const TMI_MOTION = {
  // Duration Tokens (in milliseconds)
  durations: {
    instant: 0,
    fast: 100,
    quick: 150,
    normal: 200,
    slow: 300,
    slower: 500,
    slowest: 1000,
  },

  // Easing Functions
  easing: {
    // Linear motion
    linear: 'linear',

    // Standard ease-in-out for most UI
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',

    // Snappy, responsive feel
    snappy: 'cubic-bezier(0.34, 1.56, 0.64, 1)',

    // Slow entrance, snappy exit
    enterSnappy: 'cubic-bezier(0.17, 0.67, 0.83, 0.67)',

    // Slow exit, snappy entrance
    exitSnappy: 'cubic-bezier(0.33, 0, 0.67, 0.33)',

    // Elastic bounce
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',

    // Gentle ease
    gentle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',

    // Momentum (like a broadcast camera moving)
    momentum: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },

  // Common Animation Sequences
  animations: {
    // Button Hover: Scale + Glow
    buttonHover: {
      duration: 150,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      scale: 1.05,
      glowIncrease: 10, // from 10px blur to 20px blur
    },

    // Button Active: Scale + Intense Glow
    buttonActive: {
      duration: 200,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      scale: 1.1,
      glowIncrease: 20, // from 10px to 30px blur
    },

    // Tab Switch: Fade + Slide
    tabSwitch: {
      contentExit: {
        duration: 100,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      contentEnter: {
        duration: 100,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      underlineSlide: {
        duration: 200,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },

    // Countdown Pulse: Intensify as seconds decrease
    countdownPulse: {
      normal: {
        duration: 1500,
        easing: 'ease-in-out',
        scale: '1.0 → 1.02 → 1.0',
      },
      final60: {
        duration: 1000,
        easing: 'ease-in-out',
        scale: '1.0 → 1.02 → 1.0',
        glowIncrease: 5,
      },
      final10: {
        duration: 500,
        easing: 'ease-in-out',
        scale: '1.0 → 1.05 → 1.0',
        glowIncrease: 10,
      },
    },

    // Card Rotation: Smooth fade + slide transitions
    cardRotate: {
      cardExit: {
        duration: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      cardEnter: {
        duration: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      holdTime: 8000, // 8-12 second hold between rotations
    },

    // Chrome Reflection: Sweep across glossy surfaces
    chromeReflection: {
      duration: 5000,
      easing: 'linear',
      direction: 'left to right',
      opacityRange: '0.3 → 0.6 → 0.3',
    },

    // Neon Pulse: Glow intensifies subtly
    neonPulse: {
      duration: 2000,
      easing: 'ease-in-out',
      glowIncrease: 5,
    },

    // Particle Sparkle: Tiny dots on hover
    particleSparkle: {
      duration: 600,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      count: '3-5',
    },

    // Live Indicator Pulse: Continuous for active events
    livePulse: {
      duration: 1200,
      easing: 'ease-in-out',
      glowIncrease: 10,
      loop: 'infinite',
    },
  },

  // CSS-in-JS Keyframe Generators
  keyframes: {
    // Breathing effect for glow
    breathing: {
      name: 'breathing',
      frames: {
        '0%': { textShadow: '0 0 10px currentColor' },
        '50%': { textShadow: '0 0 20px currentColor' },
        '100%': { textShadow: '0 0 10px currentColor' },
      },
    },

    // Chrome reflection sweep
    chromeReflectionSweep: {
      name: 'chromeReflectionSweep',
      frames: {
        '0%': {
          left: '-100%',
          opacity: '0',
        },
        '50%': {
          opacity: '0.6',
        },
        '100%': {
          left: '100%',
          opacity: '0',
        },
      },
    },

    // Countdown pulse (scales and glows)
    countdownPulse: {
      name: 'countdownPulse',
      frames: {
        '0%': { transform: 'scale(1)', textShadow: '0 0 10px currentColor' },
        '50%': { transform: 'scale(1.02)', textShadow: '0 0 20px currentColor' },
        '100%': { transform: 'scale(1)', textShadow: '0 0 10px currentColor' },
      },
    },

    // Button hover scale + glow
    buttonGlow: {
      name: 'buttonGlow',
      frames: {
        '0%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 10px currentColor)' },
        '50%': { transform: 'scale(1.05)', filter: 'drop-shadow(0 0 20px currentColor)' },
        '100%': { transform: 'scale(1.05)', filter: 'drop-shadow(0 0 20px currentColor)' },
      },
    },

    // Pulse animation (for live indicators, countdown final 10s)
    pulse: {
      name: 'pulse',
      frames: {
        '0%': { opacity: '1' },
        '50%': { opacity: '0.7' },
        '100%': { opacity: '1' },
      },
    },

    // Slide down for card exit
    slideDown: {
      name: 'slideDown',
      frames: {
        '0%': { transform: 'translateY(0)', opacity: '1' },
        '100%': { transform: 'translateY(20px)', opacity: '0' },
      },
    },

    // Slide up for card enter
    slideUp: {
      name: 'slideUp',
      frames: {
        '0%': { transform: 'translateY(20px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
    },

    // Shimmer effect for loading states
    shimmer: {
      name: 'shimmer',
      frames: {
        '0%': { backgroundPosition: '-1000px 0' },
        '100%': { backgroundPosition: '1000px 0' },
      },
    },

    // Color shift (feature color intensification on hover)
    colorIntensify: {
      name: 'colorIntensify',
      frames: {
        '0%': { filter: 'brightness(1)' },
        '50%': { filter: 'brightness(1.2)' },
        '100%': { filter: 'brightness(1.2)' },
      },
    },
  },

  // Predefined Animation Classes (Tailwind-compatible)
  classes: {
    // Breathing glow effect
    glowBreathe: {
      animation: 'breathing 2s ease-in-out infinite',
    },

    // Chrome reflection sweep
    chromeReflect: {
      animation: 'chromeReflectionSweep 5s linear infinite',
    },

    // Countdown pulse
    countdownPulse: {
      animation: 'countdownPulse 1.5s ease-in-out infinite',
    },

    // Final 10 seconds countdown (faster)
    countdownFinal: {
      animation: 'countdownPulse 0.5s ease-in-out infinite',
    },

    // Button hover
    buttonGlowHover: {
      animation: 'buttonGlow 0.2s ease-in-out forwards',
    },

    // Generic pulse (for live indicators)
    pulse: {
      animation: 'pulse 2s ease-in-out infinite',
    },

    // Card animations
    slideDownExit: {
      animation: 'slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
    },
    slideUpEnter: {
      animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
    },

    // Loading shimmer
    shimmer: {
      animation: 'shimmer 2s infinite',
    },

    // Color intensify on hover
    colorIntensify: {
      animation: 'colorIntensify 0.15s ease-in-out forwards',
    },
  },
} as const;

/**
 * Get motion style object for common animations
 * @example getMotionStyle('buttonHover')
 */
export function getMotionStyle(
  animationType: keyof typeof TMI_MOTION.animations,
): React.CSSProperties {
  const animation = TMI_MOTION.animations[animationType];
  if (!animation) return {};

  // Return a basic CSS object; specific implementations should use keyframes
  return {
    transition: `all ${TMI_MOTION.durations.normal}ms ${TMI_MOTION.easing.smooth}`,
  };
}

/**
 * Generate CSS animation string
 * @example getCSSAnimation('buttonGlow', 200)
 */
export function getCSSAnimation(
  animationName: string,
  duration: number = TMI_MOTION.durations.normal,
  easing: string = TMI_MOTION.easing.smooth,
): string {
  return `${animationName} ${duration}ms ${easing}`;
}
