/**
 * JumbotronHardwareChassisCatalog.ts
 *
 * Canonical TMI Jumbotron Hardware Chassis Family & Venue Display Store Catalog
 *
 * Visual References:
 * - 1000009646.jpg: Arena Center-Hung Stadium Scoreboard (Hockey, Basketball, Soccer, Boxing)
 * - 1000009644.jpg: Upper LED Ring + Canted Multi-Faced Angular Chassis
 * - 1000009632.jpg: Multi-Ring Arena Suspended Model & Concourse Walls
 * - 1000009630.jpg: Compact 4-Sided Hanging Cube over MMA / Boxing Ring
 *
 * Laws:
 * 1. Physical Hardware Diversity: Every chassis is an authentic 3D structure with real addressable surfaces.
 * 2. Lane D Commerce Integration: Chassis mapped to StoreItem SKUs with real Stripe settlement & entitlements.
 * 3. Ghost Preview: "PREVIEW IN MY VENUE" sightline verification before purchase.
 * 4. Anti-Fake Law: Hardware optimizes presentation strategy, never fabricates telemetry or audience impressions.
 */

export type DisplayHardwareType =
  | 'CENTER_HUNG_CUBE'
  | 'ARENA_PRO_HYBRID'
  | 'MINI_JUMBOTRON'
  | 'MEGA_WALL'
  | 'FACADE_SCREEN'
  | 'RIBBON_BOARD_360'
  | 'VERTICAL_BANNER'
  | 'BLIMP_DISPLAY'
  | 'SKY_PROJECTION';

export type HardwareRarityTier = 'STANDARD' | 'PRO' | 'ELITE' | 'CHAMPIONSHIP';

export interface DisplayHardwareCapability {
  skuId: string;
  name: string;
  chassisType: DisplayHardwareType;
  description: string;
  rarityTier: HardwareRarityTier;
  prestigePoints: number;
  priceCents: number;
  physicalDimensionsMeters: {
    width: number;
    height: number;
    depth: number;
    groundClearanceMinMeters: number;
  };
  faceCount: number;
  faceAspectRatios: string[];
  ringCount: number; // Upper / Lower LED info rings
  underbellyPanels: number; // Downward-facing panels for court/stage floor viewers
  maxSimultaneousSources: number;
  sponsorSurfaceCount: number;
  supportedCompositionModes: string[];
  worldCompatibility: Array<
    | 'WORLD_CONCERT_ARENA'
    | 'BATTLE_ARENA'
    | 'CHALLENGE_ARENA'
    | 'MONDAY_NIGHT_STAGE'
    | 'FAN_LOBBY'
    | 'OUTDOOR_STADIUM'
  >;
  suspensionType: 'ROOF_TRUSS_CABLE' | 'CEILING_FLUSH' | 'GROUND_STANCHION' | 'AERIAL_BLIMP';
}

