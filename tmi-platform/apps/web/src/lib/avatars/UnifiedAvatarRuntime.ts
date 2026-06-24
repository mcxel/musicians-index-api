/**
 * UnifiedAvatarRuntime — one canonical AvatarEntity for every entity in the TMI world.
 *
 * Fan / Performer / Host / Bot / DJ / Judge are all AvatarEntity.
 * Adapters convert from existing subsystem types into this canonical shape:
 *   AudienceMember  (audienceRuntimeEngine)     → AvatarEntity
 *   AudienceAvatar  (AudienceVisibilityEngine)  → AvatarEntity
 *   HostEntity      (HostEntityRuntime)          → AvatarEntity
 *
 * Rendering path:
 *   AvatarEntity → toRendererState() → AvatarRendererRegistry.Component({ state })
 *   (currently 2D_ANIMATED; swap to 3D_MESH when pipeline exists — no consumer changes)
 *
 * Character roster seeded from tmi_3d_character_system.html blueprint (CHARS, TIERS,
 * BODY, SKINS, MOVES, ZONES data).
 *
 * Rule 18 scope honesty: no face-scan/rigging/lip-sync pipeline exists yet.
 * This file owns the data layer; the renderer owns the drawing layer.
 * When the 3D renderer arrives, plug it into AvatarRendererRegistry — done.
 */

import type { AvatarEmotion, AvatarGesture, AvatarState as RendererState } from '@/lib/avatars/AvatarRendererContract';
import type { AvatarClass, AvatarSocketId } from '@/lib/avatars/AvatarSocketSystem';
import type { ActiveProp } from '@/lib/avatars/AvatarPropManifest';

export type { AvatarClass, AvatarSocketId };
export type { ActiveProp };

// ─── Core types ───────────────────────────────────────────────────────────────

export type AvatarEntityKind = 'fan' | 'performer' | 'host' | 'bot' | 'judge' | 'dj' | 'mascot';

export type AvatarTierLevel =
  | 'free' | 'pro' | 'ruby' | 'silver' | 'gold' | 'platinum' | 'diamond';

export type AvatarAnimationState =
  | 'idle' | 'sitting' | 'standing' | 'walking' | 'running'
  | 'dancing' | 'clapping' | 'waving' | 'cheering' | 'jumping'
  | 'reacting' | 'gesturing' | 'pointing' | 'laughing' | 'emoting'
  | 'celebrating' | 'entering' | 'exiting' | 'talking' | 'hushing'
  | 'interacting' | 'holding_lighter' | 'holding_candle' | 'holding_flashlight'
  | 'holding_gun' | 'holding_glowstick';

export type AvatarWorldPosition =
  | 'seated'       // in an assigned audience seat
  | 'stage'        // performance stage
  | 'lobby'        // lobby / waiting area
  | 'backstage'
  | 'dance-floor'  // World Dance Party — free movement zone
  | 'lounge'       // WDP lounge / social area
  | 'bar-area'     // WDP bar area
  | 'vip-pods'     // WDP VIP pods
  | 'friend-circle'// WDP friend cluster
  | 'dj-booth'     // DJ position
  | 'vip-box'      // seated VIP section
  | 'judge-panel'; // judge/panel position

// ─── Appearance (from tmi_3d_character_system.html SKINS / BODY / ZONES) ─────

export type SkinTone = 'porcelain' | 'fair' | 'light' | 'medium' | 'tan' | 'brown' | 'deep' | 'ebony';
export type BodyBuild = 'slim' | 'athletic' | 'average' | 'curvy' | 'heavy';
export type BodyHeight = 'short' | 'medium' | 'tall';

export const SKIN_HEX: Record<SkinTone, string> = {
  porcelain: '#FDE8D8',
  fair:      '#F5CBA7',
  light:     '#E8A87C',
  medium:    '#C68642',
  tan:       '#A0522D',
  brown:     '#7B3F00',
  deep:      '#4A2000',
  ebony:     '#3B1A00',
};

/** Visual fidelity style — same AvatarEntity, different renderer target */
export type AvatarRendererStyle = 'bobblehead' | 'semi-realistic' | 'ultra-realistic';

