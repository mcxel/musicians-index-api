import { create } from "zustand";
import { MediaItem } from "@/lib/media/media";

interface GlobalMediaStore {
  queue: MediaItem[];
  currentItem: MediaItem | null;
  isPlaying: boolean;
  progress: number;
  duration: number;

  // Actions
  loadQueue: (items: MediaItem[], startPlaying?: boolean) => void;
  play: (item?: MediaItem) => void;
  pause: () => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (time: number) => void;
  updateProgress: (progress: number) => void;
}

export const useGlobalMediaStore = create<GlobalMediaStore>((set, get) => ({
  queue: [],
  currentItem: null,
  isPlaying: false,
  progress: 0,
  duration: 0,

  loadQueue: (items, startPlaying = true) => {
    set({ queue: items, currentItem: items[0] || null });
    if (startPlaying && items.length > 0) {
      get().play(items[0]);
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
    const { queue, currentItem } = get();
    const currentIndex = currentItem ? queue.findIndex((i) => i.id === currentItem.id) : -1;
    const nextItem = queue[currentIndex + 1] || null; // Or loop to queue[0]
    if (nextItem) get().play(nextItem);
  },

  playPrev: () => {
    const { queue, currentItem } = get();
    const currentIndex = currentItem ? queue.findIndex((i) => i.id === currentItem.id) : -1;
    const prevItem = queue[currentIndex - 1] || null;
    if (prevItem) get().play(prevItem);
  },

  seek: (time) => {
    // In a real implementation, this would also control the <audio> or <video> element
    set({ progress: time });
  },

  updateProgress: (progress) => set({ progress }),
}));