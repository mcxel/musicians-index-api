export type FeedMode = "live" | "simulated";

export type FeedIndicator = {
  id: string;
  mode: FeedMode;
  label: string;
  source: string;
  updatedAt: number;
};

export function createFeedIndicator(id: string, mode: FeedMode, source: string): FeedIndicator {
  return {
    id,
    mode,
    label: mode === "live" ? "LIVE" : "SIMULATED",
    source,
    updatedAt: Date.now(),
  };
}

export function isLiveFeed(indicator: FeedIndicator): boolean {
  return indicator.mode === "live";
}