export interface AvatarAppearance {
  skinTone:     SkinTone;
  bodyBuild:    BodyBuild;
  bodyHeight:   BodyHeight;
  hairStyleId?: string;
  outfitId?:    string;
  accessoryIds?: string[];
  glowColor?:   string;
  portraitUrl?: string;
  sourceImageRef?: string;
  /** Preferred rendering style — swapped via AvatarRendererRegistry, same entity data */
  rendererStyle?: AvatarRendererStyle;
}

// ─── Move system (from MOVES in blueprint) ───────────────────────────────────

export interface AvatarMove {
  id:       string;
  label:    string;
  category: 'signature' | 'crowd' | 'battle' | 'dance-party' | 'evolution';
  tierRequired: number; // 1-6 (Rookie–Icon)
}

export const AVATAR_MOVES: AvatarMove[] = [
  // Signature Grooves (all tiers)
  { id: 'boombox-bounce',  label: 'Boombox Bounce',  category: 'signature',    tierRequired: 1 },
  { id: 'chain-swing',     label: 'Gold Chain Swing', category: 'signature',    tierRequired: 1 },
  { id: 'neon-slide',      label: 'Neon Slide',       category: 'signature',    tierRequired: 1 },
  { id: 'stage-stomp',     label: 'Stage Stomp',      category: 'signature',    tierRequired: 1 },
  { id: 'mic-twirl',       label: 'Mic Twirl',        category: 'signature',    tierRequired: 1 },
  { id: 'lean-back',       label: 'Lean Back',        category: 'signature',    tierRequired: 1 },
  { id: 'head-nod',        label: 'Head Nod',         category: 'signature',    tierRequired: 1 },
  { id: 'shoulder-pop',    label: 'Shoulder Pop',     category: 'signature',    tierRequired: 1 },
  // Crowd Interactions
  { id: 'crowd-call',      label: 'Crowd Call',       category: 'crowd',        tierRequired: 2 },
  { id: 'fan-throw',       label: 'Fan Throw',        category: 'crowd',        tierRequired: 2 },
  { id: 'mic-wave',        label: 'Mic Wave',         category: 'crowd',        tierRequired: 2 },
  { id: 'point-pop',       label: 'Point & Pop',      category: 'crowd',        tierRequired: 2 },
  { id: 'hype-jump',       label: 'Hype Jump',        category: 'crowd',        tierRequired: 2 },
  { id: 'arms-wide',       label: 'Arms Wide',        category: 'crowd',        tierRequired: 2 },
  { id: 'crowd-surf',      label: 'Crowd Surf',       category: 'crowd',        tierRequired: 3 },
  { id: 'encore-bow',      label: 'Encore Bow',       category: 'crowd',        tierRequired: 3 },
  // Battle Moves
  { id: 'power-drop',      label: 'Power Drop',       category: 'battle',       tierRequired: 2 },
  { id: 'spin-lock',       label: 'Spin Lock',        category: 'battle',       tierRequired: 2 },
  { id: 'freeze-frame',    label: 'Freeze Frame',     category: 'battle',       tierRequired: 3 },
  { id: 'body-roll',       label: 'Body Roll',        category: 'battle',       tierRequired: 3 },
  { id: 'windmill',        label: 'Windmill',         category: 'battle',       tierRequired: 3 },
  { id: 'footwork-blitz',  label: 'Footwork Blitz',   category: 'battle',       tierRequired: 4 },
  { id: 'flare-combo',     label: 'Flare Combo',      category: 'battle',       tierRequired: 4 },
  { id: 'shadow-mirror',   label: 'Shadow Mirror',    category: 'battle',       tierRequired: 4 },
  // World Dance Party
  { id: 'line-dance-sync', label: 'Line Dance Sync',  category: 'dance-party',  tierRequired: 1 },
  { id: 'group-pulse',     label: 'Group Pulse',      category: 'dance-party',  tierRequired: 1 },
  { id: 'flash-mob-break', label: 'Flash Mob Break',  category: 'dance-party',  tierRequired: 3 },
  { id: 'arena-wave',      label: 'Arena Wave',       category: 'dance-party',  tierRequired: 3 },
  { id: 'circle-cypher',   label: 'Circle Cypher',    category: 'dance-party',  tierRequired: 4 },
  { id: 'mass-freeze',     label: 'Mass Freeze',      category: 'dance-party',  tierRequired: 4 },
  { id: 'chain-reaction',  label: 'Chain Reaction',   category: 'dance-party',  tierRequired: 5 },
  { id: 'grand-finale',    label: 'Grand Finale',     category: 'dance-party',  tierRequired: 5 },
  // Evolution Unlocks
  { id: 'ai-choreography', label: 'AI Choreography',  category: 'evolution',    tierRequired: 5 },
  { id: 'mirror-echo',     label: 'Mirror Echo',      category: 'evolution',    tierRequired: 5 },
  { id: 'clone-split',     label: 'Clone Split',      category: 'evolution',    tierRequired: 6 },
  { id: 'signature-finale',label: 'Signature Finale', category: 'evolution',    tierRequired: 6 },
  { id: 'icon-ascension',  label: 'Icon Ascension',   category: 'evolution',    tierRequired: 6 },
];

