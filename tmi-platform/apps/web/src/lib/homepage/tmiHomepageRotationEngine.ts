import type { HomepageFeedItem } from "./tmiHomepageOverlayFeedEngine";

export type RotationState = {
  currentIndex: number;
  currentGenre: string;
  history: string[];
};

const GENRE_POOL = ["hip-hop", "electronic", "rock", "pop", "rnb", "jazz", "gospel", "country", "producer", "dj", "cypher"];

export function nextRotation(feed: HomepageFeedItem[], state: RotationState): RotationState {
  if (!feed.length) return state;
  const nextIndex = pickNonDuplicateIndex(feed, state.currentIndex);
  const nextGenre = pickNonDuplicateGenre(state.currentGenre);
  const nextId = feed[nextIndex]?.id ?? feed[0].id;
  return {
    currentIndex: nextIndex,
    currentGenre: nextGenre,
    history: [...state.history.slice(-24), nextId],
  };
}

function pickNonDuplicateIndex(feed: HomepageFeedItem[], currentIndex: number) {
  if (feed.length <= 1) return 0;
  let idx = currentIndex;
  while (idx === currentIndex) idx = Math.floor(Math.random() * feed.length);
  return idx;
}

function pickNonDuplicateGenre(current: string) {
  const options = GENRE_POOL.filter((g) => g !== current);
  return options[Math.floor(Math.random() * options.length)] ?? GENRE_POOL[0];
}
