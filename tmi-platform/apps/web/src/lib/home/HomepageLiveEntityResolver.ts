import { getBotProfileRuntimeProfiles } from "./BotProfileRuntimeEngine";
import { getCrownRankRuntime } from "./CrownRankRuntime";
import { composeLiveMagazineCover } from "./LiveMagazineCoverComposer";
import { getOrbitArtistRotation } from "./OrbitArtistRotationEngine";
import { getWinnerEntityRuntime } from "./WinnerEntityRuntime";

export interface HomepageLiveEntitySnapshot {
  winner: ReturnType<typeof getWinnerEntityRuntime>;
  crownRanks: ReturnType<typeof getCrownRankRuntime>;
  orbitArtists: ReturnType<typeof getOrbitArtistRotation>;
  cover: ReturnType<typeof composeLiveMagazineCover>;
  bots: ReturnType<typeof getBotProfileRuntimeProfiles>;
}

export function getHomepageLiveEntitySnapshot(): HomepageLiveEntitySnapshot {
  return {
    winner: getWinnerEntityRuntime(),
    crownRanks: getCrownRankRuntime(),
    orbitArtists: getOrbitArtistRotation(),
    cover: composeLiveMagazineCover(),
    bots: getBotProfileRuntimeProfiles(),
  };
}