import { listArtistBillboards } from "@/lib/billboards/BillboardRegistry";
import { ArtistExposureEngine } from "@/lib/promotion/ArtistExposureEngine";

export interface PromotionCrossLinks {
  artist: string;
  article: string;
  event: string;
  venue: string;
  sponsor?: string;
  ticket: string;
  shareCard?: string;
}

export class CrossLinkPromotionEngine {
  static forArtist(artistSlug: string): PromotionCrossLinks[] {
    const exposure = ArtistExposureEngine.buildGraph(artistSlug);
    const billboards = listArtistBillboards(artistSlug);

    return billboards.map((billboard, index) => ({
      artist: exposure.profile,
      article: exposure.articles[index % exposure.articles.length] ?? `/articles/artist/${artistSlug}`,
      event: billboard.linkedEventSlug ? `/events/${billboard.linkedEventSlug}` : "/events/today",
      venue: billboard.linkedVenueSlug ? `/venues/${billboard.linkedVenueSlug}` : "/venues/neon-palace",
      sponsor: billboard.sponsorId ? `/sponsors/${billboard.sponsorId}` : undefined,
      ticket: "/tickets",
      shareCard: `/billboards/${billboard.slug}`,
    }));
  }
}

export default CrossLinkPromotionEngine;
