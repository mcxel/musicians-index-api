/**
 * EOS AvatarRegistry — Phase 5A (contracts + catalog wiring only).
 *
 * Single EOS entry point for avatar identity contracts. Bridges existing
 * registries/engines (Rule 8) — does not replace UnifiedAvatarRuntime,
 * AvatarSocketSystem, inventory engines, or Prisma models.
 *
 * Deferred to Phase 5B+: mesh/GLB loader, face-scan ML, rigging, lip-sync,
 * AvatarEngine runtime, Branch A/B lounge/WDP shells.
 */

import type { AvatarSocketId } from "@/lib/avatars/AvatarSocketSystem";
import { RIG_SOCKET_MAP } from "@/lib/avatars/AvatarSocketSystem";
import type { BodyBuild } from "@/lib/avatars/UnifiedAvatarRuntime";
import type { AvatarInventoryCategory } from "@/lib/avatar/avatarInventoryEngine";
import type {
  AttachmentPointDefinition,
  AvatarAnimationProfile,
  AvatarInventoryLinks,
  AvatarOwnershipRole,
  AvatarPermissionCapability,
  AvatarRolePermissionDefinition,
  ClothingCompatibilityRule,
  EosAvatarIdentity,
  EosAvatarProfile,
  EosFaceScanProfile,
  EosVoiceProfile,
  EquipChangeMode,
  InventoryAttachmentContract,
  PhysicsProfile,
  SkeletonDefinition,
} from "@/core/eos/avatarContracts";

// ─── Role inheritance / permissions (Rule 26) ─────────────────────────────────

/**
 * Fan owns the avatar. Performers/Bands never own or customize one — they use
 * real photo/video/live. Audience rendering of fan bobbleheads remains active
 * in performer rooms via `reference_audience_avatar` + `control_audience`.
 */
export const AVATAR_ROLE_PERMISSIONS: Record<
  AvatarOwnershipRole,
  AvatarRolePermissionDefinition
> = {
  FAN: {
    role: "FAN",
    entityKind: "fan",
    capabilities: [
      "own_avatar",
      "equip_inventory",
      "studio_customize",
      "face_scan_schema",
      "reference_audience_avatar",
    ],
    notes:
      "Sole ownership role for personal bobblehead + inventory (Rule 26). Gate Avatar Studio with RoleGate allow=['FAN'].",
  },
  PERFORMER: {
    role: "PERFORMER",
    entityKind: "performer",
    capabilities: ["reference_audience_avatar", "control_audience"],
    notes:
      "Real photo/video/live camera identity. No Avatar Studio, wardrobe, or inventory ownership. Audience still fills with fan avatars.",
  },
  BAND: {
    role: "BAND",
    entityKind: "performer",
    capabilities: ["reference_audience_avatar", "control_audience"],
    notes: "Same identity policy as PERFORMER (Rule 26).",
  },
  HOST: {
    role: "HOST",
    entityKind: "host",
    capabilities: ["system_npc_avatar", "reference_audience_avatar"],
    notes:
      "System/host characters via HostEntityRuntime + npcAvatarRegistry / CANONICAL_CHARACTERS. Not fan-owned.",
  },
  JUDGE: {
    role: "JUDGE",
    entityKind: "judge",
    capabilities: ["system_npc_avatar", "reference_audience_avatar"],
    notes: "Panel/judge presence entities — system or assigned, not fan wardrobe.",
  },
  BOT: {
    role: "BOT",
    entityKind: "bot",
    capabilities: ["system_npc_avatar", "reference_audience_avatar"],
    notes:
      "Bot crowd fill / NPC presence. Must use botTransparencyPolicy — never impersonate humans.",
  },
  DJ: {
    role: "DJ",
    entityKind: "dj",
    capabilities: ["system_npc_avatar", "reference_audience_avatar"],
    notes: "DJ booth presence (e.g. Record Ralph). System character, not fan avatar ownership.",
  },
  MASCOT: {
    role: "MASCOT",
    entityKind: "mascot",
    capabilities: ["system_npc_avatar"],
    notes: "Platform mascots (Bebo). Defined in CANONICAL_CHARACTERS.",
  },
  VENUE: {
    role: "VENUE",
    capabilities: ["reference_audience_avatar"],
    notes: "No personal avatar. May observe venue audience avatar occupancy.",
  },
  PROMOTER: {
    role: "PROMOTER",
    capabilities: ["reference_audience_avatar"],
    notes: "No personal avatar ownership.",
  },
  SPONSOR: {
    role: "SPONSOR",
    capabilities: ["reference_audience_avatar"],
    notes: "No personal avatar ownership.",
  },
  ADVERTISER: {
    role: "ADVERTISER",
    capabilities: ["reference_audience_avatar"],
    notes: "No personal avatar ownership.",
  },
  ADMIN: {
    role: "ADMIN",
    capabilities: [
      "admin_observe",
      "reference_audience_avatar",
      "system_npc_avatar",
      "studio_customize",
    ],
    notes:
      "Admin/Staff may access studio for support/debug; does not grant performer accounts avatar ownership.",
  },
  STAFF: {
    role: "STAFF",
    capabilities: ["admin_observe", "reference_audience_avatar", "studio_customize"],
    notes: "Same support path as ADMIN for Avatar Studio tooling.",
  },
};

