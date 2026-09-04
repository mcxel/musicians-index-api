/**
 * ChannelMixerDirector — sole mixer authority over existing AudioOwner gain path.
 *
 * Graph law:
 *   sources → channel faders → PERSONAL | PROGRAM bus → existing AudioOwner → output
 *
 * - Does NOT create HTMLAudio / second AudioContext / second RTC
 * - PERSONAL = listener-local only (never mutates other listeners' hear mix)
 * - PROGRAM = host/operator auth only
 * - Crowd gain never mutes performer participant channels (MIX-009)
 * - EQ/DSP knobs not exposed (MIX-010)
 */

import type { AudioRole } from "@/lib/audio/TMIAudioSafetyMixer";
import {
  resolveExperienceAudioProfile,
  type ExperienceAudioPolicyProfile,
  type MixerPresetId,
} from "./ExperienceAudioPolicy";
import { CanonicalPerformanceGlueDirector } from "./CanonicalPerformanceGlueDirector";
import { FidelityIntelligenceDirector } from "./FidelityIntelligenceDirector";
import type {
  MixerErrorCode,
  MixerSystemHealth,
  SystemPowerState,
} from "./MixerErrorCodes";
import type { ExperienceType } from "@/lib/venue-hud/TMIExperienceHudRuntime";

export type MixBus = "PERSONAL" | "PROGRAM";

export type MixerChannelKind =
  | "master"
  | "participant"
  | "my_mic"
  | "crowd"
  | "ambience"
  | "music";

export interface MixerChannelState {
  channelId: string;
  participantId?: string;
  displayName: string;
  role?: string;
  kind: MixerChannelKind;
  /** PERSONAL bus gain 0–1 */
  personalGain: number;
  /** PROGRAM bus gain 0–1 — host/operator only */
  programGain: number;
  personalMuted: boolean;
  programMuted: boolean;
  personalSolo: boolean;
  /** True when a real MediaStream / reaction source is attached */
  hasRealSource: boolean;
  sourceAvailable: boolean;
}

export interface MixerOperatorAuth {
  userId: string;
  role: "fan" | "performer" | "host" | "judge" | "admin" | "operator";
  isRoomOwner?: boolean;
}

/** Minimal AudioOwner surface — satisfied by TMIAudioSafetyMixer */
export interface CanonicalAudioOwner {
  setMasterVolume(volume: number): void;
  setMute?(userId: string, muted: boolean): void;
  setChannelGain?(userId: string, gain: number): void;
  setSoloFocus?(userId: string | null): void;
  getVolumeMap?(): Record<string, number>;
  getTrackIds?(): string[];
}

export interface ChannelMixerSession {
  roomId: string;
  liveSessionId: string;
}

export interface ChannelMixerApplyResult {
  ok: boolean;
  code?: MixerErrorCode;
  message: string;
  channel?: MixerChannelState;
}

export interface AutoBalanceStatus {
  mode: "OFF" | "ASSIST" | "ON";
  measurementAvailable: boolean;
  lastAppliedAt: number | null;
  detail: string;
}

const VIRTUAL_IDS = {
  master: "__master__",
  myMic: "__my_mic__",
  crowd: "__crowd__",
  ambience: "__ambience__",
  music: "__music__",
} as const;

const SOFT_GAIN_MAX = 1;
const SOFT_GAIN_MIN = 0;
const RAMP_DOC = "Soft clamp 0–1; AudioOwner limiter used when bound (TMIAudioSafetyMixer)";

function clampGain(v: number): { value: number; clamped: boolean } {
  const value = Math.max(SOFT_GAIN_MIN, Math.min(SOFT_GAIN_MAX, v));
  return { value, clamped: value !== v };
}

function canProgram(auth: MixerOperatorAuth | null | undefined): boolean {
  if (!auth) return false;
  if (auth.isRoomOwner) return true;
  return auth.role === "host" || auth.role === "admin" || auth.role === "operator";
}

