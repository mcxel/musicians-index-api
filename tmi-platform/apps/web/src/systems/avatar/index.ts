// ============================================================
// AVATAR EVOLUTION ENGINE — System Index
// TMI Platform — The Musicians Index
// ============================================================

// Core types
export type {
  AvatarRole,
  AvatarPoseState,
  AvatarExpressionState,
  AvatarVenueZone,
  AvatarCostumeCategory,
  AvatarPropCategory,
  AvatarEvolutionTier,
  AvatarIdentity,
  AvatarMemoryProfile,
  AvatarPresenceState,
  AvatarBehaviorContext,
} from './types';

// Pose registry
export { POSE_REGISTRY, getPosesForRole, getDefaultPoseForRole } from './poseRegistry';
export type { PoseDefinition } from './poseRegistry';

// Costume registry
export { COSTUME_REGISTRY, getCostumeById, getCostumesByTier, getCostumesByCategory } from './costumeRegistry';
export type { CostumeDefinition, CostumeItem } from './costumeRegistry';

// Prop registry
export { PROP_REGISTRY, getPropById, getPropsForRole, getPropsByCategory } from './propRegistry';
export type { PropDefinition } from './propRegistry';

// Expression registry
export { EXPRESSION_REGISTRY, getExpressionForTrigger, getExpressionsForPose } from './expressionRegistry';
export type { ExpressionDefinition } from './expressionRegistry';

// Venue binding config
export {
  VENUE_ZONE_REGISTRY,
  getZoneForRole,
  getDefaultZoneForRole,
} from './venueBindingConfig';
export type { VenueZoneDefinition } from './venueBindingConfig';

// Behavior presets
export { BEHAVIOR_PRESETS, resolveBehavior } from './behaviorPresets';
export type { BehaviorRule, RoleBehaviorPreset } from './behaviorPresets';

// Evolution presets
export {
  EVOLUTION_TIERS,
  getTierForPoints,
  getNextTier,
  getPointsToNextTier,
} from './evolutionPresets';
export type { EvolutionTierDefinition } from './evolutionPresets';
