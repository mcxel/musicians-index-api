import { create } from "zustand";
import { MediaItem } from "@/lib/media/media";

function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export type RepeatMode = "none" | "one" | "all";

interface GlobalMediaStore {
  queue: MediaItem[];
  shuffledQueue: MediaItem[];
  currentItem: MediaItem | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  muted: boolean;
  repeatMode: RepeatMode;
  isShuffling: boolean;
  loadQueue: (items: MediaItem[], startPlaying?: boolean) => void;
  setQueue: (items: MediaItem[]) => void;
  play: (item?: MediaItem | null) => void;
  pause: () => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (time: number) => void;
  updateProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
}

export const useGlobalMediaStore = create<GlobalMediaStore>((set, get) => ({
  queue: [],
  shuffledQueue: [],
  currentItem: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 1,
  muted: false,
  repeatMode: "none",
  isShuffling: false,

  loadQueue: (items, startPlaying = true) => {
    const { isShuffling } = get();
    const shuffledQueue = isShuffling ? shuffle(items) : [];
    set({
      queue: items,
      shuffledQueue,
      currentItem: items[0] ?? null,
    });

    if (startPlaying && items.length > 0) {
      get().play(isShuffling ? shuffledQueue[0] ?? null : items[0] ?? null);
    }
  },

  setQueue: (items) => {
    const { isShuffling, currentItem } = get();
    set({
      queue: items,
      shuffledQueue: isShuffling ? shuffle(items) : [],
    });
    if (currentItem && !items.some((item) => item.id === currentItem.id)) {
      get().pause();
    }
  },

  play: (item) => {
    set((state) => ({
      isPlaying: true,
      currentItem: item ?? state.currentItem ?? state.queue[0] ?? null,
      duration: item?.durationMs ?? state.duration ?? 0,
    }));
  },

  pause: () => set({ isPlaying: false }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  playNext: () => {
    const { queue, shuffledQueue, currentItem, repeatMode, isShuffling } = get();
    if (repeatMode === "one" && currentItem) {
      get().play(currentItem);
      return;
    }

    const sourceQueue = isShuffling ? shuffledQueue : queue;
    if (sourceQueue.length === 0) return;

    const currentIndex = currentItem ? sourceQueue.findIndex((item) => item.id === currentItem.id) : -1;
    let nextItem: MediaItem | null = null;

    if (currentIndex + 1 < sourceQueue.length) {
      nextItem = sourceQueue[currentIndex + 1] ?? null;
    } else if (repeatMode === "all") {
      nextItem = sourceQueue[0] ?? null;
    }

    if (isShuffling && !nextItem && repeatMode !== "all") {
      const reshuffled = shuffle(queue);
      set({ shuffledQueue: reshuffled });
      nextItem = reshuffled[0] ?? null;
    }

    if (nextItem) get().play(nextItem);
  },

  playPrev: () => {
    const { queue, shuffledQueue, currentItem, isShuffling } = get();
    const sourceQueue = isShuffling ? shuffledQueue : queue;
    if (sourceQueue.length === 0) return;
    const currentIndex = currentItem ? sourceQueue.findIndex((item) => item.id === currentItem.id) : -1;
    const prevItem = currentIndex > 0 ? sourceQueue[currentIndex - 1] ?? null : null;
    if (prevItem) get().play(prevItem);
  },

  seek: (time) => set({ progress: time }),

  updateProgress: (progress) => set({ progress }),

  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)), muted: volume === 0 }),

  toggleMute: () => set((state) => ({ muted: !state.muted })),

  setRepeatMode: (mode) => set({ repeatMode: mode }),

  toggleShuffle: () => {
    set((state) => ({
      isShuffling: !state.isShuffling,
      shuffledQueue: !state.isShuffling ? shuffle(state.queue) : [],
    }));
  },
}));