// ─── The canonical AvatarEntity type ─────────────────────────────────────────

export interface AvatarEntity {
  id:          string;          // userId | `host-${hostId}` | `bot-${index}`
  kind:        AvatarEntityKind;
  displayName: string;
  tier:        AvatarTierLevel;

  // World placement
  worldPosition: AvatarWorldPosition;
  seatId:   string | null;
  roomId:   string | null;
  groupId:  string | null;

  // State machine
  animState:   AvatarAnimationState;
  emotion:     AvatarEmotion;
  activeEmote: string | null;
  currentLine: string | null;

  // Appearance
  appearance: AvatarAppearance;

  // Spatial (for canvas / 3D world)
  worldX?: number;
  worldY?: number;
  worldZ?: number;
  facing?: number;

  // Avatar class — determines socket bone map in AvatarSocketSystem
  avatarClass: AvatarClass;

  // Equipped props — array of active prop attachments
  equippedProps: ActiveProp[];

  // Lifecycle
  joinedAt:     number;
  lastActiveAt: number;
  isOnline:     boolean;
  isBot:        boolean;

  // Unlocked moves (ids from AVATAR_MOVES)
  unlockedMoveIds: string[];
}

// ─── Character roster (from tmi_3d_character_system.html CHARS array) ────────

export interface CanonicalCharacter {
  id:          string;
  name:        string;
  role:        string;
  kind:        AvatarEntityKind;
  avatarClass: AvatarClass;
  accentColor: string;
  emoji:       string;
  appearance:  AvatarAppearance;
  signatureMoveIds: string[];
}

export const CANONICAL_CHARACTERS: CanonicalCharacter[] = [
  {
    id:   'bebo',
    name: 'Bebo',
    role: 'Platform Mascot · Bobblehead Bot',
    kind: 'mascot',
    avatarClass: 'robot',
    accentColor: '#FF6B1A',
    emoji: '🤖',
    appearance: {
      skinTone:   'medium',
      bodyBuild:  'average',
      bodyHeight: 'short',
      outfitId:   'bebo-staff-gold-chain',
      glowColor:  '#FF6B1A',
      portraitUrl: '/hosts/bebo.png',
    },
    signatureMoveIds: ['boombox-bounce', 'chain-swing', 'crowd-call', 'head-nod'],
  },
  {
    id:   'julius',
    name: 'Julius',
    role: 'Hype Master · VIP Curator',
    kind: 'host',
    avatarClass: 'biped', // meerkat character uses humanoid rig
    accentColor: '#FFD700',
    emoji: '🦦',
    appearance: {
      skinTone:   'tan',
      bodyBuild:  'slim',
      bodyHeight: 'short',
      outfitId:   'julius-fur-coat-vip',
      glowColor:  '#FFD700',
      portraitUrl: '/hosts/julius.png',
    },
    signatureMoveIds: ['fan-throw', 'mic-wave', 'hype-jump', 'encore-bow'],
  },
  {
    id:   'tiana',
    name: 'Tiana (TG)',
    role: 'Monday Night Stage Host',
    kind: 'host',
    avatarClass: 'biped',
    accentColor: '#9B59FF',
    emoji: '🎤',
    appearance: {
      skinTone:   'deep',
      bodyBuild:  'athletic',
      bodyHeight: 'tall',
      outfitId:   'tiana-tg-leather-gold',
      glowColor:  '#9B59FF',
      portraitUrl: '/hosts/tiana.png',
    },
    signatureMoveIds: ['mic-wave', 'stage-stomp', 'point-pop', 'crowd-surf'],
  },
  {
    id:   'ralph',
    name: 'Record Ralph',
    role: 'DJ · Music Curator',
    kind: 'dj',
    avatarClass: 'biped',
    accentColor: '#00D4FF',
    emoji: '🎧',
    appearance: {
      skinTone:   'medium',
      bodyBuild:  'average',
      bodyHeight: 'medium',
      outfitId:   'ralph-hoodie-vinyl',
      glowColor:  '#00D4FF',
      portraitUrl: '/hosts/record-ralph.png',
    },
    signatureMoveIds: ['head-nod', 'shoulder-pop', 'lean-back', 'boombox-bounce'],
  },
];