export function getAvatarRolePermissions(
  role: AvatarOwnershipRole
): AvatarRolePermissionDefinition {
  return AVATAR_ROLE_PERMISSIONS[role];
}

export function roleHasAvatarCapability(
  role: AvatarOwnershipRole,
  capability: AvatarPermissionCapability
): boolean {
  return AVATAR_ROLE_PERMISSIONS[role].capabilities.includes(capability);
}

/** Rule 26 hard gate: only FAN owns a personal avatar. */
export function canOwnAvatar(role: AvatarOwnershipRole): boolean {
  return roleHasAvatarCapability(role, "own_avatar");
}

/**
 * Normalize session/Prisma role strings into AvatarOwnershipRole.
 * Unknown roles default to the safest non-owner interpretation (reference only).
 */
export function sessionRoleToAvatarOwnershipRole(raw: string | undefined | null): AvatarOwnershipRole {
  const r = (raw ?? "").toUpperCase();
  if (r === "FAN" || r === "MEMBER") return "FAN";
  if (r === "PERFORMER" || r === "ARTIST") return "PERFORMER";
  if (r === "BAND") return "BAND";
  if (r === "HOST") return "HOST";
  if (r === "JUDGE") return "JUDGE";
  if (r === "BOT" || r === "NPC") return "BOT";
  if (r === "DJ") return "DJ";
  if (r === "MASCOT") return "MASCOT";
  if (r === "VENUE") return "VENUE";
  if (r === "PROMOTER") return "PROMOTER";
  if (r === "SPONSOR") return "SPONSOR";
  if (r === "ADVERTISER") return "ADVERTISER";
  if (r === "ADMIN" || r === "SUPERADMIN") return "ADMIN";
  if (r === "STAFF") return "STAFF";
  return "PERFORMER";
}

// ─── Skeleton catalog ─────────────────────────────────────────────────────────

function boneRefsForClass(avatarClass: SkeletonDefinition["avatarClass"]): string[] {
  const map = RIG_SOCKET_MAP[avatarClass] ?? {};
  return Object.values(map).filter((v): v is string => typeof v === "string" && v.length > 0);
}

export const SKELETON_REGISTRY: Record<string, SkeletonDefinition> = {
  skeleton_biped_tmi_base: {
    id: "skeleton_biped_tmi_base",
    displayName: "TMI Base Humanoid",
    avatarClass: "biped",
    boneNameRefs: boneRefsForClass("biped"),
    socketMapClass: "biped",
    headAttachmentProfileId: "head-profile-average",
    notes:
      "Canonical fan/host humanoid rig ref. GLB loader deferred to 5B+. Head attachment bridges HeadAttachmentProfile.",
  },
  skeleton_robot_bebo: {
    id: "skeleton_robot_bebo",
    displayName: "Bebo Robot Rig",
    avatarClass: "robot",
    boneNameRefs: boneRefsForClass("robot"),
    socketMapClass: "robot",
    notes: "Mascot/system rig for Bebo. Socket map from AvatarSocketSystem.RIG_SOCKET_MAP.robot.",
  },
  skeleton_quadruped_base: {
    id: "skeleton_quadruped_base",
    displayName: "Quadruped Base",
    avatarClass: "quadruped",
    boneNameRefs: boneRefsForClass("quadruped"),
    socketMapClass: "quadruped",
    notes: "Creature class — paw/tail sockets only.",
  },
  skeleton_avian_base: {
    id: "skeleton_avian_base",
    displayName: "Avian Base",
    avatarClass: "avian",
    boneNameRefs: boneRefsForClass("avian"),
    socketMapClass: "avian",
    notes: "Wing/talon socket class.",
  },
  skeleton_creature_base: {
    id: "skeleton_creature_base",
    displayName: "Creature Base",
    avatarClass: "creature",
    boneNameRefs: boneRefsForClass("creature"),
    socketMapClass: "creature",
    notes: "Fantasy/custom creature class.",
  },
};

