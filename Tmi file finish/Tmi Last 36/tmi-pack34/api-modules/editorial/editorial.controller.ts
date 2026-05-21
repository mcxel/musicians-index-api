// apps/api/src/modules/editorial/editorial.controller.ts
import { Controller, Get, Param, Query } from "@nestjs/common";

@Controller("api/editorial")
export class EditorialController {
  @Get()
  async getArticles(
    @Query("category") category?: string,
    @Query("featured") featured?: string,
    @Query("limit") limit = 10,
    @Query("maxAgeHours") maxAgeHours?: number,
  ) {
    // Returns articles for magazine belts.
    // featured=true → only editorial picks (for magazine entry scene)
    // category=music_news → news billboard items
    // maxAgeHours=2 → for headline ticker (only last 2 hours)
    return { articles: [], total: 0 };
  }

  @Get(":slug")
  async getArticle(@Param("slug") slug: string) {
    // IMPORTANT: response must include author.stationSlug
    // so the article page can render the station link.
    return {
      article: null,
      author: {
        displayName: null,
        profileSlug: null,
        stationSlug: null,  // used by article page for "📻 VIEW STATION" link
      },
    };
  }
}
