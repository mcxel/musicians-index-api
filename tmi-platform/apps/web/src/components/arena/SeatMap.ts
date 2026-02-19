/**
 * PROMPT #3B: Seat Map Builder with Tiers + Facing Logic
 * Generates seat layouts with correct orientation for "faces vs backs" rendering
 */

import type { SeatState } from '@/types/shared';

export type SeatTier = 'LOWER' | 'MID' | 'UPPER' | 'VIP' | 'STAGE';
export type SeatFacing = 'TOWARD_STAGE' | 'TOWARD_AUDIENCE';

export interface EnhancedSeatState extends SeatState {
  row: number;
  col: number;
  facing: SeatFacing;
  tier: SeatTier;
  renderDepth: number; // z-index for layering
  yaw: number; // angle in degrees (0 = right, 90 = up, 180 = left, 270 = down)
}

export interface SeatMapConfig {
  totalSeats: number;
  stageCenterX: number;
  stageCenterY: number;
  tiers: {
    lower: { rows: number; seatsPerRow: number; startY: number; arcAmount: number };
    mid: { rows: number; seatsPerRow: number; startY: number; arcAmount: number };
    upper: { rows: number; seatsPerRow: number; startY: number; arcAmount: number };
    vip: { rows: number; seatsPerRow: number; startY: number; arcAmount: number };
  };
}

const DEFAULT_CONFIG: SeatMapConfig = {
  totalSeats: 100,
  stageCenterX: 500,
  stageCenterY: 100,
  tiers: {
    lower: { rows: 3, seatsPerRow: 10, startY: 300, arcAmount: 0.3 },
    mid: { rows: 3, seatsPerRow: 12, startY: 500, arcAmount: 0.4 },
    upper: { rows: 4, seatsPerRow: 14, startY: 700, arcAmount: 0.5 },
    vip: { rows: 1, seatsPerRow: 6, startY: 250, arcAmount: 0.2 },
  },
};

/**
 * Generate audience seats with tiers, arc, and correct facing
 */
export function generateAudienceSeatsWithTiers(
  config: Partial<SeatMapConfig> = {}
): EnhancedSeatState[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const seats: EnhancedSeatState[] = [];

  // Generate each tier
  const tiers: Array<{ tier: SeatTier; config: typeof cfg.tiers.lower }> = [
    { tier: 'VIP', config: cfg.tiers.vip },
    { tier: 'LOWER', config: cfg.tiers.lower },
    { tier: 'MID', config: cfg.tiers.mid },
    { tier: 'UPPER', config: cfg.tiers.upper },
  ];

  tiers.forEach(({ tier, config: tierCfg }) => {
    for (let row = 0; row < tierCfg.rows; row++) {
      for (let col = 0; col < tierCfg.seatsPerRow; col++) {
        // Arc layout: center column is straight, sides curve
        const centerCol = (tierCfg.seatsPerRow - 1) / 2;
        const colOffset = col - centerCol;
        const arcFactor = Math.pow(colOffset / centerCol, 2) * tierCfg.arcAmount;

        const x = cfg.stageCenterX + colOffset * 80;
        const y = tierCfg.startY + row * 80 + arcFactor * 50;
        const z = row; // depth for layering

        // Calculate yaw (angle facing stage)
        const dx = cfg.stageCenterX - x;
        const dy = cfg.stageCenterY - y;
        const yaw = Math.atan2(dy, dx) * (180 / Math.PI);

        seats.push({
          seatId: `${tier.toLowerCase()}-${row}-${col}`,
          position: { x, y, z },
          seatType: tier === 'STAGE' ? 'STAGE' : tier === 'VIP' ? 'VIP' : 'AUDIENCE',
          isReserved: false,
          row,
          col,
          facing: 'TOWARD_STAGE',
          tier,
          renderDepth: z,
          yaw,
        });
      }
    }
  });

  return seats;
}

/**
 * Generate stage seats (performers, judges, host)
 */
