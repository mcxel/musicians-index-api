/**
 * AssetRegistry — PBR Material & Texture Asset Registry for TMI 3D Venues.
 *
 * Converts 2D reference source images into PBR (Physically Based Rendering)
 * material manifests: Albedo (Color), Normal (Depth), Roughness (Specular),
 * and Ambient Occlusion (Shadows).
 */

export interface PbrTextureMap {
  albedo: string;       // Base color texture
  normal?: string;      // Bump/depth normal map
  roughness?: string;   // Specular shininess map (0 = mirror, 1 = matte)
  ao?: string;          // Ambient occlusion crevice shadows
  metalness?: string;   // Metallic surface map
}

export interface FurnitureMaterial {
  id: string;
  name: string;
  category: 'leather' | 'wood' | 'metal' | 'fabric' | 'velvet' | 'glass';
  textures: PbrTextureMap;
  roughnessDefault: number;
  metalnessDefault: number;
  colorTint?: string;
}

export interface VenueSkinPbr {
  id: string;
  name: string;
  description: string;
  walls: PbrTextureMap;
  floor: PbrTextureMap;
  ceiling: PbrTextureMap;
  primarySeatingMaterialId: string;
  secondarySeatingMaterialId?: string;
  ambientColor: string;
  environmentMapUrl?: string;
  lightIntensity: number;
}

// ─── FURNITURE MATERIAL REGISTRY ───────────────────────────────────────────────

export const FURNITURE_MATERIALS: Record<string, FurnitureMaterial> = {
  'leather-seat-01': {
    id: 'leather-seat-01',
    name: 'Executive Black Leather',
    category: 'leather',
    textures: {
      albedo: '/assets/venue-materials/leather_black_col.webp',
      normal: '/assets/venue-materials/leather_black_norm.webp',
      roughness: '/assets/venue-materials/leather_black_rough.webp',
      ao: '/assets/venue-materials/leather_black_ao.webp',
    },
    roughnessDefault: 0.35,
    metalnessDefault: 0.05,
    colorTint: '#121216',
  },
  'red-velvet-seat-01': {
    id: 'red-velvet-seat-01',
    name: 'Crimson Theater Velvet',
    category: 'velvet',
    textures: {
      albedo: '/assets/venue-materials/velvet_red_col.webp',
      normal: '/assets/venue-materials/velvet_red_norm.webp',
      roughness: '/assets/venue-materials/velvet_red_rough.webp',
    },
    roughnessDefault: 0.85,
    metalnessDefault: 0.0,
    colorTint: '#CC0000',
  },
  'gold-metal-frame-01': {
    id: 'gold-metal-frame-01',
    name: 'Polished Gold Chrome',
    category: 'metal',
    textures: {
      albedo: '/assets/venue-materials/gold_metal_col.webp',
      roughness: '/assets/venue-materials/gold_metal_rough.webp',
    },
    roughnessDefault: 0.15,
    metalnessDefault: 0.95,
    colorTint: '#FFD700',
  },
  'polished-hardwood-01': {
    id: 'polished-hardwood-01',
    name: 'Mahogany Stage Hardwood',
    category: 'wood',
    textures: {
      albedo: '/assets/venue-materials/wood_mahogany_col.webp',
      normal: '/assets/venue-materials/wood_mahogany_norm.webp',
      roughness: '/assets/venue-materials/wood_mahogany_rough.webp',
    },
    roughnessDefault: 0.25,
    metalnessDefault: 0.0,
    colorTint: '#4A1C0D',
  },
};

// ─── VENUE SKIN PBR MANIFESTS ──────────────────────────────────────────────────

export const VENUE_PBR_MANIFESTS: Record<string, VenueSkinPbr> = {
  'neon-club': {
    id: 'neon-club',
    name: 'Neon Club 3D',
    description: 'Underground club with neon grid floor reflections and leather seats',
    walls: {
      albedo: '/assets/venue-materials/neon_wall_col.webp',
      normal: '/assets/venue-materials/neon_wall_norm.webp',
      roughness: '/assets/venue-materials/neon_wall_rough.webp',
    },
    floor: {
      albedo: '/assets/venue-materials/grid_floor_col.webp',
      normal: '/assets/venue-materials/grid_floor_norm.webp',
      roughness: '/assets/venue-materials/grid_floor_rough.webp',
    },
    ceiling: {
      albedo: '/assets/venue-materials/dark_ceiling_col.webp',
    },
    primarySeatingMaterialId: 'leather-seat-01',
    secondarySeatingMaterialId: 'gold-metal-frame-01',
    ambientColor: '#00FFFF',
    environmentMapUrl: '/assets/venue-materials/env_neon_club.hdr',
    lightIntensity: 1.2,
  },
  'luxury-lounge': {
    id: 'luxury-lounge',
    name: 'Luxury Lounge 3D',
    description: 'Gold marble lounge with velvet seating and warm spotlights',
    walls: {
      albedo: '/assets/venue-materials/marble_gold_col.webp',
      normal: '/assets/venue-materials/marble_gold_norm.webp',
    },
    floor: {
      albedo: '/assets/venue-materials/marble_floor_col.webp',
      roughness: '/assets/venue-materials/marble_floor_rough.webp',
    },
    ceiling: {
      albedo: '/assets/venue-materials/gold_ceiling_col.webp',
    },
    primarySeatingMaterialId: 'red-velvet-seat-01',
    secondarySeatingMaterialId: 'gold-metal-frame-01',
    ambientColor: '#FFD700',
    environmentMapUrl: '/assets/venue-materials/env_luxury_lounge.hdr',
    lightIntensity: 1.0,
  },
};

export function getFurnitureMaterial(id: string): FurnitureMaterial {
  return FURNITURE_MATERIALS[id] ?? FURNITURE_MATERIALS['leather-seat-01']!;
}

export function getVenueSkinPbr(id: string): VenueSkinPbr {
  return VENUE_PBR_MANIFESTS[id] ?? VENUE_PBR_MANIFESTS['neon-club']!;
}