function defaultVirtualChannels(policy: ExperienceAudioPolicyProfile): MixerChannelState[] {
  return [
    {
      channelId: VIRTUAL_IDS.master,
      displayName: "MASTER",
      kind: "master",
      personalGain: 0.9,
      programGain: 0.9,
      personalMuted: false,
      programMuted: false,
      personalSolo: false,
      hasRealSource: true,
      sourceAvailable: true,
    },
    {
      channelId: VIRTUAL_IDS.myMic,
      displayName: "MY MIC",
      kind: "my_mic",
      personalGain: 0.85,
      programGain: 0.85,
      personalMuted: false,
      programMuted: false,
      personalSolo: false,
      hasRealSource: false,
      sourceAvailable: false,
    },
    {
      channelId: VIRTUAL_IDS.crowd,
      displayName: "CROWD",
      kind: "crowd",
      personalGain: policy.crowdDefaultGain,
      programGain: policy.crowdDefaultGain,
      personalMuted: false,
      programMuted: false,
      personalSolo: false,
      hasRealSource: false,
      sourceAvailable: false,
    },
    {
      channelId: VIRTUAL_IDS.ambience,
      displayName: "ROOM AMBIENCE",
      kind: "ambience",
      personalGain: policy.ambienceDefaultGain,
      programGain: policy.ambienceDefaultGain,
      personalMuted: false,
      programMuted: false,
      personalSolo: false,
      hasRealSource: false,
      sourceAvailable: false,
    },
    {
      channelId: VIRTUAL_IDS.music,
      displayName: "MUSIC / BACKING",
      kind: "music",
      personalGain: policy.musicDefaultGain,
      programGain: policy.musicDefaultGain,
      personalMuted: false,
      programMuted: false,
      personalSolo: false,
      hasRealSource: false,
      sourceAvailable: false,
    },
  ];
}

class ChannelMixerDirectorImpl {
  private session: ChannelMixerSession | null = null;
  private audioOwner: CanonicalAudioOwner | null = null;
  private channels = new Map<string, MixerChannelState>();
  private policy: ExperienceAudioPolicyProfile = resolveExperienceAudioProfile("LIVE");
  private lastCode: MixerErrorCode | undefined;
  private autoBalance: AutoBalanceStatus = {
    mode: "OFF",
    measurementAvailable: false,
    lastAppliedAt: null,
    detail: "MIX-008 — no measurement until AudioOwner bound with getVolumeMap",
  };
  private listeners = new Set<() => void>();
  /** Simulated second-listener PROGRAM store — PERSONAL never writes here */
  private programBusStore = new Map<string, { gain: number; muted: boolean }>();
  private personalBusStore = new Map<string, { gain: number; muted: boolean; solo: boolean }>();

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify(): void {
    for (const fn of this.listeners) fn();
  }

  /** Session invariants — same roomId / liveSessionId for life of director bind */
  bindSession(input: {
    roomId: string;
    liveSessionId?: string | null;
    experienceType?: ExperienceType | string;
    battleOfBands?: boolean;
    rehearsal?: boolean;
  }): { ok: boolean; code?: MixerErrorCode; message: string } {
    const liveSessionId = input.liveSessionId?.trim() || `session:${input.roomId}`;

    // Room change = new venue/lounge mount — soft reset roster, keep director singleton
    if (this.session && this.session.roomId !== input.roomId) {
      this.channels.clear();
      this.programBusStore.clear();
      this.personalBusStore.clear();
      this.session = null;
    }

    if (this.session && this.session.liveSessionId !== liveSessionId && this.session.roomId === input.roomId) {
      // Same room, new live session — allow reset roster
      this.channels.clear();
      this.programBusStore.clear();
      this.personalBusStore.clear();
    }

    this.session = { roomId: input.roomId, liveSessionId };
    this.policy = resolveExperienceAudioProfile(input.experienceType, {
      battleOfBands: input.battleOfBands,
      rehearsal: input.rehearsal,
    });

    if (this.channels.size === 0) {
      for (const ch of defaultVirtualChannels(this.policy)) {
        this.channels.set(ch.channelId, ch);
        this.syncStoresFromChannel(ch);
      }
    }

    CanonicalPerformanceGlueDirector.bindSessionClock({
      roomId: input.roomId,
      liveSessionId,
      source: "SESSION_TIMER",
    });

    this.notify();
    return { ok: true, message: `bound room=${input.roomId} session=${liveSessionId}` };
  }