export function generateStageSeats(
  stageCenterX: number = 500,
  stageCenterY: number = 100
): EnhancedSeatState[] {
  return [
    // Host center
    {
      seatId: 'host-center',
      position: { x: stageCenterX, y: stageCenterY, z: 0 },
      seatType: 'HOST',
      isReserved: false,
      row: 0,
      col: 0,
      facing: 'TOWARD_AUDIENCE',
      tier: 'STAGE',
      renderDepth: 0,
      yaw: 270, // facing down (toward audience)
    },
    // Judges (side panel)
    {
      seatId: 'judge-1',
      position: { x: stageCenterX - 200, y: stageCenterY + 80, z: 0 },
      seatType: 'JUDGE',
      isReserved: false,
      row: 1,
      col: 0,
      facing: 'TOWARD_AUDIENCE',
      tier: 'STAGE',
      renderDepth: 0,
      yaw: 270,
    },
    {
      seatId: 'judge-2',
      position: { x: stageCenterX, y: stageCenterY + 80, z: 0 },
      seatType: 'JUDGE',
      isReserved: false,
      row: 1,
      col: 1,
      facing: 'TOWARD_AUDIENCE',
      tier: 'STAGE',
      renderDepth: 0,
      yaw: 270,
    },
    {
      seatId: 'judge-3',
      position: { x: stageCenterX + 200, y: stageCenterY + 80, z: 0 },
      seatType: 'JUDGE',
      isReserved: false,
      row: 1,
      col: 2,
      facing: 'TOWARD_AUDIENCE',
      tier: 'STAGE',
      renderDepth: 0,
      yaw: 270,
    },
    // Performers (stage positions)
    {
      seatId: 'performer-1',
      position: { x: stageCenterX - 150, y: stageCenterY + 50, z: 0 },
      seatType: 'STAGE',
      isReserved: false,
      row: 0,
      col: 0,
      facing: 'TOWARD_AUDIENCE',
      tier: 'STAGE',
      renderDepth: 0,
      yaw: 270,
    },
    {
      seatId: 'performer-2',
      position: { x: stageCenterX + 150, y: stageCenterY + 50, z: 0 },
      seatType: 'STAGE',
      isReserved: false,
      row: 0,
      col: 1,
      facing: 'TOWARD_AUDIENCE',
      tier: 'STAGE',
      renderDepth: 0,
      yaw: 270,
    },
  ];
}

/**
 * Determine if we should show "back" sprite based on camera angle
 * @param seatYaw - Seat's yaw (direction avatar is facing)
 * @param cameraYaw - Camera's yaw (direction camera is looking from)
 * @returns true if we should show back sprite
 */
export function isBackFacingCamera(seatYaw: number, cameraYaw: number): boolean {
  // Normalize angles to 0-360
  const normSeat = ((seatYaw % 360) + 360) % 360;
  const normCam = ((cameraYaw % 360) + 360) % 360;

  // Calculate angle difference
  let diff = Math.abs(normSeat - normCam);
  if (diff > 180) diff = 360 - diff;

  // If difference is > 90 degrees, we're looking at the back
  return diff > 90;
}

/**
 * Get seat facing direction as unit vector
 */
export function getSeatFacingVector(yaw: number): { x: number; y: number } {
  const rad = (yaw * Math.PI) / 180;
  return {
    x: Math.cos(rad),
    y: Math.sin(rad),
  };
}

/**
 * Find nearest available seat for auto-assignment
 */
export function findNearestAvailableSeat(
  seats: EnhancedSeatState[],
  preferredTier?: SeatTier
): EnhancedSeatState | null {
  const available = seats.filter((s) => !s.occupiedBy && !s.isReserved);

  if (available.length === 0) return null;

  // If preferred tier specified, try to find in that tier first
  if (preferredTier) {
    const tierSeats = available.filter((s) => s.tier === preferredTier);
    if (tierSeats.length > 0) {
      return tierSeats[0];
    }
  }

  // Otherwise return first available
  return available[0];
}

/**
 * Reserve VIP seats with optional sponsor badge
 */
export function reserveVipSeats(
  seats: EnhancedSeatState[],
  count: number,
  sponsorBadge?: string
): EnhancedSeatState[] {
  const vipSeats = seats.filter((s) => s.tier === 'VIP' && !s.isReserved && !s.occupiedBy);
  const toReserve = vipSeats.slice(0, count);

  toReserve.forEach((seat) => {
    seat.isReserved = true;
    if (sponsorBadge) {
      seat.sponsorBadge = sponsorBadge;
    }
  });

  return toReserve;
}

/**
 * Sponsor placement zones for arena overlays
 */
export const ARENA_SPONSOR_PLACEMENTS = {
  STAGE_BACKGROUND: 'arena.stage.background',
  STAGE_FLOOR_LOGO: 'arena.stage.floor.logo',
  SCOREBOARD_TOP: 'arena.scoreboard.top',
  SCOREBOARD_SIDE: 'arena.scoreboard.side',
  SEAT_BACKREST_VIP: 'arena.seat.vip.backrest',
  LIGHTING_RIG_BANNER: 'arena.lighting.banner',
  JUMBOTRON_OVERLAY: 'arena.jumbotron.overlay',
  CROWD_OVERLAY_LOWER: 'arena.crowd.lower.overlay',
  CROWD_OVERLAY_UPPER: 'arena.crowd.upper.overlay',
} as const;