// ─── Module-level global registry ────────────────────────────────────────────

const _registry = new Map<string, AvatarEntity>();
const _listeners = new Set<(entities: AvatarEntity[]) => void>();

function _emit(): void {
  const all = Array.from(_registry.values());
  _listeners.forEach(fn => fn(all));
}

// ─── Public API — registry operations ────────────────────────────────────────

export function registerEntity(entity: AvatarEntity): void {
  _registry.set(entity.id, entity);
  _emit();
}

export function updateEntityState(
  id: string,
  patch: Partial<Pick<AvatarEntity, 'animState' | 'emotion' | 'activeEmote' | 'currentLine' | 'worldPosition' | 'seatId' | 'equippedProps'>>,
): void {
  const entity = _registry.get(id);
  if (!entity) return;
  Object.assign(entity, patch, { lastActiveAt: Date.now() });
  _emit();
}

export function equipProp(entityId: string, prop: ActiveProp): void {
  const entity = _registry.get(entityId);
  if (!entity) return;
  // One prop per socket — remove any existing prop with same propId before equipping
  entity.equippedProps = entity.equippedProps.filter(p => p.propId !== prop.propId);
  entity.equippedProps.push(prop);
  entity.lastActiveAt = Date.now();
  _emit();
}

export function unequipProp(entityId: string, propId: string): void {
  const entity = _registry.get(entityId);
  if (!entity) return;
  entity.equippedProps = entity.equippedProps.filter(p => p.propId !== propId);
  entity.lastActiveAt = Date.now();
  _emit();
}

export function clearAllProps(entityId: string): void {
  const entity = _registry.get(entityId);
  if (!entity) return;
  entity.equippedProps = [];
  entity.lastActiveAt = Date.now();
  _emit();
}

export function removeEntity(id: string): void {
  _registry.delete(id);
  _emit();
}

export function getEntity(id: string): AvatarEntity | undefined {
  return _registry.get(id);
}

export function getEntitiesForRoom(roomId: string): AvatarEntity[] {
  return Array.from(_registry.values()).filter(e => e.roomId === roomId);
}

export function getAllEntities(): AvatarEntity[] {
  return Array.from(_registry.values());
}

export function onEntitiesChange(callback: (entities: AvatarEntity[]) => void): () => void {
  _listeners.add(callback);
  callback(getAllEntities());
  return () => { _listeners.delete(callback); };
}

export function clearRoom(roomId: string): void {
  for (const [id, entity] of _registry) {
    if (entity.roomId === roomId) _registry.delete(id);
  }
  _emit();
}

// ─── Renderer bridge ─────────────────────────────────────────────────────────

export function toRendererState(entity: AvatarEntity): RendererState {
  return {
    hostId:      entity.id,
    displayName: entity.displayName,
    avatarSrc:   entity.appearance.portraitUrl,
    emotion:     entity.emotion,
    isSpeaking:  entity.animState === 'talking',
    activeLine:  entity.currentLine ?? undefined,
    seatId:      entity.seatId,
  };
}

