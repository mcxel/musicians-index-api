/**
 * AvatarSocketSystem — standardized attachment points for all avatar classes.
 *
 * Props attach to sockets, not skeleton bone names. A lighter attaches to
 * socket_primary_hand regardless of whether the rig is a biped human, a
 * meerkat (Julius), a robot (Bebo), a quadruped, or a custom creature.
 *
 * The mapping from canonical socket IDs to rig-specific bone names lives
 * in the RIG_SOCKET_MAP — one row per AvatarClass. When a renderer loads
 * a GLB with its own bone naming convention, it resolves socket IDs through
 * this map rather than hardcoding "Hand.R" everywhere.
 *
 * Derived from the Universal Prop Runtime directive (2026-06-24).
 */

// ─── Socket IDs (canonical, renderer-agnostic) ───────────────────────────────

export type AvatarSocketId =
  | 'socket_primary_hand'    // right hand (dominant)
  | 'socket_secondary_hand'  // left hand
  | 'socket_chest'           // chest center
  | 'socket_back'            // upper back / spine top
  | 'socket_head'            // top of head / crown
  | 'socket_face'            // face center (glasses, face-paint)
  | 'socket_waist'           // hip/belt area
  | 'socket_foot_l'          // left foot
  | 'socket_foot_r'          // right foot
  // Creature / non-biped sockets
  | 'socket_mouth'           // mouth / beak / snout
  | 'socket_tail'            // tail tip
  | 'socket_wing_l'          // left wing tip
  | 'socket_wing_r'          // right wing tip
  | 'socket_horn'            // horn / antenna
  | 'socket_paw_front_l'     // quadruped: front-left paw
  | 'socket_paw_front_r';    // quadruped: front-right paw

// ─── Avatar classes ───────────────────────────────────────────────────────────

export type AvatarClass =
  | 'biped'       // human, humanoid: Fans, Performers, Hosts, Julius, Tiana, Ralph
  | 'quadruped'   // four-legged animal
  | 'avian'       // bird/winged character
  | 'robot'       // mechanical: Bebo
  | 'creature'    // fantasy/custom (dragon, alien, etc.)
  | 'custom';     // user-defined rig with manual socket map

// ─── Rig socket map — resolves canonical ID → rig bone name ─────────────────
//
// These bone name strings are the node names expected inside a .glb file for
// each avatar class. When PropLoader attaches a model, it does:
//   const boneName = RIG_SOCKET_MAP[avatarClass][socketId]
// then queries the Three.js SkinnedMesh's skeleton for that bone.
//
// If a bone name is null, that socket is not supported for that class
// (e.g., quadrupeds have no socket_primary_hand — use socket_paw_front_r).

export const RIG_SOCKET_MAP: Record<AvatarClass, Partial<Record<AvatarSocketId, string | null>>> = {
  biped: {
    socket_primary_hand:   'Hand_R',
    socket_secondary_hand: 'Hand_L',
    socket_chest:          'Chest',
    socket_back:           'Spine2',
    socket_head:           'Head',
    socket_face:           'Head',      // same bone, offset via transform
    socket_waist:          'Hips',
    socket_foot_l:         'Foot_L',
    socket_foot_r:         'Foot_R',
    socket_mouth:          'Jaw',
  },
  robot: {
    socket_primary_hand:   'Manipulator_R',
    socket_secondary_hand: 'Manipulator_L',
    socket_chest:          'TorsoPlate',
    socket_back:           'BackPanel',
    socket_head:           'HeadUnit',
    socket_face:           'FaceScreen',
    socket_waist:          'WaistJoint',
    socket_foot_l:         'Foot_L',
    socket_foot_r:         'Foot_R',
    socket_mouth:          'SpeakerGrill',
  },
  quadruped: {
    socket_paw_front_r:    'Paw_FL',
    socket_paw_front_l:    'Paw_FR',
    socket_mouth:          'Jaw',
    socket_back:           'Spine_Mid',
    socket_tail:           'Tail_Tip',
    socket_head:           'Head',
  },
  avian: {
    socket_primary_hand:   'WingTip_R',
    socket_secondary_hand: 'WingTip_L',
    socket_wing_r:         'WingTip_R',
    socket_wing_l:         'WingTip_L',
    socket_mouth:          'Beak',
    socket_head:           'Head',
    socket_foot_r:         'Talon_R',
    socket_foot_l:         'Talon_L',
  },
  creature: {
    socket_primary_hand:   'Claw_R',
    socket_secondary_hand: 'Claw_L',
    socket_mouth:          'Jaw',
    socket_head:           'Head',
    socket_tail:           'Tail_Tip',
    socket_horn:           'Horn_Tip',
    socket_chest:          'Chest',
    socket_back:           'Spine_Top',
  },
  custom: {}, // user-supplied via AvatarSocketOverride
};

// ─── Socket override for custom rigs ─────────────────────────────────────────

export interface AvatarSocketOverride {
  avatarId: string;
  avatarClass: 'custom';
  overrides: Partial<Record<AvatarSocketId, string>>;
}

const _customOverrides = new Map<string, AvatarSocketOverride>();

export function registerSocketOverride(override: AvatarSocketOverride): void {
  _customOverrides.set(override.avatarId, override);
}

export function getSocketBoneName(
  avatarClass: AvatarClass,
  socketId: AvatarSocketId,
  avatarId?: string,
): string | null {
  // Check per-avatar overrides first
  if (avatarId && avatarClass === 'custom') {
    const override = _customOverrides.get(avatarId);
    if (override?.overrides[socketId]) return override.overrides[socketId]!;
  }
  return RIG_SOCKET_MAP[avatarClass]?.[socketId] ?? null;
}

// ─── Avatar class inference ───────────────────────────────────────────────────
//
// Maps known character IDs to their avatar class so PropLoader can resolve
// socket bone names without needing the caller to pass the class explicitly.

const CHARACTER_CLASS_MAP: Record<string, AvatarClass> = {
  bebo:   'robot',
  julius: 'biped',   // julius is a meerkat but uses humanoid rig
  tiana:  'biped',
  ralph:  'biped',
  // All fan/performer avatars default to biped
};

export function inferAvatarClass(characterIdOrKind: string): AvatarClass {
  return CHARACTER_CLASS_MAP[characterIdOrKind] ?? 'biped';
}

// ─── Socket transform helpers ─────────────────────────────────────────────────

export interface SocketTransform {
  socketId: AvatarSocketId;
  localOffset?: { x: number; y: number; z: number };   // in rig-local space
  localRotation?: { x: number; y: number; z: number }; // Euler in radians
  scale?: number;
}

export const DEFAULT_SOCKET_TRANSFORMS: Partial<Record<AvatarSocketId, SocketTransform>> = {
  socket_primary_hand:   { socketId: 'socket_primary_hand',   localOffset: { x: 0, y: 0.02, z: 0 } },
  socket_secondary_hand: { socketId: 'socket_secondary_hand', localOffset: { x: 0, y: 0.02, z: 0 } },
  socket_head:           { socketId: 'socket_head',           localOffset: { x: 0, y: 0.1,  z: 0 } },
  socket_chest:          { socketId: 'socket_chest',          localOffset: { x: 0, y: 0,    z: 0.05 } },
  socket_waist:          { socketId: 'socket_waist',          localOffset: { x: 0, y: 0,    z: 0 } },
};