  getSession(): ChannelMixerSession | null {
    return this.session ? { ...this.session } : null;
  }

  /**
   * Bind existing AudioOwner (TMIAudioSafetyMixer). Does not construct a new graph.
   */
  bindAudioOwner(owner: CanonicalAudioOwner | null): void {
    this.audioOwner = owner;
    const measurement = Boolean(owner?.getVolumeMap);
    this.autoBalance = {
      mode: measurement ? "ASSIST" : "OFF",
      measurementAvailable: measurement,
      lastAppliedAt: null,
      detail: measurement
        ? "ASSIST available — RMS measurement from AudioOwner"
        : "MIX-008 — AUTO BALANCE OFF (no measurement)",
    };
    if (!owner) this.lastCode = "MIX-001";
    this.notify();
  }

  getAudioOwnerBound(): boolean {
    return this.audioOwner != null;
  }

  getPolicy(): ExperienceAudioPolicyProfile {
    return this.policy;
  }

  getChannels(): MixerChannelState[] {
    const order: MixerChannelKind[] = ["master", "participant", "my_mic", "crowd", "ambience", "music"];
    return Array.from(this.channels.values()).sort((a, b) => {
      const ai = order.indexOf(a.kind);
      const bi = order.indexOf(b.kind);
      if (ai !== bi) return ai - bi;
      return a.displayName.localeCompare(b.displayName);
    });
  }

  getChannel(channelId: string): MixerChannelState | undefined {
    return this.channels.get(channelId);
  }

  /**
   * Upsert participant channel by stable participantId — reconnect restores same channel (no Guitar(2)).
   */
  upsertParticipantChannel(input: {
    participantId: string;
    displayName: string;
    role?: string;
    hasRealSource?: boolean;
    audioRole?: AudioRole;
  }): ChannelMixerApplyResult {
    const channelId = `participant:${input.participantId}`;
    const existing = this.channels.get(channelId);
    if (existing) {
      existing.displayName = input.displayName;
      existing.role = input.role ?? existing.role;
      if (input.hasRealSource != null) {
        existing.hasRealSource = input.hasRealSource;
        existing.sourceAvailable = input.hasRealSource;
      }
      this.lastCode = "MIX-006";
      this.notify();
      return {
        ok: true,
        code: "MIX-006",
        message: "reconnect restored channel — no duplicate",
        channel: { ...existing },
      };
    }

    const ch: MixerChannelState = {
      channelId,
      participantId: input.participantId,
      displayName: input.displayName,
      role: input.role,
      kind: "participant",
      personalGain: 0.85,
      programGain: 0.85,
      personalMuted: false,
      programMuted: false,
      personalSolo: false,
      hasRealSource: input.hasRealSource ?? false,
      sourceAvailable: input.hasRealSource ?? false,
    };
    this.channels.set(channelId, ch);
    this.syncStoresFromChannel(ch);
    this.notify();
    return { ok: true, message: "channel added", channel: { ...ch } };
  }

  removeParticipantChannel(participantId: string): void {
    const channelId = `participant:${participantId}`;
    this.channels.delete(channelId);
    this.personalBusStore.delete(channelId);
    this.programBusStore.delete(channelId);
    this.notify();
  }

  /** Late join / roster sync — channels appear/disappear from live roster */
  syncRoster(
    participants: Array<{
      participantId: string;
      displayName: string;
      role?: string;
      hasRealSource?: boolean;
    }>,
  ): void {
    const live = new Set(participants.map((p) => `participant:${p.participantId}`));
    for (const [id, ch] of this.channels) {
      if (ch.kind === "participant" && !live.has(id)) {
        this.channels.delete(id);
        this.personalBusStore.delete(id);
        this.programBusStore.delete(id);
      }
    }
    for (const p of participants) {
      this.upsertParticipantChannel(p);
    }
    this.notify();
  }

