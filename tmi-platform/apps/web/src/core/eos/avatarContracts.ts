/**
 * EOS Avatar Identity Contracts — Phase 5A (data/types only).
 *
 * Canonical contract layer for AvatarRegistry. Does NOT load meshes, run face-scan,
 * or pretend to animate faces (Rule 18 Asset Realization + Rule 20 Reality Rule).
 *
 * Existing sources this contracts layer bridges (Rule 8 — do not duplicate):
 *   - lib/avatars/UnifiedAvatarRuntime.ts     → AvatarEntity / appearance / kinds
 *   - lib/avatars/AvatarSocketSystem.ts       → socket IDs + RIG_SOCKET_MAP
 *   - lib/avatar/HeadAttachmentProfile.ts     → neck/scalp/hat collision
 *   - lib/avatar/avatarInventoryEngine.ts     → inventory item categories
 *   - systems/avatar/types.ts                 → evolution AvatarIdentity (poses/costumes)
 *   - packages/db Prisma AvatarIdentity/Config → persisted fan DNA + bobblehead JSON
 *   - lib/hosts/npcAvatarRegistry.ts          → system NPC avatar entities
 *   - lib/assets/avatarRegistry.ts            → reconstructed asset map (asset pipeline only)
 *
 * Naming: Eos* prefixes avoid collisions with the many existing AvatarIdentity /
 * AvatarProfile / FaceScanProfile types already in the repo.
 */

import type { AvatarClass, AvatarSocketId } from "@/lib/avatars/AvatarSocketSystem";
import type { AvatarEntityKind, BodyBuild } from "@/lib/avatars/UnifiedAvatarRuntime";
import type { AvatarInventoryCategory } from "@/lib/avatar/avatarInventoryEngine";

// ─── Role / permissions (Rule 26) ─────────────────────────────────────────────

/**
 * Platform account + system roles that interact with avatars.
 * Ownership of a personal bobblehead is FAN-only (Rule 26 Identity Policy).
 * Performers/Bands use real photo/video/live camera; audience seats still render fan avatars.
 */
export type AvatarOwnershipRole =
  | "FAN"
  | "PERFORMER"
  | "BAND"
  | "HOST"
  | "JUDGE"
  | "BOT"
  | "DJ"
  | "MASCOT"
  | "VENUE"
  | "PROMOTER"
  | "SPONSOR"
  | "ADVERTISER"
  | "ADMIN"
  | "STAFF";

export type AvatarPermissionCapability =
  /** Create / customize / persist a personal bobblehead avatar */
  | "own_avatar"
  /** Equip cosmetics/props on an owned avatar */
  | "equip_inventory"
  /** Access Avatar Studio / wardrobe UI */
  | "studio_customize"
  /** Capture face-scan schema fields (pipeline itself is deferred — schema only) */
  | "face_scan_schema"
  /** Render other users' avatars in rooms / lobbies / crowds */
  | "reference_audience_avatar"
  /** Performer audience controls (spotlight, seat moves) — not avatar ownership */
  | "control_audience"
  /** System NPC / host / mascot character definitions */
  | "system_npc_avatar"
  /** Admin observe / debug avatar state */
  | "admin_observe";

export interface AvatarRolePermissionDefinition {
  role: AvatarOwnershipRole;
  capabilities: AvatarPermissionCapability[];
  /** Maps to UnifiedAvatarRuntime AvatarEntityKind when applicable */
  entityKind?: AvatarEntityKind;
  notes: string;
}

// ─── Identity / profile ───────────────────────────────────────────────────────

