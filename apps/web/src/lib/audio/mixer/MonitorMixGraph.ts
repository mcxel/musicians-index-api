/**
 * MonitorMixGraph — MIX discovers the real audible graph.
 *
 * WORKSPACE → MONITOR → COMPOSITION → PANEL → MEDIA SOURCE → AUDIO SOURCE
 * plus room, party, screen-share, and voice buses that actually exist.
 *
 * Does not construct an AudioContext. Gain writes go through ChannelMixerDirector.
 * PERSONAL (my listen mix) never writes PROGRAM.
 * A monitor master multiplies children; it does not rewrite their stored gain.
 * Capacity is 16 audible sources per monitor. Absent sources are not invented.
 */

import {
  canonicalMonitorFromMixMonitor,
  mixMonitorFromCanonical,
  type Phase1PresentedMonitorId,
} from "@/lib/monitors/canonicalMonitorIdentity";
import {
  ChannelMixerDirector,
  type MixBus,
  type MixerOperatorAuth,
} from "./ChannelMixerDirector";

export const MAX_AUDIBLE_SOURCES_PER_MONITOR = 16 as const;

/** Runtime mixer slots stay the two presented monitors. Canonical ids adapt at this boundary. */
export type MixMonitorId = "MONITOR_1" | "MONITOR_2";

export function canonicalMonitorForMix(id: MixMonitorId): Phase1PresentedMonitorId {
  return canonicalMonitorFromMixMonitor(id);
}

export { mixMonitorFromCanonical };

export type MixGroup = "MONITOR" | "ROOM" | "PARTY" | "SCREEN_SHARE" | "VOICES";

export type MixScope = "MY_MIX" | "MONITORS" | "ROOM" | "PARTY" | "SCREEN_SHARE" | "VOICES" | "PROGRAM";

export interface MixGraphFrame {
  id: string;
  source: string | null;
  parked: boolean;
  label: string;
}

export interface MixGraphPanel {
  id: string;
  monitorId: MixMonitorId;
  sourceType: string;
  sourceId: string | null;
  label: string;
}

export interface MixGraphFriend {
  id: string;
  displayName: string;
}

export interface MixGraphChannel {
  channelId: string;
  kind: string;
  displayName: string;
  hasRealSource: boolean;
  sourceAvailable: boolean;
  participantId?: string;
}

export interface MixGraphInput {
  roomId: string | null;
  screenShareAudioSourceId: string | null;
  frames: MixGraphFrame[];
  panels: MixGraphPanel[];
  friends: MixGraphFriend[];
  directorChannels: MixGraphChannel[];
}

export interface MixStrip {
  sourceId: string;
  label: string;
  group: MixGroup;
  monitorId: MixMonitorId | null;
  panelId: string | null;
  channelId: string | null;
}

const PLACEHOLDER_EXPERIENCE = "canonical-experience-stream";
const SILENT_MEDIA = /image|photo|still|poster|artwork|picture/i;
const AUDIBLE_FRAMES = new Set([
  "SELF_CAMERA",
  "PERFORMER_FEED",
  "AUDIENCE_VIEW",
  "SCREEN_SHARE",
  "VIDEO_PLAYBACK",
]);

function clamp(gain: number): number {
  if (Number.isNaN(gain)) return 0;
  return Math.max(0, Math.min(1, gain));
}

function monitorForFrame(frameId: string): MixMonitorId {
  const canonical = frameId === "a" || frameId === "c" || frameId === "e" || frameId === "g" ? "M1" : "M2";
  return mixMonitorFromCanonical(canonical) ?? "MONITOR_1";
}

