export interface ArticleMediaInput {
  thumbnailUrl?: string;
  videoUrl?: string;
  artistMediaUrl?: string;
  sponsorMediaUrl?: string;
}

export interface ArticleMediaResolution {
  thumbnailUrl: string;
  videoUrl?: string;
  ownership: "article-owned" | "sponsor-owned";
}

const ARTICLE_FALLBACK = "/tmi-curated/mag-35.jpg";

class ArticleMediaResolver {
  resolve(input: ArticleMediaInput): ArticleMediaResolution {
    if (input.thumbnailUrl) {
      return {
        thumbnailUrl: input.thumbnailUrl,
        videoUrl: input.videoUrl,
        ownership: "article-owned",
      };
    }

    if (input.artistMediaUrl) {
      return {
        thumbnailUrl: input.artistMediaUrl,
        videoUrl: input.videoUrl,
        ownership: "article-owned",
      };
    }

    if (input.sponsorMediaUrl) {
      return {
        thumbnailUrl: input.sponsorMediaUrl,
        ownership: "sponsor-owned",
      };
    }

    return {
      thumbnailUrl: ARTICLE_FALLBACK,
      ownership: "article-owned",
    };
  }
}

export const articleMediaResolver = new ArticleMediaResolver();
