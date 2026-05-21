// apps/api/src/modules/home-composition/home-composition.controller.ts
// Returns the belt config that HomeSectionRenderer reads.
import { Controller, Get } from "@nestjs/common";

@Controller("api/home")
export class HomeCompositionController {
  @Get("composition")
  async getComposition() {
    // Returns belt stack for the homepage renderer.
    // Bots (homepage-rotation-bot, cover-generator-bot, etc.) write to this data.
    return {
      belts: [
        { id: "BELT_COVER",      label: "Cover",      refreshMinutes: 10080, botOwner: "cover-generator" },
        { id: "BELT_LIVE_WORLD", label: "Live World", refreshMinutes: 1,     botOwner: "lobby-assembly", realtimeSort: "viewers_asc" },
        { id: "BELT_EDITORIAL",  label: "Editorial",  refreshMinutes: 30,    botOwner: "editorial-assembly" },
        { id: "BELT_DISCOVERY",  label: "Discovery",  refreshMinutes: 60,    botOwner: "recommendation" },
        { id: "BELT_TRENDS",     label: "Trends",     refreshMinutes: 15,    botOwner: "trending" },
        { id: "BELT_MARKETPLACE",label: "Marketplace",refreshMinutes: 240,   botOwner: "none" },
        { id: "BELT_ADVERTISER", label: "Advertiser", refreshMinutes: 60,    botOwner: "ad-rotation" },
      ],
      worldPremiere: null,  // set by events-bot when a scheduled drop exists
      currentCrown: null,   // set by ranking-bot after weekly cypher
    };
  }
}
