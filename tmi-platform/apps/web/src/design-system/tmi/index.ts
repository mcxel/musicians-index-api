/**
 * TMI Design System — Complete Export
 *
 * The canonical visual language for The Musician's Index platform.
 * All UI components, tokens, colors, typography, and effects.
 *
 * PHILOSOPHY:
 * - No plain white buttons
 * - Every control has emoji + uppercase label + feature color + glow + motion
 * - 1980s entertainment magazine aesthetic + futuristic broadcast studio
 * - Purple/neon color palette, chrome highlights, glass morphism effects
 * - Users learn the platform visually through consistent color coding
 *
 * USAGE:
 * @example
 * import { TmiFeatureButton, FEATURE_TOKENS, TMI_COLORS } from '@/design-system/tmi';
 *
 * export function MyComponent() {
 *   return (
 *     <TmiFeatureButton feature="playlist" onClick={handleClick}>
 *       PLAYLIST
 *     </TmiFeatureButton>
 *   );
 * }
 */

// ============================================
// COLOR TOKENS
// ============================================
export {
  TMI_COLORS,
  getFeatureColor,
  generateGlowCSS,
  getRGBValues,
} from './colors';

// ============================================
// TYPOGRAPHY TOKENS
// ============================================
export {
  TMI_TYPOGRAPHY,
  applyMagazineStyle,
  applyGlossyEffect,
  applyHeroStyle,
  applyFeatureButtonStyle,
} from './typography';

// ============================================
// MOTION TOKENS
// ============================================
export {
  TMI_MOTION,
  getMotionStyle,
  getCSSAnimation,
} from './motion';

// ============================================
// GLOW EFFECTS
// ============================================
export {
  TMI_GLOW,
  generateTextGlow,
  generateBoxGlow,
  applyGlowStyle,
  applyNeoBorder,
  generateGlowGradient,
  getNeoBorderAnimation,
  getGlossyTextEffect,
  generateParticleEffect,
} from './glow';

// ============================================
// FEATURE TOKENS (Combined Colors + Fonts + Motion)
// ============================================
export {
  FEATURE_TOKENS,
  getFeatureToken,
  getAllFeatureTokens,
  isFeatureAtCapacity,
  type FeatureToken,
} from './featureTokens';

// ============================================
// MATERIAL TOKENS
// ============================================
export {
  TMI_MATERIALS,
  getMaterial,
  applyMaterial,
  getAllMaterials,
  getMaterialsByUsage,
} from './materials';

// ============================================
// SPACING TOKENS
// ============================================
export {
  TMI_SPACING,
  getSpacing,
  getPadding,
  getMargin,
  getGap,
  getResponsiveSpacing,
} from './spacing';

// ============================================
// ELEVATION TOKENS
// ============================================
export {
  TMI_ELEVATION,
  getZIndex,
  getShadow,
  getGlowShadow,
  applyElevation,
  getLayer,
  stackElements,
} from './elevation';

// ============================================
// BORDER TOKENS
// ============================================
export {
  TMI_BORDERS,
  getBorderRadius,
  getBorderWidth,
  getBorderStyle,
  applyBorderPreset,
  getFeatureBorder,
  applyBorderRadius,
} from './borders';

// ============================================
// CANISTER SYSTEM (Window Manager)
// ============================================
export {
  CANISTER_SYSTEM,
  getCanisterConfig,
  getLayoutPreset,
  getDockPosition,
  createCanisterInstance,
  type CanisterState,
  type CanisterDock,
  type LayoutMode,
  type CanisterPosition,
  type CanisterConfig,
  type CanisterInstance,
  type LayoutPreset,
} from './canisterSystem';

// ============================================
// ACCESSIBILITY TOKENS
// ============================================
export {
  TMI_ACCESSIBILITY,
  getTextContrast,
  getAccessibleFocusStyle,
  getTouchTargetPadding,
  getReducedMotionCSS,
  applyAccessibleButton,
  isColorblindSafe,
} from './accessibility';

// ============================================
// COMPONENTS
// ============================================
export {
  TmiFeatureButton,
} from './components/TmiFeatureButton';

export {
  TmiWorkspaceTabs,
  TmiSingleWorkspaceTab,
  TmiWorkspaceTabGrid,
} from './components/TmiWorkspaceTab';

export {
  TmiCountdownCard,
} from './components/TmiCountdownCard';

export {
  TmiSmartPanel,
  TmiSmartPanelsLayout,
} from './components/TmiSmartPanel';

// ============================================
// DESIGN SYSTEM CONSTANTS
// ============================================

export const TMI_DESIGN_SYSTEM = {
  name: 'TMI Visual Language',
  version: '1.0.0',
  philosophy: '1980s Entertainment Magazine + Futuristic Broadcast Studio',
  colorPalette: 'Dark purple/navy + Neon cyan/fuchsia/gold/purple',
  fontStrategy: '4-tier typography system (Hero/Magazine/UI/Countdown)',
  motionLanguage: 'Purposeful animation (chrome sweeps, neon pulses, smooth transitions)',
  buttonLanguage: 'Emoji + Uppercase + Feature Color + Glow + Motion',
  accessibility: 'WCAG AA contrast, icon + color always paired, reduced-motion support',
} as const;