// ─── Adapters ─────────────────────────────────────────────────────────────────

// AudienceAvatar tier string → AvatarTierLevel
function _tierFromString(tier: string): AvatarTierLevel {
  const map: Record<string, AvatarTierLevel> = {
    free: 'free', pro: 'pro', ruby: 'ruby',
    silver: 'silver', gold: 'gold', platinum: 'platinum', diamond: 'diamond',
    vip: 'gold', premium: 'gold', standard: 'free',
  };
  return map[tier?.toLowerCase()] ?? 'free';
}

// AudienceAvatar.state → AvatarAnimationState
function _animFromAudienceState(s: string): AvatarAnimationState {
  const map: Record<string, AvatarAnimationState> = {
    sitting: 'sitting', clapping: 'clapping', waving: 'waving',
    cheering: 'cheering', idle: 'idle', standing: 'standing',
    dancing: 'dancing', reacting: 'reacting',
  };
  return map[s] ?? 'sitting';
}

// Hex skin colour → SkinTone (approximate)
function _skinToneFromHex(hex: string): SkinTone {
  const entries = Object.entries(SKIN_HEX) as [SkinTone, string][];
  let best: SkinTone = 'medium';
  let bestDist = Infinity;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  for (const [tone, toneHex] of entries) {
    const tr = parseInt(toneHex.slice(1, 3), 16);
    const tg = parseInt(toneHex.slice(3, 5), 16);
    const tb = parseInt(toneHex.slice(5, 7), 16);
    const dist = Math.abs(r - tr) + Math.abs(g - tg) + Math.abs(b - tb);
    if (dist < bestDist) { bestDist = dist; best = tone; }
  }
  return best;
}

/**
 * Convert AudienceAvatar (from AudienceVisibilityEngine) → AvatarEntity.
 */
export function fromAudienceAvatar(
  avatar: {
    userId: string;
    displayName: string;
    avatarImageUrl?: string | null;
    seatId: string;
    state: string;
    tier: string;
    isBot: boolean;
    joinedAt: number;
    lastReactionAt?: number;
    supporterBadge?: string;
  },
  roomId: string,
): AvatarEntity {
  return {
    id:          avatar.userId,
    kind:        avatar.isBot ? 'bot' : 'fan',
    displayName: avatar.displayName,
    tier:        _tierFromString(avatar.tier),
    worldPosition: 'seated',
    seatId:      avatar.seatId,
    roomId,
    groupId:     null,
    animState:   _animFromAudienceState(avatar.state),
    emotion:     'neutral',
    activeEmote: null,
    currentLine: null,
    avatarClass: 'biped',
    equippedProps: [],
    appearance: {
      skinTone:   'medium',
      bodyBuild:  'average',
      bodyHeight: 'medium',
      portraitUrl: avatar.avatarImageUrl ?? undefined,
    },
    joinedAt:     avatar.joinedAt,
    lastActiveAt: avatar.lastReactionAt ?? avatar.joinedAt,
    isOnline:     true,
    isBot:        avatar.isBot,
    unlockedMoveIds: ['head-nod', 'clapping', 'waving'],
  };
}

/**
 * Convert AudienceMember (from audienceRuntimeEngine) → AvatarEntity.
 */
export function fromAudienceMember(
  member: {
    userId: string;
    displayName: string;
    role?: string;
    joinedAt: number;
    seatId: string;
    active: boolean;
    groupId?: string | null;
    avatarUrl?: string | null;
  },
  roomId: string,
): AvatarEntity {
  const roleMap: Record<string, AvatarEntityKind> = {
    performer: 'performer', fan: 'fan', viewer: 'fan', host: 'host', dj: 'dj',
  };
  return {
    id:          member.userId,
    kind:        roleMap[member.role ?? ''] ?? 'fan',
    displayName: member.displayName,
    tier:        'free',
    worldPosition: 'seated',
    seatId:      member.seatId,
    roomId,
    groupId:     member.groupId ?? null,
    animState:   'sitting',
    emotion:     'neutral',
    activeEmote: null,
    currentLine: null,
    avatarClass: 'biped',
    equippedProps: [],
    appearance: {
      skinTone:   'medium',
      bodyBuild:  'average',
      bodyHeight: 'medium',
      portraitUrl: member.avatarUrl ?? undefined,
    },
    joinedAt:     member.joinedAt,
    lastActiveAt: member.joinedAt,
    isOnline:     member.active,
    isBot:        false,
    unlockedMoveIds: ['head-nod', 'clapping', 'waving'],
  };
}