export function discoverMixStrips(input: MixGraphInput): MixStrip[] {
  const strips: MixStrip[] = [];
  const seen = new Set<string>();
  const perMonitor: Record<MixMonitorId, number> = { MONITOR_1: 0, MONITOR_2: 0 };

  const push = (strip: MixStrip) => {
    if (seen.has(strip.sourceId)) return;
    if (strip.monitorId) {
      if (perMonitor[strip.monitorId] >= MAX_AUDIBLE_SOURCES_PER_MONITOR) return;
      perMonitor[strip.monitorId] += 1;
    }
    seen.add(strip.sourceId);
    strips.push(strip);
  };

  for (const panel of input.panels) {
    if (!panel.sourceId || panel.sourceType === "EMPTY" || panel.sourceType === "AVATAR_LOBBY") continue;
    if (panel.sourceType === "MEDIA" && SILENT_MEDIA.test(`${panel.label} ${panel.sourceId}`)) continue;
    if (
      panel.sourceType === "EXPERIENCE" &&
      panel.sourceId === PLACEHOLDER_EXPERIENCE &&
      !input.roomId
    ) {
      continue;
    }
    if (panel.sourceType === "CALL_PARTICIPANT") {
      const friend = input.friends.find((f) => f.id === panel.sourceId);
      if (!friend) continue;
      push({
        sourceId: `voice:${friend.id}`,
        label: friend.displayName,
        group: "PARTY",
        monitorId: panel.monitorId,
        panelId: panel.id,
        channelId: `participant:${friend.id}`,
      });
      continue;
    }
    if (panel.sourceType === "MEDIA" || panel.sourceType === "EXPERIENCE") {
      const share = /screen.?share/i.test(`${panel.label} ${panel.sourceId}`);
      push({
        sourceId: share ? `share:${panel.sourceId}` : `media:${panel.sourceId}`,
        label: panel.label,
        group: share ? "SCREEN_SHARE" : "MONITOR",
        monitorId: panel.monitorId,
        panelId: panel.id,
        channelId: null,
      });
    }
  }

  for (const frame of input.frames) {
    if (frame.parked || !frame.source || !AUDIBLE_FRAMES.has(frame.source)) continue;
    const needsRoom =
      frame.source === "SELF_CAMERA" ||
      frame.source === "PERFORMER_FEED" ||
      frame.source === "AUDIENCE_VIEW" ||
      frame.source === "SCREEN_SHARE";
    if (needsRoom && !input.roomId && !(frame.source === "SCREEN_SHARE" && input.screenShareAudioSourceId)) {
      continue;
    }
    const share = frame.source === "SCREEN_SHARE";
    push({
      sourceId: share
        ? `share:${input.screenShareAudioSourceId ?? frame.id}`
        : `frame:${frame.id}:${frame.source}`,
      label: frame.label,
      group: share ? "SCREEN_SHARE" : "MONITOR",
      monitorId: monitorForFrame(frame.id),
      panelId: null,
      channelId: null,
    });
  }

  for (const ch of input.directorChannels) {
    if (!ch.hasRealSource && !ch.sourceAvailable) continue;
    if (ch.kind === "crowd" || ch.kind === "ambience" || ch.kind === "music") {
      push({
        sourceId: `room:${ch.channelId}`,
        label: ch.displayName,
        group: "ROOM",
        monitorId: null,
        panelId: null,
        channelId: ch.channelId,
      });
      continue;
    }
    if (ch.kind === "participant" && ch.participantId) {
      push({
        sourceId: `voice:${ch.participantId}`,
        label: ch.displayName,
        group: "PARTY",
        monitorId: null,
        panelId: null,
        channelId: ch.channelId,
      });
    }
    if (ch.kind === "my_mic") {
      push({
        sourceId: "mic:local",
        label: ch.displayName,
        group: "VOICES",
        monitorId: null,
        panelId: null,
        channelId: ch.channelId,
      });
    }
  }

  return strips;
}

interface StoredGain {
  gain: number;
  muted: boolean;
  solo: boolean;
}

const DEFAULT_GAIN = 0.85;

function blankGain(): StoredGain {
  return { gain: DEFAULT_GAIN, muted: false, solo: false };
}

class MonitorMixController {
  private sources = new Map<string, StoredGain>();
  private monitors: Record<MixMonitorId, { gain: number; muted: boolean }> = {
    MONITOR_1: { gain: 1, muted: false },
    MONITOR_2: { gain: 1, muted: false },
  };
  private listen = { gain: 1, muted: false };
  private lastStrips: MixStrip[] = [];
  private listeners = new Set<() => void>();

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify(): void {
    for (const fn of this.listeners) fn();
  }

  resetForTests(): void {
    this.sources.clear();
    this.monitors.MONITOR_1 = { gain: 1, muted: false };
    this.monitors.MONITOR_2 = { gain: 1, muted: false };
    this.listen = { gain: 1, muted: false };
    this.lastStrips = [];
    this.notify();
  }

  discover(input: MixGraphInput): MixStrip[] {
    this.lastStrips = discoverMixStrips(input);
    return this.lastStrips;
  }

  getStrips(): MixStrip[] {
    return this.lastStrips;
  }

  private stored(sourceId: string): StoredGain {
    const existing = this.sources.get(sourceId);
    if (existing) return existing;
    const created = blankGain();
    this.sources.set(sourceId, created);
    return created;
  }

