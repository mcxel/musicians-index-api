/**
 * Avatar Engine — generates and manages avatar configurations.
 * Avatars can be generated from a face scan seed or built manually.
 */

export type SkinTone = 'fair' | 'light' | 'medium' | 'olive' | 'tan' | 'brown' | 'dark' | 'deep';
export type HairStyle =
  | 'short-fade' | 'afro' | 'box-braids' | 'locs' | 'coils' | 'waves'
  | 'cornrows' | 'tapered' | 'long-straight' | 'curly-fro' | 'bald' | 'ponytail';
export type HatStyle = 'none' | 'snapback' | 'fitted' | 'beanie' | 'duraq' | 'do-rag' | 'fitted-tilt' | 'bucket';
export type GlassesStyle = 'none' | 'shades' | 'frames' | 'tinted' | 'visor';
export type ClothesStyle =
  | 'hoodie' | 'tee' | 'jersey' | 'tracksuit' | 'puffy-jacket'
  | 'vest' | 'button-up' | 'dress-shirt' | 'bomber' | 'tank';
export type AccessoryStyle = 'none' | 'chain' | 'grill' | 'earrings' | 'nose-ring' | 'crown';
export type AnimationStyle = 'idle-bounce' | 'sway' | 'nod' | 'freeze' | 'vibe';

export interface AvatarConfig {
  id: string;
  userId?: string;
  skinTone: SkinTone;
  hairStyle: HairStyle;
  hairColor: string;       // hex
  hatStyle: HatStyle;
  hatColor: string;
  glassesStyle: GlassesStyle;
  clothesStyle: ClothesStyle;
  clothesColor: string;
  clothesPrimaryPattern?: string;
  accessory: AccessoryStyle;
  accessoryColor: string;
  animation: AnimationStyle;
  eyeColor: string;
  facialHair?: 'none' | 'beard' | 'mustache' | 'goatee';
  createdAt: string;
  generatedFromFace: boolean;
  avatarSeed?: string;
}

const SEED_SKIN_MAP: SkinTone[] = ['fair', 'light', 'medium', 'olive', 'tan', 'brown', 'dark', 'deep'];
const SEED_HAIR_MAP: HairStyle[] = ['short-fade', 'afro', 'box-braids', 'locs', 'coils', 'waves', 'cornrows', 'tapered'];
const NEON_COLORS = ['#00FFFF', '#FF2DAA', '#AA2DFF', '#FFD700', '#FF9500', '#00FF88', '#FF2200', '#0088FF'];

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h) + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Generate an AvatarConfig deterministically from a face scan seed */
export function generateFromFace(avatarSeed: string, userId?: string): AvatarConfig {
  const h = hashSeed(avatarSeed);
  return {
    id: `avatar_${avatarSeed.slice(-8)}`,
    userId,
    skinTone: SEED_SKIN_MAP[h % SEED_SKIN_MAP.length],
    hairStyle: SEED_HAIR_MAP[(h >> 3) % SEED_HAIR_MAP.length],
    hairColor: NEON_COLORS[(h >> 6) % NEON_COLORS.length],
    hatStyle: 'none',
    hatColor: '#333333',
    glassesStyle: 'none',
    clothesStyle: 'hoodie',
    clothesColor: NEON_COLORS[(h >> 9) % NEON_COLORS.length],
    accessory: 'none',
    accessoryColor: '#FFD700',
    animation: 'idle-bounce',
    eyeColor: '#4A3020',
    facialHair: 'none',
    createdAt: new Date().toISOString(),
    generatedFromFace: true,
    avatarSeed,
  };
}

/** Build the default avatar config for a new user with no face scan */
export function defaultAvatar(userId?: string): AvatarConfig {
  return {
    id: `avatar_default_${Date.now()}`,
    userId,
    skinTone: 'medium',
    hairStyle: 'short-fade',
    hairColor: '#222222',
    hatStyle: 'snapback',
    hatColor: '#111111',
    glassesStyle: 'none',
    clothesStyle: 'hoodie',
    clothesColor: '#00FFFF',
    accessory: 'none',
    accessoryColor: '#FFD700',
    animation: 'idle-bounce',
    eyeColor: '#4A3020',
    facialHair: 'none',
    createdAt: new Date().toISOString(),
    generatedFromFace: false,
  };
}

/** Serialize an AvatarConfig to JSON string for storage */
export function serializeAvatar(config: AvatarConfig): string {
  return JSON.stringify(config);
}

/** Save avatar config to the platform API */
export async function saveAvatar(config: AvatarConfig): Promise<boolean> {
  try {
    const res = await fetch('/api/avatar/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return res.ok;
  } catch {
    return true;
  }
}

/** Load an avatar config for a user */
export async function loadAvatar(userId: string): Promise<AvatarConfig | null> {
  try {
    const res = await fetch(`/api/avatar/load?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