export function getSkeletonById(id: string): SkeletonDefinition | undefined {
  return SKELETON_REGISTRY[id];
}

export function getDefaultSkeletonForClass(
  avatarClass: SkeletonDefinition["avatarClass"]
): SkeletonDefinition {
  const match = Object.values(SKELETON_REGISTRY).find((s) => s.avatarClass === avatarClass);
  return match ?? SKELETON_REGISTRY.skeleton_biped_tmi_base;
}

// ─── Attachment points (bridges AvatarSocketSystem) ───────────────────────────

const HEAD_CATEGORIES: AvatarInventoryCategory[] = ["hats", "glasses", "jewelry", "accessories"];
const TORSO_CATEGORIES: AvatarInventoryCategory[] = ["outfits", "jackets", "accessories", "jewelry"];
const FEET_CATEGORIES: AvatarInventoryCategory[] = ["outfits"];

export const ATTACHMENT_POINT_CATALOG: AttachmentPointDefinition[] = [
  {
    socketId: "socket_primary_hand",
    label: "Primary Hand",
    category: "hand",
    compatibleItemCategories: ["props", "mic-skins", "emotes"],
  },
  {
    socketId: "socket_secondary_hand",
    label: "Secondary Hand",
    category: "hand",
    compatibleItemCategories: ["props", "emotes"],
  },
  {
    socketId: "socket_head",
    label: "Head / Crown",
    category: "head",
    compatibleItemCategories: HEAD_CATEGORIES,
  },
  {
    socketId: "socket_face",
    label: "Face Plate",
    category: "head",
    compatibleItemCategories: ["glasses", "accessories"],
  },
  {
    socketId: "socket_chest",
    label: "Chest",
    category: "torso",
    compatibleItemCategories: TORSO_CATEGORIES,
  },
  {
    socketId: "socket_back",
    label: "Back",
    category: "torso",
    compatibleItemCategories: ["props", "accessories"],
  },
  {
    socketId: "socket_waist",
    label: "Waist / Belt",
    category: "torso",
    compatibleItemCategories: ["accessories", "jewelry", "props"],
  },
  {
    socketId: "socket_foot_l",
    label: "Left Foot",
    category: "feet",
    compatibleItemCategories: FEET_CATEGORIES,
  },
  {
    socketId: "socket_foot_r",
    label: "Right Foot",
    category: "feet",
    compatibleItemCategories: FEET_CATEGORIES,
  },
  {
    socketId: "socket_mouth",
    label: "Mouth / Beak",
    category: "creature",
    compatibleItemCategories: ["props"],
  },
  {
    socketId: "socket_tail",
    label: "Tail",
    category: "creature",
    compatibleItemCategories: ["props", "accessories"],
  },
  {
    socketId: "socket_wing_l",
    label: "Left Wing",
    category: "creature",
    compatibleItemCategories: ["props"],
  },
  {
    socketId: "socket_wing_r",
    label: "Right Wing",
    category: "creature",
    compatibleItemCategories: ["props"],
  },
  {
    socketId: "socket_horn",
    label: "Horn / Antenna",
    category: "creature",
    compatibleItemCategories: ["accessories"],
  },
  {
    socketId: "socket_paw_front_l",
    label: "Front Left Paw",
    category: "creature",
    compatibleItemCategories: ["props"],
  },
  {
    socketId: "socket_paw_front_r",
    label: "Front Right Paw",
    category: "creature",
    compatibleItemCategories: ["props"],
  },
];

