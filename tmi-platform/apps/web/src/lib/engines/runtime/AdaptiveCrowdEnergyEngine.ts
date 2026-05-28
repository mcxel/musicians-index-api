/**
 * AdaptiveCrowdEnergyEngine
 * Social contagion model — energy spreads from high-energy sources
 * to adjacent avatars, creating the wave effect real concerts produce.
 *
 * Physics model:
 *   - Energy diffuses to neighbors (proximity-weighted)
 *   - Attenuation: energy decays toward vibe baseline unless sustained
 *   - Surge: synchronized events spike energy and propagate outward
 *   - Clusters amplify each other (friend group resonance)
 *   - VIP/performer zones radiate higher energy to nearby fans
 */

import { updateEnergyLevel, getRoomAvatars, type AvatarState } from './PersistentAvatarStateStore';
import { getWorldState } from './WorldStateReplicator';

export interface EnergyNode {
  avatarId: string;
  row: number;
  col: number;
  energy: number;       // 0–1 current
  velocity: number;     // rate of change per tick (can be negative)
  isSurging: boolean;
  isInCluster: boolean;
  rolePower: number;    // multiplier: performer=2.0, vip=1.4, fan=1.0, bot=0.7
}

export interface EnergyFieldState {
  roomId: string;
  nodes: EnergyNode[];
  tickNumber: number;
  avgEnergy: number;
  maxEnergy: number;
  surgeCount: number;
  waveOrigin: { row: number; col: number } | null;
}

const DIFFUSION_RATE    = 0.08;   // fraction of energy that spreads to neighbors per tick
const DECAY_RATE        = 0.03;   // energy lost to attenuation per tick
const CLUSTER_BONUS     = 0.12;   // friend clusters share this bonus per member
const SURGE_MAGNITUDE   = 0.35;   // energy added on surge event
const SURGE_RADIUS      = 3;      // seats affected by one surge
const MIN_ENERGY        = 0.05;   // floor — room never goes silent
const TICK_HZ           = 10;     // update rate (matches energyUpdateHz for medium LOD)

const ROLE_POWER: Record<string, number> = {
  performer: 2.0, host: 1.8, vip: 1.4, sponsor: 1.2, fan: 1.0, bot: 0.7,
};

const roomFields = new Map<string, EnergyFieldState>();
const tickHandles = new Map<string, ReturnType<typeof setInterval>>();

function buildNodes(avatars: AvatarState[], vibeEnergy: number): EnergyNode[] {
  return avatars.map((a) => ({
    avatarId: a.userId,
    row: a.seat.row,
    col: a.seat.col,
    energy: Math.max(MIN_ENERGY, a.energyLevel * vibeEnergy + vibeEnergy * 0.2),
    velocity: 0,
    isSurging: false,
    isInCluster: a.friendCluster !== null,
    rolePower: ROLE_POWER[a.role] ?? 1.0,
  }));
}

function distance(a: EnergyNode, b: EnergyNode): number {
  return Math.sqrt((a.row - b.row) ** 2 + (a.col - b.col) ** 2);
}

