/**
 * AdminMotionPresets.ts — Canonical Motion Presets & Physics Contracts for Admin Overseer
 * The Musician's Index | BerntoutGlobal LLC
 *
 * All Overseer animations (Rolodex, expand, fold, monitors) share this single registry.
 * One-off inline animation magic numbers across components are prohibited.
 */

export interface MotionPreset {
  name: string;
  durationMs: number;
  easing: string;
  cssTransition: string;
  description: string;
}

export const ADMIN_MOTION_PRESETS = {
  ROLODEX_FORWARD: {
    name: "ROLODEX_FORWARD",
    durationMs: 320,
    easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    cssTransition: "transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 240ms ease",
    description: "3D cylinder roll forward (-90° tilt out, +90° tilt in with spring settle)",
  },
  ROLODEX_BACK: {
    name: "ROLODEX_BACK",
    durationMs: 320,
    easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    cssTransition: "transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 240ms ease",
    description: "Reverse 3D cylinder roll (+90° tilt out, -90° tilt in with spring settle)",
  },
  ROLODEX_TO_TARGET: {
    name: "ROLODEX_TO_TARGET",
    durationMs: 260,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    cssTransition: "transform 260ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease",
    description: "Depth-fade slide transition directly to requested presentation index",
  },
  PANEL_LIFT_EXPAND: {
    name: "PANEL_LIFT_EXPAND",
    durationMs: 280,
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    cssTransition: "all 280ms cubic-bezier(0.16, 1, 0.3, 1)",
    description: "Physical lift forward along Z-axis, dim surrounding deck, reflow",
  },
  PANEL_RETURN: {
    name: "PANEL_RETURN",
    durationMs: 240,
    easing: "cubic-bezier(0.2, 0.9, 0.3, 1)",
    cssTransition: "all 240ms cubic-bezier(0.2, 0.9, 0.3, 1)",
    description: "Physical contraction and settle back into originating panel canister",
  },
  FOLD_TO_FIT: {
    name: "FOLD_TO_FIT",
    durationMs: 220,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    cssTransition: "max-height 220ms cubic-bezier(0.4, 0, 0.2, 1), transform 220ms ease, opacity 180ms ease",
    description: "Accordion compression along Y-axis to prevent collision with Media Player",
  },
  UNFOLD_TO_AVAILABLE: {
    name: "UNFOLD_TO_AVAILABLE",
    durationMs: 240,
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    cssTransition: "max-height 240ms cubic-bezier(0.16, 1, 0.3, 1), transform 240ms ease, opacity 200ms ease",
    description: "Smooth expansion as available vertical geometry increases",
  },
  DISPLAY_DECK_RISE: {
    name: "DISPLAY_DECK_RISE",
    durationMs: 300,
    easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    cssTransition: "transform 300ms cubic-bezier(0.25, 1, 0.5, 1), margin-top 300ms ease",
    description: "Operational deck moves upward to consume space freed by detached monitors",
  },
  DISPLAY_DECK_YIELD: {
    name: "DISPLAY_DECK_YIELD",
    durationMs: 280,
    easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    cssTransition: "transform 280ms cubic-bezier(0.25, 1, 0.5, 1), margin-top 280ms ease",
    description: "Operational deck yields space downward as monitors reattach",
  },
  MONITOR_DETACH: {
    name: "MONITOR_DETACH",
    durationMs: 200,
    easing: "ease-out",
    cssTransition: "transform 200ms ease-out, opacity 200ms ease-out",
    description: "Detached monitor scales down and fades into background registry",
  },
  MONITOR_REATTACH: {
    name: "MONITOR_REATTACH",
    durationMs: 240,
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    cssTransition: "transform 240ms cubic-bezier(0.16, 1, 0.3, 1), opacity 240ms ease",
    description: "Reattached monitor expands into grid with settled canonical bezel",
  },
  MONITOR_SPLIT: {
    name: "MONITOR_SPLIT",
    durationMs: 280,
    easing: "cubic-bezier(0.34, 1.3, 0.64, 1)",
    cssTransition: "grid-template-columns 280ms cubic-bezier(0.34, 1.3, 0.64, 1)",
    description: "Active surface divides with spring physics into multiple viewports",
  },
  MONITOR_MERGE: {
    name: "MONITOR_MERGE",
    durationMs: 240,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    cssTransition: "grid-template-columns 240ms cubic-bezier(0.4, 0, 0.2, 1), transform 240ms ease",
    description: "Multiple monitors fuse into single dominant Monitor 1",
  },
} as const satisfies Record<string, MotionPreset>;

export type AdminMotionPresetName = keyof typeof ADMIN_MOTION_PRESETS;

export function getAdminMotionTransition(
  preset: AdminMotionPresetName,
  reducedMotion = false,
): string {
  if (reducedMotion) {
    return "opacity 120ms ease, transform 0ms linear";
  }
  return ADMIN_MOTION_PRESETS[preset].cssTransition;
}