export interface EosAvatarIdentity {
  id: string;
  /** Owning user id when role can own; null for system/bot/host characters */
  ownerUserId: string | null;
  ownershipRole: AvatarOwnershipRole;
  kind: AvatarEntityKind;
  displayName: string;
  skeletonId: string;
  animationProfileId: string;
  physicsProfileId: string;
  /** Schema ref only — never implies a loaded 3D face mesh */
  faceScanProfileId?: string;
  /** Schema ref only — lip-sync deferred */
  voiceProfileId?: string;
  inventoryLinkId?: string;
  /** Bridges Prisma `AvatarIdentity.id` when persisted for FAN */
  prismaIdentityId?: string;
  /** Bridges Prisma `AvatarConfig.id` (bobbleheadConfig JSON) when present */
  prismaConfigId?: string;
  /** Bridges systems/avatar AvatarIdentity.id (evolution/presence layer) */
  evolutionIdentityId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Consumer-facing snapshot. Appearance fields are refs into UnifiedAvatarRuntime
 * / inventory — not a second appearance system.
 */
export interface EosAvatarProfile {
  identity: EosAvatarIdentity;
  bodyBuild?: BodyBuild;
  avatarClass: AvatarClass;
  appearanceRef?: {
    skinTone?: string;
    hairStyleId?: string;
    outfitId?: string;
    accessoryIds?: string[];
    portraitUrl?: string;
    glowColor?: string;
  };
  equippedItemIds: string[];
  unlockedMoveIds: string[];
}

// ─── Skeleton (refs only — no GLB loader) ─────────────────────────────────────

export interface SkeletonDefinition {
  id: string;
  displayName: string;
  avatarClass: AvatarClass;
  /** Bone name strings expected in a future GLB — documentation refs only */
  boneNameRefs: string[];
  /** Resolves sockets via AvatarSocketSystem.RIG_SOCKET_MAP[avatarClass] */
  socketMapClass: AvatarClass;
  /** Bridges HeadAttachmentProfile id when biped */
  headAttachmentProfileId?: string;
  notes: string;
}

// ─── Attachment points ────────────────────────────────────────────────────────

export type AttachmentPointCategory = "hand" | "head" | "torso" | "feet" | "creature";

export interface AttachmentPointDefinition {
  socketId: AvatarSocketId;
  label: string;
  category: AttachmentPointCategory;
  /** Inventory categories that may attach here */
  compatibleItemCategories: AvatarInventoryCategory[];
}

// ─── Animation profile (ids/refs only) ────────────────────────────────────────

export interface AvatarAnimationProfile {
  id: string;
  displayName: string;
  /** Move ids from UnifiedAvatarRuntime.AVATAR_MOVES */
  moveIds: string[];
  /** Pose preset ids from systems/avatar/poseRegistry */
  posePresetIds: string[];
  /** Expression ids from systems/avatar/expressionRegistry */
  expressionPresetIds: string[];
  /** Optional bridge to EOS AnimationRegistry pack id */
  eosAnimationPackId?: string;
}

// ─── Clothing / inventory compatibility ───────────────────────────────────────

/**
 * Quick-change items equip from inventory / seat UI without opening Avatar Studio.
 * Studio-required items need full body preview / fit calibration (hats with collision,
 * full outfits, face plates, etc.).
 */
export type EquipChangeMode = "quick_change" | "studio_required";

export interface ClothingCompatibilityRule {
  id: string;
  itemCategory: AvatarInventoryCategory;
  /** Primary attachment socket, or null for full-body outfit slots */
  attachmentSocket: AvatarSocketId | null;
  /** Loadout slot name from avatarPersistence AvatarSlot when applicable */
  loadoutSlot?:
    | "skin"
    | "hair"
    | "eyes"
    | "accessory"
    | "outfit"
    | "prop"
    | "background"
    | "lighting";
  compatibleSkeletonIds: string[];
  compatibleBodyBuilds: BodyBuild[] | "*";
  changeMode: EquipChangeMode;
  conflictsWithCategories?: AvatarInventoryCategory[];
  notes?: string;
}

export interface InventoryAttachmentContract {
  itemId: string;
  category: AvatarInventoryCategory;
  changeMode: EquipChangeMode;
  attachmentSocket: AvatarSocketId | null;
  skeletonId: string;
  equipped: boolean;
}

// ─── Physics (constants/refs only — no simulation) ────────────────────────────

export interface PhysicsProfile {
  id: string;
  displayName: string;
  /** Approximate mass constant for future sim — unused at runtime today */
  massKg: number;
  /**
   * Head scale vs body. Rule 18 target: subtle bobblehead ~1.10–1.15
   * (10–15% oversized), not cartoon proportions.
   */
  bobbleHeadScale: number;
  /** Flag only — cloth sim not implemented (Rule 20: do not fake it) */
  clothSimEnabled: boolean;
  collisionCapsuleHeightM: number;
  collisionCapsuleRadiusM: number;
  notes: string;
}

// ─── Face scan (schema only — no pipeline) ────────────────────────────────────

/**
 * Honest status values. Never invent "rendered" / "lip-synced" until a real
 * pipeline exists. FaceScanIdentityEngine stubs must not be wired as truth.
 */
export type FaceScanSchemaStatus = "none" | "captured" | "mapped" | "ready";

export interface EosFaceScanProfile {
  id: string;
  userId: string;
  status: FaceScanSchemaStatus;
  sourceImageRef?: string;
  /** Landmark / feature refs — placeholders for future CV pipeline */
  landmarkRefs?: string[];
  /** Bridges HeadAttachmentProfile.faceScanPlateId */
  uvPlateId?: string;
  /** Asset path ref only — does not mean a mesh is loaded */
  meshAssetRef?: string;
  notes: string;
}

// ─── Voice (schema only) ──────────────────────────────────────────────────────

export interface EosVoiceProfile {
  id: string;
  userId: string | null;
  timbreTag?: string;
  voiceAssetRef?: string;
  /**
   * Hard-locked false until a real lip-sync pipeline ships.
   * Do not flip this to claim animation that does not exist (Rule 20).
   */
  lipSyncEnabled: false;
  notes: string;
}

// ─── Inventory links ──────────────────────────────────────────────────────────

export type AvatarInventorySource =
  | "avatarInventoryEngine"
  | "avatarPersistence"
  | "prisma"
  | "none";

export interface AvatarInventoryLinks {
  id: string;
  avatarId: string;
  ownerUserId: string;
  equippedItemIds: string[];
  inventorySource: AvatarInventorySource;
  /** Mirrors avatarPersistence AvatarLoadout.slots shape */
  loadoutSlotRefs: Partial<
    Record<
      "skin" | "hair" | "eyes" | "accessory" | "outfit" | "prop" | "background" | "lighting",
      string | null
    >
  >;
}

// ─── Registry entry (composed contract) ───────────────────────────────────────

export interface EosAvatarRegistryEntry {
  identity: EosAvatarIdentity;
  skeleton: SkeletonDefinition;
  animationProfile: AvatarAnimationProfile;
  physicsProfile: PhysicsProfile;
  attachmentPoints: AttachmentPointDefinition[];
  clothingRules: ClothingCompatibilityRule[];
  faceScanProfile?: EosFaceScanProfile;
  voiceProfile?: EosVoiceProfile;
  inventoryLinks?: AvatarInventoryLinks;
}