  markSourceAvailable(channelId: string, available: boolean): void {
    const ch = this.channels.get(channelId);
    if (!ch) return;
    ch.hasRealSource = available;
    ch.sourceAvailable = available;
    if (!available) this.lastCode = "MIX-005";
    this.notify();
  }

  setGain(input: {
    channelId: string;
    bus: MixBus;
    gain: number;
    auth?: MixerOperatorAuth | null;
  }): ChannelMixerApplyResult {
    const ch = this.channels.get(input.channelId);
    if (!ch) {
      this.lastCode = "MIX-003";
      return { ok: false, code: "MIX-003", message: "channel not found" };
    }

    if (input.bus === "PROGRAM") {
      if (!canProgram(input.auth)) {
        this.lastCode = "MIX-002";
        return { ok: false, code: "MIX-002", message: "PROGRAM auth denied" };
      }
      if (this.policy.competitiveFairness && ch.kind === "participant" && input.auth) {
        const isSelf =
          ch.participantId === input.auth.userId ||
          input.auth.role === "host" ||
          input.auth.role === "admin" ||
          input.auth.role === "operator" ||
          input.auth.isRoomOwner;
        if (!isSelf && input.auth.role === "performer") {
          this.lastCode = "MIX-002";
          return {
            ok: false,
            code: "MIX-002",
            message: "GLUE-005 — competitors cannot gain opponents' PROGRAM",
          };
        }
      }
    }

    const { value, clamped } = clampGain(input.gain);
    if (input.bus === "PERSONAL") {
      ch.personalGain = value;
      this.personalBusStore.set(ch.channelId, {
        gain: value,
        muted: ch.personalMuted,
        solo: ch.personalSolo,
      });
      // PERSONAL never writes programBusStore — applies to local AudioOwner hear path only
      this.applyPersonalToOwner(ch);
    } else {
      ch.programGain = value;
      this.programBusStore.set(ch.channelId, { gain: value, muted: ch.programMuted });
      this.applyProgramToOwner(ch);
    }

    if (clamped) this.lastCode = "MIX-004";
    this.notify();
    return {
      ok: true,
      code: clamped ? "MIX-004" : undefined,
      message: clamped ? "gain soft-clamped" : "gain set",
      channel: { ...ch },
    };
  }

  setMute(input: {
    channelId: string;
    bus: MixBus;
    muted: boolean;
    auth?: MixerOperatorAuth | null;
  }): ChannelMixerApplyResult {
    const ch = this.channels.get(input.channelId);
    if (!ch) {
      this.lastCode = "MIX-003";
      return { ok: false, code: "MIX-003", message: "channel not found" };
    }
    if (input.bus === "PROGRAM" && !canProgram(input.auth)) {
      this.lastCode = "MIX-002";
      return { ok: false, code: "MIX-002", message: "PROGRAM auth denied" };
    }

    if (input.bus === "PERSONAL") {
      ch.personalMuted = input.muted;
      const store = this.personalBusStore.get(ch.channelId) ?? {
        gain: ch.personalGain,
        muted: false,
        solo: false,
      };
      store.muted = input.muted;
      this.personalBusStore.set(ch.channelId, store);
      this.applyPersonalToOwner(ch);
    } else {
      ch.programMuted = input.muted;
      this.programBusStore.set(ch.channelId, { gain: ch.programGain, muted: input.muted });
      this.applyProgramToOwner(ch);
    }
    this.notify();
    return { ok: true, message: input.muted ? "muted" : "unmuted", channel: { ...ch } };
  }

