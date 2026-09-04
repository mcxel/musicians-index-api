/**
 * LiveRoomMixerBind — glue: WebRTC / Daily remote tracks → TMIAudioSafetyMixer
 * → ChannelMixerDirector.bindAudioOwner.
 *
 * Laws:
 * - ONE AudioOwner (singleton TMIAudioSafetyMixer) — no second AudioContext
 * - Stable participantId channel ids (no Guitar(2) on reconnect)
 * - Crowd/ambience stay DEFAULT_ONLY until a real source is marked
 * - Does not invent meters, crowd, or spectral features
 */

import {
  TMIAudioSafetyMixer,
  type AudioRole,
} from "@/lib/audio/TMIAudioSafetyMixer";
import {
  ChannelMixerDirector,
  MIXER_VIRTUAL_CHANNEL_IDS,
  type CanonicalAudioOwner,
} from "./ChannelMixerDirector";
import type { ExperienceType } from "@/lib/venue-hud/TMIExperienceHudRuntime";

export interface LiveRemoteAudioParticipant {
  participantId: string;
  displayName: string;
  role?: string;
  audioRole?: AudioRole;
  /** Playable remote audio track — null/undefined = unregister */
  track: MediaStreamTrack | null | undefined;
}

/**
 * Structural Daily participant shape — keeps bind free of daily-js import.
 * Matches tracks.audio.persistentTrack / track / state used by lobby + go-live.
 */
export interface DailyLikeAudioParticipant {
  local?: boolean;
  session_id?: string;
  user_name?: string;
  user_id?: string;
  tracks?: {
    audio?: {
      persistentTrack?: MediaStreamTrack | null;
      track?: MediaStreamTrack | null;
      state?: string;
    };
  };
}

export interface DailyLikeCallForMixer {
  participants: () => Record<string, DailyLikeAudioParticipant | undefined>;
  /** Silence Daily's built-in HTMLAudioElement path (0) so safety mixer owns hear graph */
  setParticipantVolume?: (sessionId: string, volume: number) => void;
}

let safetyMixer: TMIAudioSafetyMixer | null = null;
/** Test-only owner inject — skips constructing AudioContext */
let injectedOwner: CanonicalAudioOwner | null | undefined = undefined;
let boundRoomId: string | null = null;
/** participantId → current MediaStreamTrack.id */
const attachedTrackIds = new Map<string, string>();

function canUseDomAudio(): boolean {
  return typeof window !== "undefined" && typeof AudioContext !== "undefined";
}

/**
 * Canonical AudioOwner singleton. Creates at most one TMIAudioSafetyMixer.
 */
export function getOrCreateSafetyMixer(): TMIAudioSafetyMixer | null {
  if (injectedOwner !== undefined) return null;
  if (!canUseDomAudio()) return null;
  if (!safetyMixer) {
    safetyMixer = new TMIAudioSafetyMixer();
  }
  return safetyMixer;
}

function resolveOwner(): CanonicalAudioOwner | null {
  if (injectedOwner !== undefined) return injectedOwner;
  return getOrCreateSafetyMixer();
}

/**
 * Bind session + AudioOwner for an authoritative live room / lobby.
 * Safe to call repeatedly for the same room.
 */
export function ensureLiveRoomMixerBound(input: {
  roomId: string;
  liveSessionId?: string | null;
  experienceType?: ExperienceType | string;
}): void {
  ChannelMixerDirector.bindSession({
    roomId: input.roomId,
    liveSessionId: input.liveSessionId ?? `live:${input.roomId}`,
    experienceType: input.experienceType,
  });

  const owner = resolveOwner();
  ChannelMixerDirector.bindAudioOwner(owner);
  boundRoomId = input.roomId;

  // Crowd / ambience remain DEFAULT_ONLY until explicitly marked with a real source
  const crowd = ChannelMixerDirector.getChannel(MIXER_VIRTUAL_CHANNEL_IDS.crowd);
  if (crowd && !crowd.hasRealSource) {
    ChannelMixerDirector.markSourceAvailable(MIXER_VIRTUAL_CHANNEL_IDS.crowd, false);
  }
  const ambience = ChannelMixerDirector.getChannel(MIXER_VIRTUAL_CHANNEL_IDS.ambience);
  if (ambience && !ambience.hasRealSource) {
    ChannelMixerDirector.markSourceAvailable(MIXER_VIRTUAL_CHANNEL_IDS.ambience, false);
  }
}

