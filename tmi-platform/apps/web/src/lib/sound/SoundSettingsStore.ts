"use client";

import { useState, useEffect } from "react";
import { SoundThemeId } from "./SoundThemeRegistry";

export type SoundPresetId = "silent" | "soft" | "normal" | "strong" | "immersive";

export interface SoundSettingsState {
  masterVolume: number;
  clickVolume: number;
  notificationVolume: number;
  messageVolume: number;
  liveEventVolume: number;
  broadcastVolume: number;
  purchaseVolume: number;
  achievementVolume: number;
  activeTheme: SoundThemeId;
  activePreset: SoundPresetId;
  reducedMotion: boolean;
  instantCounters: boolean;
  soundEnabled: boolean;

  setMasterVolume: (val: number) => void;
  setCategoryVolume: (key: string, val: number) => void;
  applyPreset: (preset: SoundPresetId) => void;
  setTheme: (theme: SoundThemeId) => void;
  toggleReducedMotion: () => void;
  toggleInstantCounters: () => void;
  toggleSound: () => void;
}

const STORAGE_KEY = "tmi-sound-settings-storage";

const ACTIONS = {
  setMasterVolume: (val: number) => soundSettingsStore.setMasterVolume(val),
  setCategoryVolume: (key: string, val: number) => soundSettingsStore.setCategoryVolume(key, val),
  applyPreset: (preset: SoundPresetId) => soundSettingsStore.applyPreset(preset),
  setTheme: (theme: SoundThemeId) => soundSettingsStore.setTheme(theme),
  toggleReducedMotion: () => soundSettingsStore.toggleReducedMotion(),
  toggleInstantCounters: () => soundSettingsStore.toggleInstantCounters(),
  toggleSound: () => soundSettingsStore.toggleSound(),
};

const DEFAULT_STATE_DATA = {
  masterVolume: 60,
  clickVolume: 60,
  notificationVolume: 70,
  messageVolume: 70,
  liveEventVolume: 80,
  broadcastVolume: 75,
  purchaseVolume: 85,
  achievementVolume: 90,
  activeTheme: "studio" as SoundThemeId,
  activePreset: "normal" as SoundPresetId,
  reducedMotion: false,
  instantCounters: false,
  soundEnabled: true,
};

let stateData = { ...DEFAULT_STATE_DATA };
const subscribers = new Set<() => void>();

function getFullState(): SoundSettingsState {
  return { ...stateData, ...ACTIONS };
}

function notify() {
  subscribers.forEach((fn) => fn());
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stateData));
    } catch {}
  }
}

if (typeof window !== "undefined" && window.localStorage) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      stateData = { ...DEFAULT_STATE_DATA, ...parsed };
    }
  } catch {}
}

export const soundSettingsStore = {
  getState: (): SoundSettingsState => getFullState(),

  setState: (updater: Partial<SoundSettingsState> | ((prev: SoundSettingsState) => Partial<SoundSettingsState>)) => {
    const next = typeof updater === "function" ? updater(getFullState()) : updater;
    stateData = { ...stateData, ...next };
    notify();
  },

  setMasterVolume: (val: number) => {
    stateData = { ...stateData, masterVolume: val };
    notify();
  },

  setCategoryVolume: (key: string, val: number) => {
    stateData = { ...stateData, [key]: val };
    notify();
  },

  applyPreset: (preset: SoundPresetId) => {
    let master = 60;
    if (preset === "silent") master = 0;
    if (preset === "soft") master = 25;
    if (preset === "normal") master = 60;
    if (preset === "strong") master = 90;
    if (preset === "immersive") master = 100;
    stateData = { ...stateData, activePreset: preset, masterVolume: master, soundEnabled: master > 0 };
    notify();
  },

  setTheme: (theme: SoundThemeId) => {
    stateData = { ...stateData, activeTheme: theme };
    notify();
  },

  toggleReducedMotion: () => {
    stateData = { ...stateData, reducedMotion: !stateData.reducedMotion };
    notify();
  },

  toggleInstantCounters: () => {
    stateData = { ...stateData, instantCounters: !stateData.instantCounters };
    notify();
  },

  toggleSound: () => {
    stateData = { ...stateData, soundEnabled: !stateData.soundEnabled };
    notify();
  },

  subscribe: (fn: () => void): (() => void) => {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  },
};

export function useSoundSettingsStore<T = SoundSettingsState>(
  selector?: (s: SoundSettingsState) => T
): T {
  const [current, setCurrent] = useState(() => getFullState());

  useEffect(() => {
    const unsub = soundSettingsStore.subscribe(() => setCurrent(getFullState()));
    return unsub;
  }, []);

  const res = selector ? selector(current) : current;
  return res as T;
}

useSoundSettingsStore.getState = soundSettingsStore.getState;
useSoundSettingsStore.setState = soundSettingsStore.setState;