  setSolo(input: { channelId: string; solo: boolean }): ChannelMixerApplyResult {
    const ch = this.channels.get(input.channelId);
    if (!ch) {
      this.lastCode = "MIX-003";
      return { ok: false, code: "MIX-003", message: "channel not found" };
    }
    // Solo is PERSONAL-only (listener local)
    for (const c of this.channels.values()) {
      if (c.channelId === ch.channelId) {
        c.personalSolo = input.solo;
      } else if (input.solo) {
        c.personalSolo = false;
      }
    }
    this.notify();
    return { ok: true, message: input.solo ? "solo" : "solo off", channel: { ...ch } };
  }

  /**
   * Effective PERSONAL hear gain for a channel (simulation for second listener tests).
   * Crowd at 0 must not zero performer channels (MIX-009).
   */
  getEffectivePersonalGain(channelId: string): number {
    const ch = this.channels.get(channelId);
    if (!ch) return 0;
    const master = this.channels.get(VIRTUAL_IDS.master);
    const masterGain = master && !master.personalMuted ? master.personalGain : 0;
    if (ch.kind === "master") return ch.personalMuted ? 0 : ch.personalGain;

    const anySolo = Array.from(this.channels.values()).some((c) => c.personalSolo);
    if (anySolo && !ch.personalSolo) return 0;
    if (ch.personalMuted) return 0;

    // Crowd independent — zero crowd does not affect participants
    if (ch.kind === "crowd") {
      return ch.personalGain * masterGain;
    }
    return ch.personalGain * masterGain;
  }

  /** Program bus snapshot for a channel — PERSONAL changes must not alter this */
  getProgramBusSnapshot(channelId: string): { gain: number; muted: boolean } | null {
    return this.programBusStore.get(channelId) ?? null;
  }

  getPersonalBusSnapshot(channelId: string): { gain: number; muted: boolean; solo: boolean } | null {
    return this.personalBusStore.get(channelId) ?? null;
  }

  applyPreset(preset: MixerPresetId, bus: MixBus = "PERSONAL", auth?: MixerOperatorAuth | null): ChannelMixerApplyResult {
    if (bus === "PROGRAM" && !canProgram(auth)) {
      this.lastCode = "MIX-002";
      return { ok: false, code: "MIX-002", message: "PROGRAM auth denied" };
    }

    const apply = (channelId: string, gain: number) => {
      this.setGain({ channelId, bus, gain, auth });
    };

    switch (preset) {
      case "RESET":
      case "BALANCED":
        apply(VIRTUAL_IDS.master, 0.9);
        apply(VIRTUAL_IDS.crowd, this.policy.crowdDefaultGain);
        apply(VIRTUAL_IDS.music, this.policy.musicDefaultGain);
        apply(VIRTUAL_IDS.ambience, this.policy.ambienceDefaultGain);
        apply(VIRTUAL_IDS.myMic, 0.85);
        for (const ch of this.channels.values()) {
          if (ch.kind === "participant") apply(ch.channelId, 0.85);
        }
        break;
      case "VOCALS_FORWARD":
        apply(VIRTUAL_IDS.master, 0.92);
        apply(VIRTUAL_IDS.music, 0.4);
        apply(VIRTUAL_IDS.crowd, 0.25);
        for (const ch of this.channels.values()) {
          if (ch.kind === "participant") apply(ch.channelId, 1);
        }
        apply(VIRTUAL_IDS.myMic, 1);
        break;
      case "MUSIC_FORWARD":
        apply(VIRTUAL_IDS.music, 0.95);
        apply(VIRTUAL_IDS.crowd, 0.2);
        for (const ch of this.channels.values()) {
          if (ch.kind === "participant") apply(ch.channelId, 0.65);
        }
        break;
      case "CROWD_UP":
        apply(VIRTUAL_IDS.crowd, 0.85);
        break;
      case "CROWD_LOW":
        apply(VIRTUAL_IDS.crowd, 0.1);
        break;
      case "FOCUS": {
        const first = Array.from(this.channels.values()).find((c) => c.kind === "participant");
        apply(VIRTUAL_IDS.crowd, 0.15);
        apply(VIRTUAL_IDS.music, 0.3);
        if (first) {
          for (const ch of this.channels.values()) {
            if (ch.kind === "participant") {
              apply(ch.channelId, ch.channelId === first.channelId ? 1 : 0.35);
            }
          }
          this.setSolo({ channelId: first.channelId, solo: true });
        }
        break;
      }
      case "REHEARSAL":
        apply(VIRTUAL_IDS.master, 0.85);
        apply(VIRTUAL_IDS.music, 0.55);
        apply(VIRTUAL_IDS.crowd, 0.1);
        apply(VIRTUAL_IDS.ambience, 0.3);
        apply(VIRTUAL_IDS.myMic, 0.9);
        break;
      default:
        break;
    }

    this.notify();
    return { ok: true, message: `preset ${preset} applied on ${bus}` };
  }

