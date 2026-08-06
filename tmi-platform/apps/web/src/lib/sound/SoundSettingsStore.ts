import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  SoundThemeId,
  SOUND_THEMES,
} from "./SoundThemeRegistry";

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
  setCategoryVolume: (category: string, val: number) => void;
  applyPreset: (preset: SoundPresetId) => void;
  setTheme: (theme: SoundThemeId) => void;
  toggleReducedMotion: () => void;
  toggleInstantCounters: () => void;
  toggleSound: () => void;
}

export const useSoundSettingsStore = create<SoundSettingsState>()(
  persist(
    (set) => ({
      masterVolume: 60,
      clickVolume: 60,
      notificationVolume: 70,
      messageVolume: 70,
      liveEventVolume: 80,
      broadcastVolume: 75,
      purchaseVolume: 85,
      achievementVolume: 90,
      activeTheme: "studio",
      activePreset: "normal",
      reducedMotion: false,
      instantCounters: false,
      soundEnabled: true,

      setMasterVolume: (val: number) => set({ masterVolume: val }),
      setCategoryVolume: (key, val) => set({ [key]: val } as any),
      applyPreset: (preset) => {
        let master = 60;
        if (preset === "silent") master = 0;
        if (preset === "soft") master = 25;
        if (preset === "normal") master = 60;
        if (preset === "strong") master = 90;
        if (preset === "immersive") master = 100;
        set({ activePreset: preset, masterVolume: master, soundEnabled: master > 0 });
      },
      setTheme: (theme) => set({ activeTheme: theme }),
      toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),
      toggleInstantCounters: () => set((state) => ({ instantCounters: !state.instantCounters })),
      toggleSound: () => set((curr) => ({ soundEnabled: !curr.soundEnabled })),
    }),
    {
      name: "tmi-sound-settings-storage",
    }
  )
);
