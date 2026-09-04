/**
 * CanonicalAudioBusDirector.ts — 3-Bus Audio Law & Independent Listener-Local Mixing
 *
 * Laws:
 * 1. VOICE / CONVERSATION (microphones, participant speech)
 * 2. SHARE / SHARED MEDIA (playlists, screen share audio, videos, snips, web tabs)
 * 3. PROGRAM / PERFORMANCE (master venue stage / broadcast feed)
 *
 * Hard Invariants:
 * - Changing listener-local SHARE volume or mute NEVER pauses or alters the room's canonical stream.
 * - Changing VOICE volume or mute NEVER alters SHARE or PROGRAM.
 * - Source transitions (PLAYLIST → SCREEN SHARE → VIDEO → PLAYLIST) perform clean handoffs with zero ghost audio decoders.
 */

import { create } from "zustand";

export type AudioBusId = "VOICE" | "SHARE" | "PROGRAM";

export interface BusControlState {
  volume: number; // 0.0 to 1.0 (default 0.8)
  muted: boolean;
  solo: boolean;
  activeSourcesCount: number;
  currentSourceName: string | null;
}

export interface CanonicalAudioMixerState {
  buses: Record<AudioBusId, BusControlState>;
  
  // Actions
  setBusVolume: (bus: AudioBusId, volume: number) => void;
  toggleBusMute: (bus: AudioBusId) => void;
  setBusMute: (bus: AudioBusId, muted: boolean) => void;
  setBusSolo: (bus: AudioBusId, solo: boolean) => void;
  registerActiveSource: (bus: AudioBusId, sourceName: string) => void;
  unregisterActiveSource: (bus: AudioBusId, sourceName: string) => void;
  resetToDefaults: () => void;
}

const DEFAULT_BUSES: Record<AudioBusId, BusControlState> = {
  VOICE: {
    volume: 0.85,
    muted: false,
    solo: false,
    activeSourcesCount: 1,
    currentSourceName: "Microphone Array",
  },
  SHARE: {
    volume: 0.8,
    muted: false,
    solo: false,
    activeSourcesCount: 0,
    currentSourceName: null,
  },
  PROGRAM: {
    volume: 0.9,
    muted: false,
    solo: false,
    activeSourcesCount: 1,
    currentSourceName: "Main Stage Audio",
  },
};

export const useCanonicalAudioMixerStore = create<CanonicalAudioMixerState>((set) => ({
  buses: { ...DEFAULT_BUSES },

  setBusVolume: (bus, volume) =>
    set((state) => ({
      buses: {
        ...state.buses,
        [bus]: {
          ...state.buses[bus],
          volume: Math.max(0, Math.min(1, volume)),
        },
      },
    })),

  toggleBusMute: (bus) =>
    set((state) => ({
      buses: {
        ...state.buses,
        [bus]: {
          ...state.buses[bus],
          muted: !state.buses[bus].muted,
        },
      },
    })),

  setBusMute: (bus, muted) =>
    set((state) => ({
      buses: {
        ...state.buses,
        [bus]: {
          ...state.buses[bus],
          muted,
        },
      },
    })),

  setBusSolo: (bus, solo) =>
    set((state) => ({
      buses: {
        ...state.buses,
        [bus]: {
          ...state.buses[bus],
          solo,
        },
      },
    })),

  registerActiveSource: (bus, sourceName) =>
    set((state) => ({
      buses: {
        ...state.buses,
        [bus]: {
          ...state.buses[bus],
          activeSourcesCount: state.buses[bus].activeSourcesCount + 1,
          currentSourceName: sourceName,
        },
      },
    })),

  unregisterActiveSource: (bus, sourceName) =>
    set((state) => ({
      buses: {
        ...state.buses,
        [bus]: {
          ...state.buses[bus],
          activeSourcesCount: Math.max(0, state.buses[bus].activeSourcesCount - 1),
          currentSourceName:
            state.buses[bus].currentSourceName === sourceName
              ? null
              : state.buses[bus].currentSourceName,
        },
      },
    })),

  resetToDefaults: () => set({ buses: { ...DEFAULT_BUSES } }),
}));
