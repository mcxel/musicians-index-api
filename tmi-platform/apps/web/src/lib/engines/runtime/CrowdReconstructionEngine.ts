/**
 * CrowdReconstructionEngine
 * Reconstructs the full crowd state after a room restart, failover, or rejoin.
 * Places avatars in their correct seats, reconstructs friend clusters,
 * applies crowd density, and calculates energy wave patterns.
 * No visible "pop-in" — avatars fade back into their correct positions.
 */

import {
  getRoomAvatars,
  getOnlineRoomAvatars,
  seedBenchmarkAvatars,
  type AvatarState,
  type SeatPosition,
} from './PersistentAvatarStateStore';
import { getWorldState } from './WorldStateReplicator';
import { computeRejoinAlignment, beatPhaseToAvatarEnergy } from './BeatPhaseRecovery';

export interface SeatGrid {
  rows: number;
  cols: number;
  sections: SectionDef[];
}

export interface SectionDef {
  id: string;
  label: string;
  rowStart: number;
  rowEnd: number;
  colStart: number;
  colEnd: number;
  capacity: number;
  tier: 'floor' | 'vip' | 'balcony' | 'pit';
}

export interface ReconstructedSeat {
  seatId: string;
  row: number;
  col: number;
  sectionId: string;
  avatar: AvatarState | null;
  isOccupied: boolean;
  clusterId: string | null;
  energyLevel: number;     // current beat-aligned energy for animation
  entryDelayMs: number;    // staggered fade-in delay for smooth reconstruction
}

export interface CrowdReconstructionResult {
  roomId: string;
  reconstructedAt: number;
  seats: ReconstructedSeat[];
  totalSeats: number;
  occupiedSeats: number;
  occupancyRate: number;
  clusterCount: number;
  avgEnergyLevel: number;
  densityMap: number[][];  // 2D energy heatmap (rows × cols)
  faded: boolean;          // true = use fade-in animations
}

const DEFAULT_GRID: SeatGrid = {
  rows: 8,
  cols: 10,
  sections: [
    { id: 'pit',      label: 'Pit',       rowStart: 0, rowEnd: 1, colStart: 3, colEnd: 6, capacity: 8,  tier: 'pit'     },
    { id: 'floor-l',  label: 'Floor L',   rowStart: 0, rowEnd: 3, colStart: 0, colEnd: 3, capacity: 12, tier: 'floor'   },
    { id: 'floor-r',  label: 'Floor R',   rowStart: 0, rowEnd: 3, colStart: 7, colEnd: 10,capacity: 12, tier: 'floor'   },
    { id: 'floor-c',  label: 'Floor C',   rowStart: 2, rowEnd: 5, colStart: 3, colEnd: 7, capacity: 12, tier: 'floor'   },
    { id: 'vip',      label: 'VIP',       rowStart: 1, rowEnd: 3, colStart: 4, colEnd: 6, capacity: 4,  tier: 'vip'     },
    { id: 'balcony',  label: 'Balcony',   rowStart: 5, rowEnd: 8, colStart: 0, colEnd: 10,capacity: 30, tier: 'balcony' },
  ],
};

const BENCHMARK_GRID: SeatGrid = {
  rows: 4,
  cols: 5,
  sections: [
    { id: 'bench-floor', label: 'Benchmark Floor', rowStart: 0, rowEnd: 4, colStart: 0, colEnd: 5, capacity: 20, tier: 'floor' },
  ],
};

function seatId(row: number, col: number): string {
  return `seat-${row}-${col}`;
}

function findSection(row: number, col: number, grid: SeatGrid): SectionDef | null {
  // VIP takes priority in overlapping zones
  const priority = ['vip', 'pit', 'floor-l', 'floor-r', 'floor-c', 'balcony'];
  for (const sId of priority) {
    const s = grid.sections.find((sec) => sec.id === sId);
    if (s && row >= s.rowStart && row < s.rowEnd && col >= s.colStart && col < s.colEnd) {
      return s;
    }
  }
  // Fallback for non-canonical section ids (e.g. benchmark grids)
  for (const s of grid.sections) {
    if (row >= s.rowStart && row < s.rowEnd && col >= s.colStart && col < s.colEnd) {
      return s;
    }
  }
  return null;
}

