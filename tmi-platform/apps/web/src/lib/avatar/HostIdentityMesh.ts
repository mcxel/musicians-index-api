/**
 * HostIdentityMesh
 * Manages the composite identity of hosts and AI co-hosts.
 * Binds personality, voice signature, visual fragments, and behavioral traits into one mesh.
 */

import { registerAsset } from "@/lib/registry/RuntimeAssetRegistry";
import { recordLineage } from "@/lib/registry/AssetLineageTracker";
import { registerFragment } from "@/lib/avatar/IdentityFragmentRegistry";

export type HostRole = "main-host" | "co-host" | "ai-co-host" | "battle-mc" | "venue-narrator" | "julius";
export type VoiceSignature = "deep" | "mid" | "high" | "robotic" | "broadcast" | "whisper" | "animated";

export interface HostIdentity {
  hostId: string;
  displayName: string;
  role: HostRole;
  voiceSignature: VoiceSignature;
  personalityTraits: string[];
  catchphrases: string[];
  visualAssetId: string | null;
  motionRigId: string | null;
  expressionSetId: string | null;
  boundRoomIds: string[];
  active: boolean;
  meshVersion: number;
  createdAt: number;
}

export interface HostMeshBinding {
  hostId: string;
  roomId: string;
  role: HostRole;
  boundAt: number;
  active: boolean;
}

const hostIdentities = new Map<string, HostIdentity>();
const meshBindings = new Map<string, HostMeshBinding[]>();  // roomId → bindings
type HostMeshListener = (identity: HostIdentity) => void;
const hostListeners = new Map<string, Set<HostMeshListener>>();

function notify(hostId: string, identity: HostIdentity): void {
  hostListeners.get(hostId)?.forEach(l => l(identity));
}

export function registerHostIdentity(
  hostId: string,
  displayName: string,
  role: HostRole,
  opts: {
    voiceSignature?: VoiceSignature;
    personalityTraits?: string[];
    catchphrases?: string[];
  } = {}
): HostIdentity {
  const assetId = `host_mesh_${hostId}`;

  registerAsset(assetId, "host", hostId, {
    generatorId: "HostIdentityMesh",
    motionCompatible: true,
    metadata: { role, displayName },
    tags: ["host", role],
  });

  recordLineage(assetId, "seed-data", "HostIdentityMesh", {
    reconstructable: true,
    metadata: { hostId, role },
  });

  // Auto-register base fragments
  registerFragment(hostId, "host", "expression-base", { confidence: 0.9 });
  registerFragment(hostId, "host", "motion-rig", { confidence: 0.85 });

  const identity: HostIdentity = {
    hostId, displayName, role,
    voiceSignature: opts.voiceSignature ?? "broadcast",
    personalityTraits: opts.personalityTraits ?? ["energetic", "crowd-aware"],
    catchphrases: opts.catchphrases ?? [],
    visualAssetId: assetId,
    motionRigId: `motionrig_${hostId}`,
    expressionSetId: `exprset_${hostId}`,
    boundRoomIds: [],
    active: false,
    meshVersion: 1,
    createdAt: Date.now(),
  };

  hostIdentities.set(hostId, identity);
  notify(hostId, identity);
  return identity;
}

export function bindHostToRoom(hostId: string, roomId: string, role?: HostRole): HostMeshBinding {
  const identity = hostIdentities.get(hostId);
  if (identity) {
    const updated = { ...identity, boundRoomIds: [...new Set([...identity.boundRoomIds, roomId])], active: true };
    hostIdentities.set(hostId, updated);
    notify(hostId, updated);
  }

  const binding: HostMeshBinding = { hostId, roomId, role: role ?? identity?.role ?? "co-host", boundAt: Date.now(), active: true };
  const existing = meshBindings.get(roomId) ?? [];
  meshBindings.set(roomId, [...existing.filter(b => b.hostId !== hostId), binding]);
  return binding;
}

export function unbindHostFromRoom(hostId: string, roomId: string): void {
  const bindings = meshBindings.get(roomId) ?? [];
  meshBindings.set(roomId, bindings.map(b => b.hostId === hostId ? { ...b, active: false } : b));
  const identity = hostIdentities.get(hostId);
  if (identity) {
    const updated = { ...identity, boundRoomIds: identity.boundRoomIds.filter(r => r !== roomId) };
    hostIdentities.set(hostId, updated);
  }
}

export function updatePersonality(hostId: string, traits: string[], catchphrases: string[]): HostIdentity | null {
  const identity = hostIdentities.get(hostId);
  if (!identity) return null;
  const updated = { ...identity, personalityTraits: traits, catchphrases, meshVersion: identity.meshVersion + 1 };
  hostIdentities.set(hostId, updated);
  notify(hostId, updated);
  return updated;
}

export function getHostIdentity(hostId: string): HostIdentity | null {
  return hostIdentities.get(hostId) ?? null;
}

export function getActiveHostsForRoom(roomId: string): HostIdentity[] {
  const bindings = (meshBindings.get(roomId) ?? []).filter(b => b.active);
  return bindings.map(b => hostIdentities.get(b.hostId)).filter(Boolean) as HostIdentity[];
}

export function subscribeToHostIdentity(hostId: string, listener: HostMeshListener): () => void {
  if (!hostListeners.has(hostId)) hostListeners.set(hostId, new Set());
  hostListeners.get(hostId)!.add(listener);
  const current = hostIdentities.get(hostId);
  if (current) listener(current);
  return () => hostListeners.get(hostId)?.delete(listener);
}

export function getAllHosts(): HostIdentity[] {
  return [...hostIdentities.values()];
}

export function initJuliusIdentity(): HostIdentity {
  return registerHostIdentity("julius", "Julius", "julius", {
    voiceSignature: "animated",
    personalityTraits: ["hype", "crowd-aware", "dramatic", "playful", "reactive"],
    catchphrases: ["WE ARE LIVE BABY!", "The crowd has SPOKEN!", "Did you FEEL that?!", "Tonight will not be forgotten."],
  });
}
