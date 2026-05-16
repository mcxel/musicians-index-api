import { ARTIST_SEED } from "@/lib/artists/artistSeed";
import { listArtistBillboards } from "@/lib/billboards/BillboardRegistry";

export interface ArtistExposureGraph {
  artistSlug: string;
  profile: string;
  articles: string[];
  billboards: string[];
  battles: string[];
  venues: string[];
  tickets: string[];
  musicLinks: string[];
  countryHub: string;
  genreHub: string;
}

export class ArtistExposureEngine {
  static buildGraph(artistSlug: string): ArtistExposureGraph {
    const artist = ARTIST_SEED.find((item) => item.id === artistSlug);
    const billboards = listArtistBillboards(artistSlug).map((item) => `/billboards/${item.slug}`);
    const genreSlug = (artist?.genre ?? "music").toLowerCase().replace(/\s+/g, "-");

    return {
      artistSlug,
      profile: `/artists/${artistSlug}`,
      articles: [`/articles/artist/${artistSlug}`, `/articles/performer/${artistSlug}`],
      billboards,
      battles: ["/song-battle/live", "/battles/today"],
      venues: ["/venues/neon-palace", "/venues/beat-lab"],
      tickets: ["/tickets", "/events/today"],
      musicLinks: [`/artists/${artistSlug}/music`, `/artists/${artistSlug}/links`],
      countryHub: "/global/us/artists",
      genreHub: `/genres/${genreSlug}`,
    };
  }
}

export default ArtistExposureEngine;
