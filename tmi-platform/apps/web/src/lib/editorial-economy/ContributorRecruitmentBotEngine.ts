import { artistDiscoveryBotEngine } from "@/lib/editorial-economy/ArtistDiscoveryBotEngine";

export interface ContributorRecruitmentLead {
  handle: string;
  specialty: "news" | "artist" | "battle" | "sponsor";
  confidence: number;
  contactRoute: string;
}

class ContributorRecruitmentBotEngine {
  suggestLeads(limit = 6): ContributorRecruitmentLead[] {
    const artists = artistDiscoveryBotEngine.recommend(limit);
    return artists.map((artist, index) => ({
      handle: `${artist.name} Correspondent`,
      specialty: index % 4 === 0 ? "artist" : index % 4 === 1 ? "news" : index % 4 === 2 ? "battle" : "sponsor",
      confidence: Math.max(55, artist.score - 10),
      contactRoute: `/artists/${artist.artistId}`,
    }));
  }
}

export const contributorRecruitmentBotEngine = new ContributorRecruitmentBotEngine();
