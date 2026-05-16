export type TmiGenreClusterKey =
  | "crown-risers"
  | "cypher-voltage"
  | "live-spotlight"
  | "global-fusion"
  | "market-bounce";

export type TmiGenreCluster = {
  key: TmiGenreClusterKey;
  label: string;
  genres: string[];
};

const CLUSTERS: TmiGenreCluster[] = [
  { key: "crown-risers", label: "Crown Risers", genres: ["hip-hop", "rnb", "neo-soul"] },
  { key: "cypher-voltage", label: "Cypher Voltage", genres: ["drill", "trap", "boom-bap"] },
  { key: "live-spotlight", label: "Live Spotlight", genres: ["rock", "indie", "alt-pop"] },
  { key: "global-fusion", label: "Global Fusion", genres: ["afrobeats", "latin", "dancehall"] },
  { key: "market-bounce", label: "Market Bounce", genres: ["edm", "house", "phonk"] },
];

function indexForStep(step: number): number {
  const n = CLUSTERS.length;
  const i = Math.abs(step) % n;
  return i;
}

export function getInitialGenreCluster(): TmiGenreCluster {
  return CLUSTERS[0];
}

export function getNextGenreCluster(previousKey: TmiGenreClusterKey | null, step: number): TmiGenreCluster {
  const n = CLUSTERS.length;
  let nextIndex = indexForStep(step + 1);
  if (previousKey) {
    const previousIndex = CLUSTERS.findIndex((cluster) => cluster.key === previousKey);
    if (previousIndex >= 0 && previousIndex === nextIndex) {
      nextIndex = (nextIndex + 1) % n;
    }
  }
  return CLUSTERS[nextIndex];
}
