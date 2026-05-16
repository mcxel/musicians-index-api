import {
  getInitialGenreCluster,
  getNextGenreCluster,
  type TmiGenreCluster,
} from "@/lib/homepage/tmiGenreRotationEngine";

export type TmiRankingDirection = "UP" | "DOWN";

export type TmiRankingArtist = {
  id: string;
  stageName: string;
  genre: string;
  rank: number;
  previousRank: number;
  direction: TmiRankingDirection;
  delta: number;
  profileRoute: string;
  articleRoute: string;
  hubRoute: string;
  backRoute: string;
  status: "ACTIVE" | "LOCKED" | "NEEDS_SETUP";
  stillSrc?: string;
  motionSrc?: string;
};

export type TmiRankingMotionState = {
  cycle: number;
  genreCluster: TmiGenreCluster;
  artists: TmiRankingArtist[];
};

const NAME_POOL: Record<string, string[]> = {
  "hip-hop": ["Big Ace", "Nia Flow", "Jet Seven", "Mox Crown"],
  rnb: ["Lena Vox", "Rae Light", "Nova Silk", "Mira Keys"],
  "neo-soul": ["Sage Gold", "Ari Flint", "Kilo Sun", "Dove Lane"],
  drill: ["Rex Volt", "Kane Dust", "Zio Lane", "Tru Echo"],
  trap: ["Dax Ember", "Rin Byte", "Mika Crown", "Vell Arc"],
  "boom-bap": ["Roy Slice", "Nox Verse", "Jae Script", "Kori Tape"],
  rock: ["Atlas Riot", "Mono Peak", "Rift North", "Zed Halo"],
  indie: ["June Vale", "Milo Drift", "Kara Mint", "Lio Crest"],
  "alt-pop": ["Tala Neon", "Ivy Echo", "Koa Spark", "Arlo Prism"],
  afrobeats: ["Kemi Pulse", "Soro Wave", "Mina Gold", "Toni Rise"],
  latin: ["Rio Luna", "Mara Sol", "Niko Vale", "Javi Ray"],
  dancehall: ["King Vibe", "Rae Vyx", "Luma Fire", "Nox Tide"],
  edm: ["Pulse XR", "Nova Grid", "Dio Flux", "Kite Amp"],
  house: ["Mira Tone", "Rex Loop", "Ari Deck", "Keen Bass"],
  phonk: ["Shade 808", "Vant Smoke", "Ruin Night", "Moss Drift"],
};

function pickName(genre: string, offset: number): string {
  const pool = NAME_POOL[genre] ?? ["Artist One", "Artist Two", "Artist Three", "Artist Four"];
  return pool[offset % pool.length];
}

function buildArtist(genre: string, index: number, cycle: number): TmiRankingArtist {
  const rising = index < 2;
  const delta = rising ? 2 - index : index - 1;
  const rank = index + 1;
  const previousRank = rising ? rank + delta : rank - delta;
  const slugBase = pickName(genre, cycle + index).toLowerCase().replace(/\s+/g, "-");

  return {
    id: `home12-${cycle}-${index}`,
    stageName: pickName(genre, cycle + index),
    genre,
    rank,
    previousRank,
    direction: rising ? "UP" : "DOWN",
    delta,
    profileRoute: `/artist/${slugBase}`,
    articleRoute: `/articles/${slugBase}-feature`,
    hubRoute: "/hub/artist",
    backRoute: "/home/1-2",
    status: "ACTIVE",
    // Keep media disabled in investor runtime until assets are provisioned.
    stillSrc: undefined,
    motionSrc: undefined,
  };
}

function buildArtistsForCluster(cluster: TmiGenreCluster, cycle: number): TmiRankingArtist[] {
  return new Array(4).fill(0).map((_, index) => {
    const genre = cluster.genres[index % cluster.genres.length];
    return buildArtist(genre, index, cycle);
  });
}

export function createInitialRankingMotionState(): TmiRankingMotionState {
  const cluster = getInitialGenreCluster();
  return {
    cycle: 0,
    genreCluster: cluster,
    artists: buildArtistsForCluster(cluster, 0),
  };
}

export function buildNextRankingMotionState(previous: TmiRankingMotionState): TmiRankingMotionState {
  const cycle = previous.cycle + 1;
  const cluster = getNextGenreCluster(previous.genreCluster.key, cycle);
  return {
    cycle,
    genreCluster: cluster,
    artists: buildArtistsForCluster(cluster, cycle),
  };
}