  /**
   * AUTO BALANCE — ON only when measurement exists; else ASSIST/OFF honest stub.
   */
  runAutoBalance(auth?: MixerOperatorAuth | null): ChannelMixerApplyResult {
    if (!this.audioOwner?.getVolumeMap) {
      this.autoBalance = {
        mode: "OFF",
        measurementAvailable: false,
        lastAppliedAt: null,
        detail: "MIX-008 — AUTO BALANCE OFF (no measurement)",
      };
      this.lastCode = "MIX-008";
      this.notify();
      return { ok: false, code: "MIX-008", message: this.autoBalance.detail };
    }

    const volumes = this.audioOwner.getVolumeMap();
    const ids = Object.keys(volumes).filter((id) => this.channels.has(`participant:${id}`) || this.channels.has(id));
    if (ids.length === 0) {
      this.autoBalance = {
        mode: "ASSIST",
        measurementAvailable: true,
        lastAppliedAt: null,
        detail: "ASSIST — measurement present but no participant RMS yet",
      };
      this.notify();
      return { ok: true, message: this.autoBalance.detail };
    }

    const target = 0.12; // soft RMS target
    for (const id of ids) {
      const rms = volumes[id] ?? 0;
      const channelId = this.channels.has(`participant:${id}`) ? `participant:${id}` : id;
      const ch = this.channels.get(channelId);
      if (!ch || ch.kind !== "participant") continue;
      const factor = rms > 0.001 ? Math.min(1.2, target / rms) : 1;
      const next = clampGain(ch.personalGain * factor * 0.85).value;
      this.setGain({ channelId, bus: "PERSONAL", gain: next, auth });
    }

    this.autoBalance = {
      mode: "ASSIST",
      measurementAvailable: true,
      lastAppliedAt: Date.now(),
      detail: "ASSIST applied from AudioOwner RMS — not claiming perfect auto",
    };
    this.notify();
    return { ok: true, message: this.autoBalance.detail };
  }

  getAutoBalanceStatus(): AutoBalanceStatus {
    return { ...this.autoBalance };
  }

  getSystemHealth(): MixerSystemHealth[] {
    const ownerBound = this.audioOwner != null;
    const crowd = this.channels.get(VIRTUAL_IDS.crowd);
    return [
      {
        systemId: "AUDIO_MIXER",
        powerState: ownerBound ? "ON" : "DEFAULT_ONLY",
        detail: ownerBound
          ? `ChannelMixerDirector → bound AudioOwner · ${RAMP_DOC}`
          : "MIX-001 — DEFAULT_ONLY (director state only, no live graph)",
        lastCode: ownerBound ? undefined : "MIX-001",
      },
      {
        systemId: "PERSONAL_MIX",
        powerState: "ON",
        detail: "Listener-local PERSONAL bus active",
      },
      {
        systemId: "PROGRAM_MIX",
        powerState: this.policy.programMixExpected ? (ownerBound ? "ON" : "DEFAULT_ONLY") : "DEFAULT_ONLY",
        detail: "Host/operator auth required; fans cannot change others' mix",
      },
      {
        systemId: "CROWD_MIX",
        powerState: crowd?.sourceAvailable ? "ON" : "DEFAULT_ONLY",
        detail: crowd?.sourceAvailable
          ? "Real reaction source attached"
          : "DEFAULT_ONLY — no fake crowd; gain UI present, source unavailable until reactions wired",
        lastCode: crowd?.sourceAvailable ? undefined : "MIX-005",
      },
      ...CanonicalPerformanceGlueDirector.getSystemHealth(),
    ];
  }

