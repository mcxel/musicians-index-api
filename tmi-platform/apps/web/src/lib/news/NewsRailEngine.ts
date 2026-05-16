// ─── Types ────────────────────────────────────────────────────────────────────

export type NewsStory = {
  id: string;
  headline: string;
  snippet: string;
  category: "artist" | "event" | "platform" | "sponsor" | "contest" | "release";
  href: string;
  imageUrl?: string;
  publishedAtMs: number;
  pinned?: boolean;
  sponsorId?: string;
  sponsorLabel?: string;
};

export type NewsRailState = {
  stories: NewsStory[];
  activeIndex: number;
  lastRotatedMs: number;
  rotationIntervalMs: number;
};

// ─── Registry ─────────────────────────────────────────────────────────────────

const railRegistry = new Map<string, NewsRailState>();
let _counter = 0;

const DEFAULT_ROTATION_MS = 8_000;

function getOrInit(railId: string): NewsRailState {
  if (!railRegistry.has(railId)) {
    railRegistry.set(railId, {
      stories: [],
      activeIndex: 0,
      lastRotatedMs: Date.now(),
      rotationIntervalMs: DEFAULT_ROTATION_MS,
    });
  }
  return railRegistry.get(railId)!;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function addNewsStory(railId: string, story: Omit<NewsStory, "id">): NewsStory {
  const state = getOrInit(railId);
  const full: NewsStory = { id: `story-${++_counter}`, ...story };

  // Pinned stories go first
  if (full.pinned) {
    state.stories.unshift(full);
  } else {
    state.stories.push(full);
  }

  // Sponsor insertions land at every 5th position
  if (full.sponsorId) {
    const sponsorSlot = Math.floor(state.stories.length / 5) * 5;
    const current = state.stories.indexOf(full);
    if (current !== sponsorSlot) {
      state.stories.splice(current, 1);
      state.stories.splice(sponsorSlot, 0, full);
    }
  }

  return full;
}

export function getNewsRailStories(railId: string, limit: number = 20): NewsStory[] {
  return getOrInit(railId).stories.slice(0, limit);
}

export function tickNewsRail(railId: string): NewsStory | null {
  const state = getOrInit(railId);
  if (state.stories.length === 0) return null;

  const now = Date.now();
  if (now - state.lastRotatedMs >= state.rotationIntervalMs) {
    state.activeIndex = (state.activeIndex + 1) % state.stories.length;
    state.lastRotatedMs = now;
  }

  return state.stories[state.activeIndex];
}

export function getActiveNewsStory(railId: string): NewsStory | null {
  const state = getOrInit(railId);
  return state.stories[state.activeIndex] ?? null;
}

export function setRailRotationInterval(railId: string, ms: number): void {
  getOrInit(railId).rotationIntervalMs = Math.max(1000, ms);
}

export function removeNewsStory(railId: string, storyId: string): void {
  const state = getOrInit(railId);
  const idx = state.stories.findIndex(s => s.id === storyId);
  if (idx >= 0) {
    state.stories.splice(idx, 1);
    state.activeIndex = Math.min(state.activeIndex, Math.max(0, state.stories.length - 1));
  }
}