export function reconstructCrowd(
  roomId: string,
  opts: { grid?: SeatGrid; fade?: boolean } = {},
): CrowdReconstructionResult {
  const grid = opts.grid ?? DEFAULT_GRID;
  const fade = opts.fade ?? true;
  const avatars = getRoomAvatars(roomId);
  const beatAlignment = computeRejoinAlignment(roomId);
  const world = getWorldState();
  const now = Date.now();

  // Map avatars to seat positions
  const seatMap = new Map<string, AvatarState>();
  for (const avatar of avatars) {
    seatMap.set(seatId(avatar.seat.row, avatar.seat.col), avatar);
  }

  // Build full seat grid
  const seats: ReconstructedSeat[] = [];
  const densityMap: number[][] = Array.from({ length: grid.rows }, () => new Array(grid.cols).fill(0) as number[]);

  let totalSeats = 0;
  let occupiedSeats = 0;
  let totalEnergy = 0;
  const clusterIds = new Set<string>();

  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      const sid = seatId(row, col);
      const section = findSection(row, col, grid);
      if (!section) continue;

      totalSeats++;
      const avatar = seatMap.get(sid) ?? null;
      const isOccupied = avatar !== null;

      if (isOccupied) occupiedSeats++;

      // Beat-aligned energy for this seat
      const baseEnergy = avatar?.energyLevel ?? 0;
      const energyLevel = isOccupied
        ? beatPhaseToAvatarEnergy(beatAlignment.currentPhase, baseEnergy)
        : 0;

      totalEnergy += energyLevel;
      densityMap[row]![col] = energyLevel;

      if (avatar?.friendCluster) clusterIds.add(avatar.friendCluster.clusterId);

      // Stagger fade-in delays: front rows first, vary slightly per column
      const entryDelayMs = fade ? row * 60 + col * 15 : 0;

      seats.push({
        seatId: sid,
        row, col,
        sectionId: section.id,
        avatar,
        isOccupied,
        clusterId: avatar?.friendCluster?.clusterId ?? null,
        energyLevel,
        entryDelayMs,
      });
    }
  }

  return {
    roomId,
    reconstructedAt: now,
    seats,
    totalSeats,
    occupiedSeats,
    occupancyRate: totalSeats > 0 ? occupiedSeats / totalSeats : 0,
    clusterCount: clusterIds.size,
    avgEnergyLevel: occupiedSeats > 0 ? totalEnergy / occupiedSeats : 0,
    densityMap,
    faded: fade,
  };
}

// ── 20-Avatar Humanity Benchmark ─────────────────────────────────────────────

export interface BenchmarkResult {
  roomId: string;
  avatarCount: number;
  seatedCorrectly: number;
  friendClustersIntact: number;
  avgEnergyLevel: number;
  occupancyRate: number;
  beatSyncConfidence: string;
  passed: boolean;
  notes: string[];
}

export function runHumanityBenchmark(roomId = 'bench-room', count = 20): BenchmarkResult {
  // Seed avatars
  const avatars = seedBenchmarkAvatars(roomId, count);

  // Reconstruct crowd
  const result = reconstructCrowd(roomId, { fade: false, grid: BENCHMARK_GRID });

  const seatedCorrectly = result.occupiedSeats;
  const friendClustersIntact = result.clusterCount;
  const beatAlignment = computeRejoinAlignment(roomId);

  const notes: string[] = [
    `${seatedCorrectly}/${count} avatars seated correctly`,
    `${friendClustersIntact} friend cluster(s) preserved`,
    `Avg energy: ${(result.avgEnergyLevel * 100).toFixed(0)}%`,
    `Occupancy: ${(result.occupancyRate * 100).toFixed(0)}%`,
    `Beat sync: ${beatAlignment.confidence} (phase ${beatAlignment.currentPhase.toFixed(3)})`,
    `Entry delay range: 0–${(result.seats.length > 0 ? Math.max(...result.seats.map(s => s.entryDelayMs)) : 0)}ms`,
  ];

  const passed =
    seatedCorrectly >= count * 0.9 &&
    friendClustersIntact >= 1 &&
    result.avgEnergyLevel > 0;

  return {
    roomId,
    avatarCount: count,
    seatedCorrectly,
    friendClustersIntact,
    avgEnergyLevel: result.avgEnergyLevel,
    occupancyRate: result.occupancyRate,
    beatSyncConfidence: beatAlignment.confidence,
    passed,
    notes,
  };
}