export const CANONICAL_HARDWARE_CATALOG: DisplayHardwareCapability[] = [
  // 1. ARENA PRO HYBRID (Top-tier stadium chassis with dual rings and underbelly displays)
  {
    skuId: 'sku_hw_arena_pro_hybrid_01',
    name: 'Apex Stadium Arena Pro Hybrid',
    chassisType: 'ARENA_PRO_HYBRID',
    description:
      'Championship center-hung octagonal chassis with dual high-resolution LED rings, 4 canted main faces, and 4 downward-directed underbelly displays.',
    rarityTier: 'CHAMPIONSHIP',
    prestigePoints: 5000,
    priceCents: 49900,
    physicalDimensionsMeters: {
      width: 9.5,
      height: 7.2,
      depth: 9.5,
      groundClearanceMinMeters: 9.3,
    },
    faceCount: 4,
    faceAspectRatios: ['16:9', '16:9', '16:9', '16:9'],
    ringCount: 2, // Upper + Lower Ribbon Rings
    underbellyPanels: 4, // Underbelly North, East, South, West
    maxSimultaneousSources: 10,
    sponsorSurfaceCount: 8,
    supportedCompositionModes: [
      'FULL_SCREEN',
      'PIP_TOP_RIGHT',
      'SPLIT_HORIZONTAL',
      'QUAD',
      'SCORE_STRIP',
      'LOWER_THIRD',
    ],
    worldCompatibility: ['WORLD_CONCERT_ARENA', 'BATTLE_ARENA', 'CHALLENGE_ARENA'],
    suspensionType: 'ROOF_TRUSS_CABLE',
  },

  // 2. CENTER HUNG CUBE (Classic arena hanging scoreboard)
  {
    skuId: 'sku_hw_center_cube_01',
    name: 'Metropolis Classic 4-Sided Cube',
    chassisType: 'CENTER_HUNG_CUBE',
    description:
      'High-impact 4-sided hanging cube scoreboard engineered for arena battles, cyphers, and live shows.',
    rarityTier: 'PRO',
    prestigePoints: 2500,
    priceCents: 24900,
    physicalDimensionsMeters: {
      width: 6.0,
      height: 4.5,
      depth: 6.0,
      groundClearanceMinMeters: 8.0,
    },
    faceCount: 4,
    faceAspectRatios: ['16:9', '16:9', '16:9', '16:9'],
    ringCount: 0,
    underbellyPanels: 0,
    maxSimultaneousSources: 4,
    sponsorSurfaceCount: 4,
    supportedCompositionModes: ['FULL_SCREEN', 'PIP_TOP_RIGHT', 'SCORE_STRIP'],
    worldCompatibility: ['BATTLE_ARENA', 'CHALLENGE_ARENA', 'MONDAY_NIGHT_STAGE'],
    suspensionType: 'ROOF_TRUSS_CABLE',
  },

  // 3. MINI JUMBOTRON (Bar, social lounge & fan lobby display)
  {
    skuId: 'sku_hw_mini_jumbotron_01',
    name: 'Velocity Mini 4-Sided Cube',
    chassisType: 'MINI_JUMBOTRON',
    description:
      'Compact 4-sided hanging ceiling display cube designed for social lounges, private viewing rooms, and fan lobbies.',
    rarityTier: 'STANDARD',
    prestigePoints: 1000,
    priceCents: 9900,
    physicalDimensionsMeters: {
      width: 2.2,
      height: 1.6,
      depth: 2.2,
      groundClearanceMinMeters: 3.2,
    },
    faceCount: 4,
    faceAspectRatios: ['16:9', '16:9', '16:9', '16:9'],
    ringCount: 0,
    underbellyPanels: 0,
    maxSimultaneousSources: 4,
    sponsorSurfaceCount: 2,
    supportedCompositionModes: ['FULL_SCREEN', 'PIP_TOP_RIGHT'],
    worldCompatibility: ['FAN_LOBBY', 'MONDAY_NIGHT_STAGE'],
    suspensionType: 'CEILING_FLUSH',
  },

  // 4. OUTDOOR MEGA WALL (Stadium architectural display wall)
  {
    skuId: 'sku_hw_mega_wall_01',
    name: 'Titan Outdoor Architectural Mega-Wall',
    chassisType: 'MEGA_WALL',
    description:
      'Massive 32:9 curved stadium end-zone display wall for open-air festival concerts and massive tournaments.',
    rarityTier: 'ELITE',
    prestigePoints: 4000,
    priceCents: 39900,
    physicalDimensionsMeters: {
      width: 32.0,
      height: 12.0,
      depth: 1.5,
      groundClearanceMinMeters: 4.0,
    },
    faceCount: 1,
    faceAspectRatios: ['32:9'],
    ringCount: 0,
    underbellyPanels: 0,
    maxSimultaneousSources: 6,
    sponsorSurfaceCount: 4,
    supportedCompositionModes: ['FULL_SCREEN', 'SPLIT_HORIZONTAL', 'QUAD', 'LOWER_THIRD'],
    worldCompatibility: ['OUTDOOR_STADIUM', 'WORLD_CONCERT_ARENA'],
    suspensionType: 'GROUND_STANCHION',
  },

  // 5. BLIMP DISPLAY (Aerial cruising display for open-air festival skies)
  {
    skuId: 'sku_hw_blimp_display_01',
    name: 'Zephyr Sovereign Aerial Blimp Screen',
    chassisType: 'BLIMP_DISPLAY',
    description:
      'Autonomous ambient aerial blimp cruising above outdoor venues with dual Port/Starboard LED displays and a continuous lower banner.',
    rarityTier: 'ELITE',
    prestigePoints: 4500,
    priceCents: 45000,
    physicalDimensionsMeters: {
      width: 45.0,
      height: 14.0,
      depth: 14.0,
      groundClearanceMinMeters: 40.0,
    },
    faceCount: 3, // Port, Starboard, Lower Banner
    faceAspectRatios: ['16:9', '16:9', '32:1'],
    ringCount: 0,
    underbellyPanels: 1,
    maxSimultaneousSources: 3,
    sponsorSurfaceCount: 3,
    supportedCompositionModes: ['FULL_SCREEN', 'SCORE_STRIP'],
    worldCompatibility: ['OUTDOOR_STADIUM'],
    suspensionType: 'AERIAL_BLIMP',
  },
];