export function getAttachmentPoint(socketId: AvatarSocketId): AttachmentPointDefinition | undefined {
  return ATTACHMENT_POINT_CATALOG.find((p) => p.socketId === socketId);
}

export function getAttachmentPointsForSkeleton(skeletonId: string): AttachmentPointDefinition[] {
  const skeleton = getSkeletonById(skeletonId);
  if (!skeleton) return ATTACHMENT_POINT_CATALOG;
  const supported = new Set(
    Object.keys(RIG_SOCKET_MAP[skeleton.socketMapClass] ?? {}) as AvatarSocketId[]
  );
  return ATTACHMENT_POINT_CATALOG.filter((p) => supported.has(p.socketId));
}

// ─── Animation profiles (ids/refs only) ───────────────────────────────────────

export const AVATAR_ANIMATION_PROFILES: Record<string, AvatarAnimationProfile> = {
  anim_fan_audience_default: {
    id: "anim_fan_audience_default",
    displayName: "Fan Audience Default",
    moveIds: ["head-nod", "lean-back", "shoulder-pop", "boombox-bounce"],
    posePresetIds: ["idle", "watching", "clapping", "cheering", "crowd-sway"],
    expressionPresetIds: ["neutral", "happy", "excited", "hyped"],
    eosAnimationPackId: "fan_lobby_transitions",
  },
  anim_fan_dance_floor: {
    id: "anim_fan_dance_floor",
    displayName: "Fan Dance Floor",
    moveIds: [
      "line-dance-sync",
      "group-pulse",
      "neon-slide",
      "hype-jump",
      "arena-wave",
    ],
    posePresetIds: ["dance-loop", "crowd-sway", "cheering"],
    expressionPresetIds: ["excited", "hyped", "happy"],
    eosAnimationPackId: "dance_transitions",
  },
  anim_host_stage: {
    id: "anim_host_stage",
    displayName: "Host Stage",
    moveIds: ["mic-wave", "crowd-call", "arms-wide", "encore-bow"],
    posePresetIds: ["host-speaking", "mic-hold", "idle", "stage-entry"],
    expressionPresetIds: ["focused", "proud", "hyped"],
    eosAnimationPackId: "stage_show_transitions",
  },
  anim_bot_crowd_fill: {
    id: "anim_bot_crowd_fill",
    displayName: "Bot Crowd Fill",
    moveIds: ["head-nod", "lean-back", "shoulder-pop"],
    posePresetIds: ["idle", "watching", "clapping", "crowd-sway"],
    expressionPresetIds: ["neutral", "happy"],
    eosAnimationPackId: "default_transitions",
  },
};

export function getAvatarAnimationProfile(id: string): AvatarAnimationProfile | undefined {
  return AVATAR_ANIMATION_PROFILES[id];
}

// ─── Physics profiles (constants only) ────────────────────────────────────────

export const PHYSICS_PROFILES: Record<string, PhysicsProfile> = {
  physics_fan_bobble_default: {
    id: "physics_fan_bobble_default",
    displayName: "Fan Bobblehead Default",
    massKg: 70,
    bobbleHeadScale: 1.12,
    clothSimEnabled: false,
    collisionCapsuleHeightM: 1.7,
    collisionCapsuleRadiusM: 0.28,
    notes:
      "Constants/refs only. clothSimEnabled stays false until a real sim ships (Rule 20).",
  },
  physics_host_stage: {
    id: "physics_host_stage",
    displayName: "Host Stage Presence",
    massKg: 75,
    bobbleHeadScale: 1.1,
    clothSimEnabled: false,
    collisionCapsuleHeightM: 1.75,
    collisionCapsuleRadiusM: 0.3,
    notes: "Host/system character capsule constants — no runtime physics engine yet.",
  },
  physics_mascot_bebo: {
    id: "physics_mascot_bebo",
    displayName: "Bebo Mascot",
    massKg: 40,
    bobbleHeadScale: 1.25,
    clothSimEnabled: false,
    collisionCapsuleHeightM: 1.2,
    collisionCapsuleRadiusM: 0.35,
    notes: "Exaggerated mascot proportions; still constants-only.",
  },
};