/**
 * Attach a remote participant audio track into the safety mixer + director roster.
 * Same participantId restores the same channel (MIX-006).
 */
export async function registerLiveAudioTrack(input: {
  participantId: string;
  displayName: string;
  role?: string;
  audioRole?: AudioRole;
  track: MediaStreamTrack;
}): Promise<void> {
  if (!boundRoomId) {
    ensureLiveRoomMixerBound({ roomId: "unscoped" });
  }

  const prevId = attachedTrackIds.get(input.participantId);
  if (prevId === input.track.id) {
    ChannelMixerDirector.upsertParticipantChannel({
      participantId: input.participantId,
      displayName: input.displayName,
      role: input.role,
      hasRealSource: true,
      audioRole: input.audioRole,
    });
    return;
  }

  const mixer = getOrCreateSafetyMixer();
  if (mixer) {
    const stream = new MediaStream([input.track]);
    await mixer.addTrack(
      input.participantId,
      stream,
      input.audioRole ?? mapRoleToAudioRole(input.role),
    );
  }

  attachedTrackIds.set(input.participantId, input.track.id);
  ChannelMixerDirector.upsertParticipantChannel({
    participantId: input.participantId,
    displayName: input.displayName,
    role: input.role,
    hasRealSource: true,
    audioRole: input.audioRole,
  });

  // Re-apply current PERSONAL gain to owner so fader state drives the new GainNode
  const ch = ChannelMixerDirector.getChannel(`participant:${input.participantId}`);
  if (ch && mixer?.setChannelGain) {
    const gain = ch.personalMuted ? 0 : ch.personalGain;
    mixer.setChannelGain(input.participantId, gain);
  }
}

/** Remove track + channel. Reconnect with same participantId recreates one channel. */
export function unregisterLiveAudioTrack(participantId: string): void {
  safetyMixer?.removeTrack(participantId);
  attachedTrackIds.delete(participantId);
  ChannelMixerDirector.removeParticipantChannel(participantId);
}

/**
 * Sync remote Daily/WebRTC roster to mixer — add/update playable tracks, drop left.
 * Replaces HTMLAudioElement playback paths (single AudioOwner graph).
 */
export async function syncLiveRemoteAudioTracks(
  participants: LiveRemoteAudioParticipant[],
): Promise<void> {
  const keep = new Set<string>();

  for (const p of participants) {
    if (!p.participantId || !p.track || p.track.readyState === "ended") continue;
    keep.add(p.participantId);
    await registerLiveAudioTrack({
      participantId: p.participantId,
      displayName: p.displayName,
      role: p.role,
      audioRole: p.audioRole,
      track: p.track,
    });
  }

  for (const id of Array.from(attachedTrackIds.keys())) {
    if (!keep.has(id)) {
      unregisterLiveAudioTrack(id);
    }
  }
}

/**
 * Bind room + sync all remote Daily audio tracks into the safety mixer.
 * Call from participant/track events (same pattern as useLobbyPeerMediaSession).
 * Mutes Daily's default speaker path per remote so Venue HUD faders are authoritative.
 */
