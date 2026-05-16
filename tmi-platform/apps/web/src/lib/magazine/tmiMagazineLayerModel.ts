export type TmiMagazineVisualState = "closedIdle" | "searchTransition" | "openIdle";

export type TmiMagazineLayerKey =
  | "baseStage"
  | "background"
  | "underlay"
  | "bookShell"
  | "pageSkeleton"
  | "content"
  | "overlay"
  | "interaction";

export type TmiMagazineLayerSpec = {
  key: TmiMagazineLayerKey;
  zIndex: number;
  description: string;
};

export const TMI_MAGAZINE_LAYER_STACK: TmiMagazineLayerSpec[] = [
  { key: "baseStage", zIndex: 0, description: "Base stage scene" },
  { key: "background", zIndex: 2, description: "1980s neon geometric background" },
  { key: "underlay", zIndex: 8, description: "Shadows, washes, textures, and depth underlays" },
  { key: "bookShell", zIndex: 16, description: "Book shell with spine, thickness, and depth" },
  { key: "pageSkeleton", zIndex: 24, description: "Left/right page color skeleton surfaces" },
  { key: "content", zIndex: 32, description: "Content cards, slots, and controls" },
  { key: "overlay", zIndex: 40, description: "Glow frames, badges, highlights, motion trails" },
  { key: "interaction", zIndex: 50, description: "Interaction hit-zones and drag/peel guides" },
];

export const TMI_MAGAZINE_IDLE_TIMERS_MS = {
  closedIdleDuration: 30_000,
  searchMinDuration: 1_000,
  searchMaxDuration: 3_000,
};

export function getRandomSearchDurationMs(): number {
  const { searchMinDuration, searchMaxDuration } = TMI_MAGAZINE_IDLE_TIMERS_MS;
  return Math.floor(searchMinDuration + Math.random() * (searchMaxDuration - searchMinDuration));
}