export function getPhysicsProfile(id: string): PhysicsProfile | undefined {
  return PHYSICS_PROFILES[id];
}

// ─── Clothing / inventory compatibility ───────────────────────────────────────

const ALL_BUILDS: BodyBuild[] = ["slim", "athletic", "average", "curvy", "heavy"];
const BIPED_SKELETON = ["skeleton_biped_tmi_base"];

/**
 * Quick-change vs studio-required classification lives here so inventory UIs
 * and future equip APIs share one contract (Phase 5A requirement).
 */
export const CLOTHING_COMPATIBILITY_RULES: ClothingCompatibilityRule[] = [
  {
    id: "compat_skins_quick",
    itemCategory: "skins",
    attachmentSocket: null,
    loadoutSlot: "skin",
    compatibleSkeletonIds: BIPED_SKELETON,
    compatibleBodyBuilds: "*",
    changeMode: "quick_change",
    notes: "Skin tone swaps from inventory without studio.",
  },
  {
    id: "compat_eyes_quick",
    itemCategory: "eyes",
    attachmentSocket: "socket_face",
    loadoutSlot: "eyes",
    compatibleSkeletonIds: BIPED_SKELETON,
    compatibleBodyBuilds: "*",
    changeMode: "quick_change",
  },
  {
    id: "compat_emotes_quick",
    itemCategory: "emotes",
    attachmentSocket: null,
    compatibleSkeletonIds: Object.keys(SKELETON_REGISTRY),
    compatibleBodyBuilds: "*",
    changeMode: "quick_change",
    notes: "Emotes are animation triggers — always quick-change.",
  },
  {
    id: "compat_props_quick",
    itemCategory: "props",
    attachmentSocket: "socket_primary_hand",
    loadoutSlot: "prop",
    compatibleSkeletonIds: Object.keys(SKELETON_REGISTRY),
    compatibleBodyBuilds: "*",
    changeMode: "quick_change",
    notes: "Hand props attach via AvatarSocketSystem sockets.",
  },
  {
    id: "compat_mic_skins_quick",
    itemCategory: "mic-skins",
    attachmentSocket: "socket_primary_hand",
    loadoutSlot: "prop",
    compatibleSkeletonIds: BIPED_SKELETON,
    compatibleBodyBuilds: "*",
    changeMode: "quick_change",
  },
  {
    id: "compat_accessories_quick",
    itemCategory: "accessories",
    attachmentSocket: "socket_chest",
    loadoutSlot: "accessory",
    compatibleSkeletonIds: BIPED_SKELETON,
    compatibleBodyBuilds: "*",
    changeMode: "quick_change",
  },
  {
    id: "compat_jewelry_quick",
    itemCategory: "jewelry",
    attachmentSocket: "socket_chest",
    loadoutSlot: "accessory",
    compatibleSkeletonIds: BIPED_SKELETON,
    compatibleBodyBuilds: "*",
    changeMode: "quick_change",
  },
  {
    id: "compat_hats_studio",
    itemCategory: "hats",
    attachmentSocket: "socket_head",
    loadoutSlot: "accessory",
    compatibleSkeletonIds: BIPED_SKELETON,
    compatibleBodyBuilds: ALL_BUILDS,
    changeMode: "studio_required",
    conflictsWithCategories: ["hats"],
    notes:
      "Hat fit uses HeadAttachmentProfile collision (hair compress / hide). Studio preview required.",
  },
  {
    id: "compat_glasses_studio",
    itemCategory: "glasses",
    attachmentSocket: "socket_face",
    loadoutSlot: "accessory",
    compatibleSkeletonIds: BIPED_SKELETON,
    compatibleBodyBuilds: ALL_BUILDS,
    changeMode: "studio_required",
    notes: "Face clearance rules in HeadAttachmentProfile — studio fit check.",
  },
  {
    id: "compat_outfits_studio",
    itemCategory: "outfits",
    attachmentSocket: null,
    loadoutSlot: "outfit",
    compatibleSkeletonIds: BIPED_SKELETON,
    compatibleBodyBuilds: ALL_BUILDS,
    changeMode: "studio_required",
    notes: "Full-body outfits need studio body-build preview.",
  },
  {
    id: "compat_jackets_studio",
    itemCategory: "jackets",
    attachmentSocket: "socket_chest",
    loadoutSlot: "outfit",
    compatibleSkeletonIds: BIPED_SKELETON,
    compatibleBodyBuilds: ALL_BUILDS,
    changeMode: "studio_required",
  },
  {
    id: "compat_backgrounds_studio",
    itemCategory: "backgrounds",
    attachmentSocket: null,
    loadoutSlot: "background",
    compatibleSkeletonIds: BIPED_SKELETON,
    compatibleBodyBuilds: "*",
    changeMode: "studio_required",
  },
  {
    id: "compat_lighting_studio",
    itemCategory: "lighting",
    attachmentSocket: null,
    loadoutSlot: "lighting",
    compatibleSkeletonIds: BIPED_SKELETON,
    compatibleBodyBuilds: "*",
    changeMode: "studio_required",
  },
  {
    id: "compat_lighting_packs_studio",
    itemCategory: "lighting-packs",
    attachmentSocket: null,
    loadoutSlot: "lighting",
    compatibleSkeletonIds: BIPED_SKELETON,
    compatibleBodyBuilds: "*",
    changeMode: "studio_required",
  },
];