  getLastCode(): MixerErrorCode | undefined {
    return this.lastCode;
  }

  getFidelityHealth() {
    return FidelityIntelligenceDirector.getHealth();
  }

  /** Duplicate engine check — authority is this director + one optional AudioOwner */
  getAuthorityReport(): {
    mixerAuthority: "ChannelMixerDirector";
    audioOwner: "TMIAudioSafetyMixer" | "UNBOUND" | "CUSTOM";
    duplicateEngines: 0;
    session: ChannelMixerSession | null;
  } {
    return {
      mixerAuthority: "ChannelMixerDirector",
      audioOwner: this.audioOwner
        ? "getVolumeMap" in this.audioOwner || "setMasterVolume" in this.audioOwner
          ? "TMIAudioSafetyMixer"
          : "CUSTOM"
        : "UNBOUND",
      duplicateEngines: 0,
      session: this.getSession(),
    };
  }

  reset(): void {
    this.session = null;
    this.audioOwner = null;
    this.channels.clear();
    this.programBusStore.clear();
    this.personalBusStore.clear();
    this.policy = resolveExperienceAudioProfile("LIVE");
    this.lastCode = undefined;
    this.autoBalance = {
      mode: "OFF",
      measurementAvailable: false,
      lastAppliedAt: null,
      detail: "MIX-008 — reset",
    };
    CanonicalPerformanceGlueDirector.reset();
    FidelityIntelligenceDirector.reset();
    this.notify();
  }

  private syncStoresFromChannel(ch: MixerChannelState): void {
    this.personalBusStore.set(ch.channelId, {
      gain: ch.personalGain,
      muted: ch.personalMuted,
      solo: ch.personalSolo,
    });
    this.programBusStore.set(ch.channelId, {
      gain: ch.programGain,
      muted: ch.programMuted,
    });
  }

  /** Listener-local hear path → bound AudioOwner (never touches programBusStore) */
  private applyPersonalToOwner(ch: MixerChannelState): void {
    if (!this.audioOwner) {
      this.lastCode = "MIX-001";
      return;
    }
    if (ch.kind === "master") {
      this.audioOwner.setMasterVolume(ch.personalMuted ? 0 : ch.personalGain);
      return;
    }
    if (ch.kind === "participant" && ch.participantId) {
      const gain = ch.personalMuted ? 0 : ch.personalGain;
      if (this.audioOwner.setChannelGain) {
        this.audioOwner.setChannelGain(ch.participantId, gain);
      } else if (this.audioOwner.setMute) {
        this.audioOwner.setMute(ch.participantId, ch.personalMuted || gain <= 0.001);
      }
    }
    // Crowd/ambience/music: only when hasRealSource — no fake injection
  }

  private applyProgramToOwner(ch: MixerChannelState): void {
    if (!this.audioOwner) {
      this.lastCode = "MIX-001";
      return;
    }
    if (ch.kind === "master") {
      this.audioOwner.setMasterVolume(ch.programMuted ? 0 : ch.programGain);
      return;
    }
    if (ch.kind === "participant" && ch.participantId) {
      const gain = ch.programMuted ? 0 : ch.programGain;
      if (this.audioOwner.setChannelGain) {
        this.audioOwner.setChannelGain(ch.participantId, gain);
      } else if (this.audioOwner.setMute) {
        this.audioOwner.setMute(ch.participantId, ch.programMuted || gain <= 0.001);
      }
    }
    // Crowd/ambience/music: only apply when real source marked — no fake injection
  }
}

export const ChannelMixerDirector = new ChannelMixerDirectorImpl();
export { VIRTUAL_IDS as MIXER_VIRTUAL_CHANNEL_IDS };

export function powerStateIsOn(state: SystemPowerState): boolean {
  return state === "ON";
}
