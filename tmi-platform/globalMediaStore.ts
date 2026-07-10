import { create } from "zustand";
import { MediaItem } from "@/lib/media/media";

// Fisher-Yates shuffle algorithm
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

  // Actions
  loadQueue: (items: MediaItem[], startPlaying?: boolean) => void;
  setQueue: (items: MediaItem[]) => void;
  play: (item?: MediaItem) => void;
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
    set({
      queue: items,
      shuffledQueue: isShuffling ? shuffle(items) : [],
      currentItem: items[0] || null,
    });
    if (startPlaying && items.length > 0) {
      const itemToPlay = isShuffling ? get().shuffledQueue[0] : items[0];
      get().play(itemToPlay);
    }
  },

  setQueue: (items) => {
    const { isShuffling, currentItem } = get();
    const newShuffled = isShuffling ? shuffle(items) : [];
    set({ queue: items, shuffledQueue: newShuffled });
    // If current item is gone, stop playback. A better UX might be to find the next valid item.
    if (currentItem && !items.find(i => i.id === currentItem.id)) {
        get().pause();
    }
  },

  play: (item) => {
    set((state) => ({
      isPlaying: true,
      currentItem: item || state.currentItem || state.queue[0] || null,
      duration: item?.durationMs || state.duration || 0,
    }));
  },

  pause: () => set({ isPlaying: false }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  playNext: () => {
    const { queue, shuffledQueue, currentItem, repeatMode, isShuffling } = get();
    if (repeatMode === "one" && currentItem) {
      get().play(currentItem); // Re-play the same item
      return;
    }

    const sourceQueue = isShuffling ? shuffledQueue : queue;
    if (sourceQueue.length === 0) return;

    const currentIndex = currentItem ? sourceQueue.findIndex((i) => i.id === currentItem.id) : -1;
    let nextItem: MediaItem | null = null;

    const nextIndex = currentIndex + 1;

    if (nextIndex < sourceQueue.length) {
      nextItem = sourceQueue[nextIndex];
    } else if (repeatMode === "all") {
      nextItem = sourceQueue[0] || null; // Loop to the beginning
    }

    // If we're at the end of a shuffled queue and not repeating all, reshuffle and play from the start.
    if (isShuffling && !nextItem && repeatMode !== 'all') {
        const newShuffledQueue = shuffle(queue);
        set({ shuffledQueue: newShuffledQueue });
        nextItem = newShuffledQueue[0] || null;
    }

    if (nextItem) get().play(nextItem);
  },

  playPrev: () => {
    const { queue, shuffledQueue, currentItem, isShuffling } = get();
    const sourceQueue = isShuffling ? shuffledQueue : queue;
    const currentIndex = currentItem ? sourceQueue.findIndex((i) => i.id === currentItem.id) : -1;
    const prevItem = sourceQueue[currentIndex - 1] || null;
    if (prevItem) get().play(prevItem);
  },

  seek: (time) => {
    // In a real implementation, this would also control the <audio> or <video> element
    set({ progress: time });
  },

  updateProgress: (progress) => set({ progress }),

  setVolume: (volume) => {
    set({ volume: Math.max(0, Math.min(1, volume)), muted: volume === 0 });
  },

  toggleMute: () => set((state) => ({ muted: !state.muted })),

  setRepeatMode: (mode) => set({ repeatMode: mode }),

  toggleShuffle: () => {
      set((state) => {
          const newIsShuffling = !state.isShuffling;
          const newShuffledQueue = newIsShuffling ? shuffle(state.queue) : [];
          return { isShuffling: newIsShuffling, shuffledQueue: newShuffledQueue };
      });
  }
}));