export function getClothingRulesForCategory(
  category: AvatarInventoryCategory
): ClothingCompatibilityRule[] {
  return CLOTHING_COMPATIBILITY_RULES.filter((r) => r.itemCategory === category);
}

export function getEquipChangeMode(
  category: AvatarInventoryCategory
): EquipChangeMode {
  const rule = CLOTHING_COMPATIBILITY_RULES.find((r) => r.itemCategory === category);
  return rule?.changeMode ?? "studio_required";
}

export function isItemCompatibleWithSkeleton(
  category: AvatarInventoryCategory,
  skeletonId: string,
  bodyBuild?: BodyBuild
): boolean {
  const rules = getClothingRulesForCategory(category);
  if (rules.length === 0) return false;
  return rules.some((rule) => {
    if (!rule.compatibleSkeletonIds.includes(skeletonId)) return false;
    if (rule.compatibleBodyBuilds === "*") return true;
    if (!bodyBuild) return true;
    return rule.compatibleBodyBuilds.includes(bodyBuild);
  });
}

export function buildInventoryAttachmentContract(input: {
  itemId: string;
  category: AvatarInventoryCategory;
  skeletonId: string;
  equipped: boolean;
}): InventoryAttachmentContract {
  const rule = getClothingRulesForCategory(input.category)[0];
  return {
    itemId: input.itemId,
    category: input.category,
    changeMode: rule?.changeMode ?? "studio_required",
    attachmentSocket: rule?.attachmentSocket ?? null,
    skeletonId: input.skeletonId,
    equipped: input.equipped,
  };
}

// ─── Face scan / voice schema templates (no pipeline) ─────────────────────────

export function createEmptyFaceScanProfile(userId: string): EosFaceScanProfile {
  return {
    id: `facescan_${userId}`,
    userId,
    status: "none",
    uvPlateId: "bobblehead-face-scan-plate-02",
    notes:
      "Schema only. No face-scan/ML/rigging/lip-sync pipeline. Do not wire FaceScanIdentityEngine stubs as production truth (Rule 18/20).",
  };
}

export function createEmptyVoiceProfile(userId: string | null): EosVoiceProfile {
  return {
    id: userId ? `voice_${userId}` : "voice_system_default",
    userId,
    lipSyncEnabled: false,
    notes:
      "Schema only. lipSyncEnabled is permanently false until a real lip-sync pipeline ships.",
  };
}

export function createInventoryLinks(input: {
  avatarId: string;
  ownerUserId: string;
  equippedItemIds?: string[];
}): AvatarInventoryLinks {
  return {
    id: `invlink_${input.avatarId}`,
    avatarId: input.avatarId,
    ownerUserId: input.ownerUserId,
    equippedItemIds: input.equippedItemIds ?? [],
    inventorySource: "avatarInventoryEngine",
    loadoutSlotRefs: {
      skin: null,
      hair: null,
      eyes: null,
      accessory: null,
      outfit: null,
      prop: null,
      background: null,
      lighting: null,
    },
  };
}