  sourceGain(strip: MixStrip): number {
    if (strip.channelId) {
      const ch = ChannelMixerDirector.getChannel(strip.channelId);
      if (ch) return ch.personalGain;
    }
    return this.stored(strip.sourceId).gain;
  }

  sourceMuted(strip: MixStrip, bus: MixBus = "PERSONAL"): boolean {
    if (strip.channelId) {
      const ch = ChannelMixerDirector.getChannel(strip.channelId);
      if (ch) return bus === "PROGRAM" ? ch.programMuted : ch.personalMuted;
    }
    return this.stored(strip.sourceId).muted;
  }

  sourceSolo(strip: MixStrip): boolean {
    if (strip.channelId) {
      const ch = ChannelMixerDirector.getChannel(strip.channelId);
      if (ch?.personalSolo) return true;
    }
    return this.stored(strip.sourceId).solo;
  }

  monitorState(monitorId: MixMonitorId): { gain: number; muted: boolean } {
    return { ...this.monitors[monitorId] };
  }

  listenState(): { gain: number; muted: boolean } {
    const master = ChannelMixerDirector.getChannel("__master__");
    if (master) return { gain: master.personalGain, muted: master.personalMuted };
    return { ...this.listen };
  }

  setSourceGain(
    strip: MixStrip,
    gain: number,
    bus: MixBus,
    auth?: MixerOperatorAuth | null,
  ): { ok: boolean; message: string } {
    const value = clamp(gain);
    if (bus === "PROGRAM") {
      if (!strip.channelId) return { ok: false, message: "program source is not on the shared graph" };
      const res = ChannelMixerDirector.setGain({
        channelId: strip.channelId,
        bus: "PROGRAM",
        gain: value,
        auth,
      });
      return { ok: res.ok, message: res.message };
    }
    const prev = this.stored(strip.sourceId);
    this.sources.set(strip.sourceId, { ...prev, gain: value });
    if (strip.channelId) {
      ChannelMixerDirector.setGain({
        channelId: strip.channelId,
        bus: "PERSONAL",
        gain: value,
        auth,
      });
    }
    this.pushStrip(strip);
    this.notify();
    return { ok: true, message: "personal gain set" };
  }

  setSourceMute(strip: MixStrip, muted: boolean, bus: MixBus, auth?: MixerOperatorAuth | null): { ok: boolean } {
    if (bus === "PROGRAM") {
      if (!strip.channelId) return { ok: false };
      const res = ChannelMixerDirector.setMute({
        channelId: strip.channelId,
        bus: "PROGRAM",
        muted,
        auth,
      });
      return { ok: res.ok };
    }
    const prev = this.stored(strip.sourceId);
    this.sources.set(strip.sourceId, { ...prev, muted });
    if (strip.channelId) {
      ChannelMixerDirector.setMute({
        channelId: strip.channelId,
        bus: "PERSONAL",
        muted,
      });
    }
    this.pushStrip(strip);
    this.notify();
    return { ok: true };
  }

  setSolo(strip: MixStrip, solo: boolean): void {
    if (strip.channelId) {
      ChannelMixerDirector.setSolo({ channelId: strip.channelId, solo });
    } else if (solo) {
      for (const ch of ChannelMixerDirector.getChannels()) {
        if (ch.personalSolo) ChannelMixerDirector.setSolo({ channelId: ch.channelId, solo: false });
      }
    }
    if (solo) {
      for (const [id, state] of this.sources) {
        this.sources.set(id, { ...state, solo: id === strip.sourceId });
      }
      const current = this.stored(strip.sourceId);
      this.sources.set(strip.sourceId, { ...current, solo: true });
    } else {
      const current = this.stored(strip.sourceId);
      this.sources.set(strip.sourceId, { ...current, solo: false });
    }
    this.pushAll();
    this.notify();
  }

  setMonitorGain(monitorId: MixMonitorId, gain: number): void {
    this.monitors[monitorId] = { ...this.monitors[monitorId], gain: clamp(gain) };
    this.pushAll();
    this.notify();
  }

  setMonitorMute(monitorId: MixMonitorId, muted: boolean): void {
    this.monitors[monitorId] = { ...this.monitors[monitorId], muted };
    this.pushAll();
    this.notify();
  }

  setListenGain(gain: number): void {
    const value = clamp(gain);
    const master = ChannelMixerDirector.getChannel("__master__");
    if (master) {
      ChannelMixerDirector.setGain({ channelId: master.channelId, bus: "PERSONAL", gain: value });
    } else {
      this.listen = { ...this.listen, gain: value };
    }
    this.pushAll();
    this.notify();
  }

