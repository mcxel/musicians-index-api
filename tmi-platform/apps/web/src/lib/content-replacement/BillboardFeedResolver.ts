export interface BillboardFeedInput {
  roomFeedUrl?: string;
  performerFeedUrl?: string;
  sponsorVideoUrl?: string;
  articleMediaUrl?: string;
}

export interface BillboardFeedResolution {
  mediaUrl: string;
  mediaType: "live-feed" | "sponsor-video" | "article-media" | "fallback";
}

const BILLBOARD_FALLBACK = "/tmi-curated/mag-82.jpg";

class BillboardFeedResolver {
  resolve(input: BillboardFeedInput): BillboardFeedResolution {
    if (input.roomFeedUrl) {
      return { mediaUrl: input.roomFeedUrl, mediaType: "live-feed" };
    }
    if (input.performerFeedUrl) {
      return { mediaUrl: input.performerFeedUrl, mediaType: "live-feed" };
    }
    if (input.sponsorVideoUrl) {
      return { mediaUrl: input.sponsorVideoUrl, mediaType: "sponsor-video" };
    }
    if (input.articleMediaUrl) {
      return { mediaUrl: input.articleMediaUrl, mediaType: "article-media" };
    }
    return { mediaUrl: BILLBOARD_FALLBACK, mediaType: "fallback" };
  }
}

export const billboardFeedResolver = new BillboardFeedResolver();