/**
 * Convert HostEntity (from HostEntityRuntime) → AvatarEntity.
 */
export function fromHostEntity(
  host: {
    identity: { id: string; name: string; colorHex: string; role: string };
    state: string;
    seatId: string | null;
    onStage: boolean;
    lastStateChangeAt: number;
    currentLine: string | null;
  },
  roomId: string,
): AvatarEntity {
  const hostStateMap: Record<string, AvatarAnimationState> = {
    idle: 'idle', talking: 'talking', reacting: 'reacting',
    gesturing: 'gesturing', entering: 'entering', exiting: 'exiting',
    celebrating: 'celebrating', hushing: 'hushing', pointing: 'pointing',
    laughing: 'laughing',
  };
  const emotionMap: Record<string, AvatarEmotion> = {
    celebrating: 'celebrate', laughing: 'laugh', reacting: 'shock',
    idle: 'neutral', talking: 'neutral',
  };
  const canon = CANONICAL_CHARACTERS.find(c => c.id === host.identity.id);
  const isRobot = host.identity.id === 'bebo';
  return {
    id:          `host-${host.identity.id}`,
    kind:        (canon?.kind ?? 'host') as AvatarEntityKind,
    displayName: host.identity.name,
    tier:        'diamond',
    worldPosition: host.onStage ? 'stage' : 'seated',
    seatId:      host.seatId,
    roomId,
    groupId:     null,
    animState:   hostStateMap[host.state] ?? 'idle',
    emotion:     emotionMap[host.state] ?? 'neutral',
    activeEmote: null,
    currentLine: host.currentLine,
    avatarClass: isRobot ? 'robot' : 'biped',
    equippedProps: [],
    appearance:  canon?.appearance ?? {
      skinTone:   'medium',
      bodyBuild:  'average',
      bodyHeight: 'medium',
      glowColor:  host.identity.colorHex,
      portraitUrl: `/hosts/${host.identity.id}.png`,
    },
    joinedAt:     host.lastStateChangeAt,
    lastActiveAt: host.lastStateChangeAt,
    isOnline:     true,
    isBot:        false,
    unlockedMoveIds: canon?.signatureMoveIds ?? [],
  };
}

/**
 * Create a bot entity (for BotCrowdFillEngine seat occupants).
 */
export function createBotEntity(
  index: number,
  seatId: string,
  roomId: string,
  skinTone?: SkinTone,
): AvatarEntity {
  const SKIN_TONES: SkinTone[] = ['porcelain', 'fair', 'light', 'medium', 'tan', 'brown', 'deep', 'ebony'];
  const BUILDS: BodyBuild[]    = ['slim', 'athletic', 'average', 'curvy', 'heavy'];
  const HEIGHTS: BodyHeight[]  = ['short', 'medium', 'tall'];
  const tone   = skinTone ?? SKIN_TONES[index % SKIN_TONES.length];
  const build  = BUILDS[index % BUILDS.length];
  const height = HEIGHTS[index % HEIGHTS.length];
  return {
    id:          `bot-${index}-${roomId}`,
    kind:        'bot',
    displayName: `Fan ${index + 1}`,
    tier:        'free',
    worldPosition: 'seated',
    seatId,
    roomId,
    groupId:     null,
    animState:   (['sitting', 'clapping', 'waving', 'idle'] as AvatarAnimationState[])[index % 4],
    emotion:     'neutral',
    activeEmote: null,
    currentLine: null,
    avatarClass: 'biped',
    equippedProps: [],
    appearance: { skinTone: tone, bodyBuild: build, bodyHeight: height },
    joinedAt:     Date.now(),
    lastActiveAt: Date.now(),
    isOnline:     true,
    isBot:        true,
    unlockedMoveIds: ['head-nod', 'clapping'],
  };
}
