import { ARTIST_SEED } from "@/lib/artists/artistSeed";

export interface ArtistCoverageCandidate {
  artistId: string;
  name: string;
  genre: string;
  score: number;
  reason: string;
}

class ArtistDiscoveryBotEngine {
  recommend(limit = 5): ArtistCoverageCandidate[] {
    return ARTIST_SEED.slice(0, limit).map((artist, index) => ({
      artistId: artist.id,
      name: artist.name,
      genre: artist.genre,
      score: Math.max(40, 95 - index * 7),
      reason: index % 2 === 0 ? "high-audience-growth" : "fresh-release-window",
    }));
  }
}

export const artistDiscoveryBotEngine = new ArtistDiscoveryBotEngine();