function tickField(field: EnergyFieldState): EnergyFieldState {
  const { nodes } = field;
  const world = getWorldState();
  const vibeBaseline = world.crowdEnergyOverride ?? world.vibeConfig.crowdEnergy;
  const updated: EnergyNode[] = nodes.map((node) => ({ ...node }));

  for (let i = 0; i < updated.length; i++) {
    const node = updated[i]!;

    // Diffuse from neighbors
    let inflow = 0;
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const neighbor = nodes[j]!;
      const dist = distance(node, neighbor);
      if (dist > 2.5) continue;
      const weight = (1 / (1 + dist)) * neighbor.rolePower * DIFFUSION_RATE;
      inflow += neighbor.energy * weight;
    }

    // Cluster resonance bonus
    const clusterBonus = node.isInCluster ? CLUSTER_BONUS : 0;

    // Role power amplification
    const roleFactor = node.rolePower;

    // Decay toward vibe baseline
    const decay = (node.energy - vibeBaseline) * DECAY_RATE;

    // New energy
    const newEnergy = Math.max(
      MIN_ENERGY,
      Math.min(1, node.energy + inflow * roleFactor + clusterBonus - decay),
    );

    updated[i] = {
      ...node,
      energy: newEnergy,
      velocity: newEnergy - node.energy,
      isSurging: false,
    };
  }

  const avg = updated.reduce((s, n) => s + n.energy, 0) / (updated.length || 1);
  const max = updated.reduce((m, n) => Math.max(m, n.energy), 0);

  return {
    ...field,
    nodes: updated,
    tickNumber: field.tickNumber + 1,
    avgEnergy: avg,
    maxEnergy: max,
    surgeCount: 0,
    waveOrigin: null,
  };
}

function applyNodeUpdates(roomId: string, nodes: EnergyNode[]): void {
  for (const node of nodes) {
    updateEnergyLevel(node.avatarId, node.energy);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function initEnergyField(roomId: string): EnergyFieldState {
  const avatars = getRoomAvatars(roomId);
  const world = getWorldState();
  const vibeEnergy = world.crowdEnergyOverride ?? world.vibeConfig.crowdEnergy;
  const nodes = buildNodes(avatars, vibeEnergy);
  const field: EnergyFieldState = {
    roomId, nodes, tickNumber: 0,
    avgEnergy: vibeEnergy, maxEnergy: vibeEnergy,
    surgeCount: 0, waveOrigin: null,
  };
  roomFields.set(roomId, field);
  return field;
}

export function startEnergySimulation(roomId: string): void {
  if (tickHandles.has(roomId)) return;
  if (!roomFields.has(roomId)) initEnergyField(roomId);

  const handle = setInterval(() => {
    const field = roomFields.get(roomId);
    if (!field) return;
    const next = tickField(field);
    roomFields.set(roomId, next);
    applyNodeUpdates(roomId, next.nodes);
  }, 1000 / TICK_HZ);

  tickHandles.set(roomId, handle);
}

export function stopEnergySimulation(roomId: string): void {
  const h = tickHandles.get(roomId);
  if (h) clearInterval(h);
  tickHandles.delete(roomId);
}

export function triggerEnergySurge(
  roomId: string,
  origin: { row: number; col: number },
  magnitude = SURGE_MAGNITUDE,
): void {
  const field = roomFields.get(roomId);
  if (!field) return;

  let surgeCount = 0;
  const updated = field.nodes.map((node) => {
    const dist = Math.sqrt((node.row - origin.row) ** 2 + (node.col - origin.col) ** 2);
    if (dist > SURGE_RADIUS) return node;
    const falloff = Math.max(0, 1 - dist / SURGE_RADIUS);
    surgeCount++;
    return {
      ...node,
      energy: Math.min(1, node.energy + magnitude * falloff * node.rolePower),
      isSurging: true,
    };
  });

  roomFields.set(roomId, { ...field, nodes: updated, surgeCount, waveOrigin: origin });
  applyNodeUpdates(roomId, updated);
}

export function getEnergyField(roomId: string): EnergyFieldState | undefined {
  return roomFields.get(roomId);
}

export function getEnergyDensityMap(roomId: string): number[][] | null {
  const field = roomFields.get(roomId);
  if (!field || !field.nodes.length) return null;

  const maxRow = Math.max(...field.nodes.map((n) => n.row)) + 1;
  const maxCol = Math.max(...field.nodes.map((n) => n.col)) + 1;
  const map: number[][] = Array.from({ length: maxRow }, () => new Array<number>(maxCol).fill(0));

  for (const node of field.nodes) {
    if (map[node.row]) map[node.row]![node.col] = node.energy;
  }

  return map;
}