export class JumbotronHardwareChassisRegistry {
  private catalog: Map<string, DisplayHardwareCapability> = new Map();

  constructor() {
    for (const hw of CANONICAL_HARDWARE_CATALOG) {
      this.catalog.set(hw.skuId, hw);
    }
  }

  public getHardware(skuId: string): DisplayHardwareCapability | undefined {
    return this.catalog.get(skuId);
  }

  public getAllHardware(): DisplayHardwareCapability[] {
    return Array.from(this.catalog.values());
  }

  public getCompatibleHardware(
    venueType: 'WORLD_CONCERT_ARENA' | 'BATTLE_ARENA' | 'CHALLENGE_ARENA' | 'MONDAY_NIGHT_STAGE' | 'FAN_LOBBY' | 'OUTDOOR_STADIUM'
  ): DisplayHardwareCapability[] {
    return Array.from(this.catalog.values()).filter((hw) =>
      hw.worldCompatibility.includes(venueType)
    );
  }

  /**
   * Generates a "PREVIEW IN MY VENUE" simulation state
   */
  public generateGhostPreview(
    skuId: string,
    venueCeilingHeightMeters: number
  ): {
    canFit: boolean;
    reason?: string;
    suggestedWorldPosition: [number, number, number];
    sightlineAngleDeg: number;
  } {
    const hw = this.catalog.get(skuId);
    if (!hw) {
      return {
        canFit: false,
        reason: 'Unknown hardware SKU',
        suggestedWorldPosition: [0, 0, 0],
        sightlineAngleDeg: 0,
      };
    }

    const requiredHeight =
      hw.physicalDimensionsMeters.height + hw.physicalDimensionsMeters.groundClearanceMinMeters;

    if (venueCeilingHeightMeters < requiredHeight) {
      return {
        canFit: false,
        reason: `Ceiling height (${venueCeilingHeightMeters}m) is too low for this hardware (requires >= ${requiredHeight}m).`,
        suggestedWorldPosition: [0, 0, 0],
        sightlineAngleDeg: 0,
      };
    }

    const elevation =
      hw.physicalDimensionsMeters.groundClearanceMinMeters + hw.physicalDimensionsMeters.height / 2;

    return {
      canFit: true,
      suggestedWorldPosition: [0, elevation, 0],
      sightlineAngleDeg: 28.5, // optimal sightline for seated viewers
    };
  }
}