// ─── Identity factories (contracts only — no DB writes) ───────────────────────

export function createFanAvatarIdentityDraft(input: {
  userId: string;
  displayName: string;
  prismaIdentityId?: string;
  prismaConfigId?: string;
}): EosAvatarIdentity {
  const now = new Date().toISOString();
  return {
    id: `eos_avatar_fan_${input.userId}`,
    ownerUserId: input.userId,
    ownershipRole: "FAN",
    kind: "fan",
    displayName: input.displayName,
    skeletonId: "skeleton_biped_tmi_base",
    animationProfileId: "anim_fan_audience_default",
    physicsProfileId: "physics_fan_bobble_default",
    faceScanProfileId: `facescan_${input.userId}`,
    voiceProfileId: `voice_${input.userId}`,
    inventoryLinkId: `invlink_eos_avatar_fan_${input.userId}`,
    prismaIdentityId: input.prismaIdentityId,
    prismaConfigId: input.prismaConfigId,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Performer identity draft for audience-reference contexts only.
 * ownerUserId is null — performers do not own an avatar (Rule 26).
 */
export function createPerformerAudienceRefIdentity(input: {
  performerUserId: string;
  displayName: string;
}): EosAvatarIdentity {
  const now = new Date().toISOString();
  return {
    id: `eos_avatar_ref_performer_${input.performerUserId}`,
    ownerUserId: null,
    ownershipRole: "PERFORMER",
    kind: "performer",
    displayName: input.displayName,
    skeletonId: "skeleton_biped_tmi_base",
    animationProfileId: "anim_host_stage",
    physicsProfileId: "physics_host_stage",
    createdAt: now,
    updatedAt: now,
  };
}

export function buildEosAvatarProfile(
  identity: EosAvatarIdentity,
  extras?: Partial<Omit<EosAvatarProfile, "identity">>
): EosAvatarProfile {
  const skeleton = getSkeletonById(identity.skeletonId) ?? getDefaultSkeletonForClass("biped");
  return {
    identity,
    avatarClass: skeleton.avatarClass,
    equippedItemIds: extras?.equippedItemIds ?? [],
    unlockedMoveIds: extras?.unlockedMoveIds ?? [],
    bodyBuild: extras?.bodyBuild,
    appearanceRef: extras?.appearanceRef,
  };
}

/**
 * Boot integrity probe — loads catalog tables and enforces Rule 26 ownership gates.
 * No mesh/runtime side effects. Safe to call from EOSKernel boot (LOAD_REGISTRIES).
 */
export function assertAvatarRegistryIntegrity(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  if (Object.keys(SKELETON_REGISTRY).length === 0) {
    errors.push("AvatarRegistry: SKELETON_REGISTRY is empty");
  }
  if (ATTACHMENT_POINT_CATALOG.length === 0) {
    errors.push("AvatarRegistry: ATTACHMENT_POINT_CATALOG is empty");
  }
  if (Object.keys(AVATAR_ANIMATION_PROFILES).length === 0) {
    errors.push("AvatarRegistry: AVATAR_ANIMATION_PROFILES is empty");
  }
  if (Object.keys(PHYSICS_PROFILES).length === 0) {
    errors.push("AvatarRegistry: PHYSICS_PROFILES is empty");
  }
  if (CLOTHING_COMPATIBILITY_RULES.length === 0) {
    errors.push("AvatarRegistry: CLOTHING_COMPATIBILITY_RULES is empty");
  }

  if (!canOwnAvatar("FAN")) {
    errors.push("AvatarRegistry: Rule 26 violation — FAN must own_avatar");
  }
  if (canOwnAvatar("PERFORMER") || canOwnAvatar("BAND")) {
    errors.push("AvatarRegistry: Rule 26 violation — PERFORMER/BAND must not own_avatar");
  }

  const base = getSkeletonById("skeleton_biped_tmi_base");
  if (!base) {
    errors.push("AvatarRegistry: missing canonical skeleton_biped_tmi_base");
  }

  return { ok: errors.length === 0, errors };
}