  setListenMute(muted: boolean): void {
    const master = ChannelMixerDirector.getChannel("__master__");
    if (master) {
      ChannelMixerDirector.setMute({ channelId: master.channelId, bus: "PERSONAL", muted });
    } else {
      this.listen = { ...this.listen, muted };
    }
    this.pushAll();
    this.notify();
  }

  /** Stored child gain is unchanged by monitor or listen masters. */
  childStoredGain(sourceId: string): number {
    return this.sources.get(sourceId)?.gain ?? DEFAULT_GAIN;
  }

  effective(strip: MixStrip, bus: MixBus = "PERSONAL"): number {
    if (bus === "PROGRAM") {
      if (!strip.channelId) return 0;
      const ch = ChannelMixerDirector.getChannel(strip.channelId);
      if (!ch || ch.programMuted) return 0;
      return ch.programGain;
    }
    const gain = this.sourceGain(strip);
    const muted = this.sourceMuted(strip, "PERSONAL");
    const soloed = this.anySolo() && !this.sourceSolo(strip);
    const source = muted || soloed ? 0 : gain;
    const monitor = strip.monitorId
      ? this.monitors[strip.monitorId].muted
        ? 0
        : this.monitors[strip.monitorId].gain
      : 1;
    const listen = this.listenState();
    const listenGain = listen.muted ? 0 : listen.gain;
    return clamp(source * monitor * listenGain);
  }

  private anySolo(): boolean {
    if (this.lastStrips.some((strip) => this.sourceSolo(strip))) return true;
    for (const state of this.sources.values()) {
      if (state.solo) return true;
    }
    return ChannelMixerDirector.getChannels().some((ch) => ch.personalSolo);
  }

  private pushStrip(strip: MixStrip): void {
    if (!strip.channelId) return;
    const listen = this.listenState();
    const channelOut = listen.muted ? 0 : this.effective(strip) / (listen.gain || 1);
    ChannelMixerDirector.applyListenOutput({
      channelId: strip.channelId,
      effectiveGain: clamp(channelOut),
    });
    ChannelMixerDirector.applyListenOutput({
      channelId: "__master__",
      effectiveGain: listen.muted ? 0 : listen.gain,
    });
  }

  private pushAll(): void {
    for (const strip of this.lastStrips) this.pushStrip(strip);
  }
}

export const monitorMixController = new MonitorMixController();

/**
 * Presence only. Surfaces that can produce audio retain a count while mounted.
 * Article-only workspaces retain nothing, so MIX stays off that page.
 * The command bed retains the mix slot so a second launcher is not drawn.
 */
const presenceListeners = new Set<() => void>();
let audibleExperienceCount = 0;
let monitorWorkspaceCount = 0;
let mixSlotCount = 0;

function emitPresence(): void {
  for (const listener of presenceListeners) listener();
}

export function subscribeMixPresence(listener: () => void): () => void {
  presenceListeners.add(listener);
  return () => presenceListeners.delete(listener);
}

export function retainAudibleExperience(): () => void {
  audibleExperienceCount += 1;
  emitPresence();
  return () => {
    audibleExperienceCount = Math.max(0, audibleExperienceCount - 1);
    emitPresence();
  };
}

export function retainMonitorWorkspace(): () => void {
  monitorWorkspaceCount += 1;
  emitPresence();
  return () => {
    monitorWorkspaceCount = Math.max(0, monitorWorkspaceCount - 1);
    emitPresence();
  };
}

export function retainMixSlot(): () => void {
  mixSlotCount += 1;
  emitPresence();
  return () => {
    mixSlotCount = Math.max(0, mixSlotCount - 1);
    emitPresence();
  };
}

export function readMixPresence(): { audible: boolean; monitors: boolean; mixSlot: boolean } {
  return {
    audible: audibleExperienceCount > 0,
    monitors: monitorWorkspaceCount > 0,
    mixSlot: mixSlotCount > 0,
  };
}

export function resetMixPresenceForTests(): void {
  audibleExperienceCount = 0;
  monitorWorkspaceCount = 0;
  mixSlotCount = 0;
  emitPresence();
}

export function programMixAllowed(auth: MixerOperatorAuth | null | undefined): boolean {
  if (!auth) return false;
  if (auth.isRoomOwner) return true;
  return auth.role === "host" || auth.role === "admin" || auth.role === "operator" || auth.role === "system";
}