export async function syncDailyCallRemoteAudio(
  call: DailyLikeCallForMixer,
  input: {
    roomId: string;
    liveSessionId?: string | null;
    experienceType?: ExperienceType | string;
    /** Stable id for remote — default session_id */
    resolveParticipantId?: (p: DailyLikeAudioParticipant) => string | null;
    resolveDisplayName?: (p: DailyLikeAudioParticipant) => string;
    remoteRole?: string;
    /** Local mic present (does not route into hear graph) */
    localMicAvailable?: boolean;
  },
): Promise<void> {
  ensureLiveRoomMixerBound({
    roomId: input.roomId,
    liveSessionId: input.liveSessionId,
    experienceType: input.experienceType,
  });

  if (typeof input.localMicAvailable === "boolean") {
    markLocalMicSource(input.localMicAvailable);
  }

  const resolveId =
    input.resolveParticipantId ??
    ((p: DailyLikeAudioParticipant) => p.session_id ?? p.user_id ?? null);
  const resolveName =
    input.resolveDisplayName ??
    ((p: DailyLikeAudioParticipant) =>
      (p.user_name || p.session_id || p.user_id || "Guest").slice(0, 48));

  const remote: LiveRemoteAudioParticipant[] = [];
  const participants = call.participants();

  for (const p of Object.values(participants)) {
    if (!p || p.local) continue;
    const participantId = resolveId(p);
    if (!participantId) continue;
    const track = p.tracks?.audio?.persistentTrack ?? p.tracks?.audio?.track ?? null;
    const playable = Boolean(track && p.tracks?.audio?.state === "playable");
    remote.push({
      participantId,
      displayName: resolveName(p),
      role: input.remoteRole ?? "audience",
      track: playable ? track : null,
    });
    // Replace Daily HTMLAudioElement hear path — track still feeds Web Audio via mixer
    if (playable && p.session_id && typeof call.setParticipantVolume === "function") {
      try {
        call.setParticipantVolume(p.session_id, 0);
      } catch {
        /* ignore — older SDKs / non-Daily mocks */
      }
    }
  }

  await syncLiveRemoteAudioTracks(remote);
}

/**
 * Mark MY MIC available when a real local audio track exists.
 * Does NOT route local mic into the hear graph (echo prevention).
 */
export function markLocalMicSource(available: boolean): void {
  ChannelMixerDirector.markSourceAvailable(MIXER_VIRTUAL_CHANNEL_IDS.myMic, available);
}

/**
 * Crowd / ambience — only call with true when a real reaction/ambience MediaStream exists.
 */
export function markCrowdAmbienceSource(
  kind: "crowd" | "ambience",
  available: boolean,
): void {
  const id =
    kind === "crowd"
      ? MIXER_VIRTUAL_CHANNEL_IDS.crowd
      : MIXER_VIRTUAL_CHANNEL_IDS.ambience;
  ChannelMixerDirector.markSourceAvailable(id, available);
}

/** Leave room — detach all live tracks; keep AudioOwner singleton for next join. */
export function leaveLiveRoomMixer(): void {
  for (const id of Array.from(attachedTrackIds.keys())) {
    unregisterLiveAudioTrack(id);
  }
  attachedTrackIds.clear();
  markLocalMicSource(false);
  // Crowd/ambience back to DEFAULT_ONLY
  markCrowdAmbienceSource("crowd", false);
  markCrowdAmbienceSource("ambience", false);
  boundRoomId = null;
  // Keep bound owner (singleton) — health stays honest if mixer still exists
  if (injectedOwner !== undefined) {
    ChannelMixerDirector.bindAudioOwner(injectedOwner);
  } else if (safetyMixer) {
    ChannelMixerDirector.bindAudioOwner(safetyMixer);
  }
}

export function getLiveRoomMixerBoundRoomId(): string | null {
  return boundRoomId;
}

export function getAttachedLiveParticipantIds(): string[] {
  return Array.from(attachedTrackIds.keys());
}

/** Test inject — never constructs AudioContext. Pass null to simulate UNBOUND. */
export function injectAudioOwnerForTests(owner: CanonicalAudioOwner | null): void {
  injectedOwner = owner;
  ChannelMixerDirector.bindAudioOwner(owner);
}

export function resetLiveRoomMixerBindForTests(): void {
  for (const id of Array.from(attachedTrackIds.keys())) {
    safetyMixer?.removeTrack(id);
  }
  attachedTrackIds.clear();
  boundRoomId = null;
  injectedOwner = undefined;
  if (safetyMixer) {
    try {
      safetyMixer.destroy();
    } catch {
      /* ignore */
    }
    safetyMixer = null;
  }
  ChannelMixerDirector.bindAudioOwner(null);
}

function mapRoleToAudioRole(role?: string): AudioRole {
  const r = (role ?? "").toLowerCase();
  if (r === "host" || r === "admin" || r === "operator") return "host";
  if (r === "performer" || r === "band") return "performer";
  if (r === "spectator") return "spectator";
  return "audience";
}
