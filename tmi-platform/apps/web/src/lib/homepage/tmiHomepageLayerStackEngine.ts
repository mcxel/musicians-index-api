export type TmiHomepageLayerKey =
  | "background"
  | "rear-overlay"
  | "media"
  | "magazine-shell"
  | "front-overlay"
  | "top-nav"
  | "live-accents";

export type TmiHomepageLayerEntry = {
  key: TmiHomepageLayerKey;
  zIndex: number;
  interactive: boolean;
};

export const HOMEPAGE_LAYER_STACK: TmiHomepageLayerEntry[] = [
  { key: "background", zIndex: 1, interactive: false },
  { key: "rear-overlay", zIndex: 2, interactive: false },
  { key: "media", zIndex: 3, interactive: true },
  { key: "magazine-shell", zIndex: 4, interactive: true },
  { key: "front-overlay", zIndex: 5, interactive: true },
  { key: "top-nav", zIndex: 6, interactive: true },
  { key: "live-accents", zIndex: 7, interactive: true }
];

export function listHomepageLayerStack(): TmiHomepageLayerEntry[] {
  return HOMEPAGE_LAYER_STACK;
}
