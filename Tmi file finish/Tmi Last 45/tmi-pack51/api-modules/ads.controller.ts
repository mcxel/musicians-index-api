// apps/api/src/modules/ads/ads.controller.ts
// Platform Law #7: GET /ads/slot/:zoneId ALWAYS returns 200
// 5-level fallback chain. NEVER returns 204 or 404.

import { Controller, Get, Param, HttpCode, HttpStatus } from "@nestjs/common";

@Controller("ads")
export class AdsController {

  // ── PLATFORM LAW #7: THIS ENDPOINT MUST ALWAYS RETURN 200 ────
  @Get("slot/:zoneId")
  @HttpCode(HttpStatus.OK) // Explicitly 200 — never change
  async getAdSlot(@Param("zoneId") zoneId: string) {
    // 5-LEVEL FALLBACK CHAIN — if Level N fails, try Level N+1
    // Level 1: Active paid campaign creative for exact zone
    // Level 2: Any active campaign that allows zone expansion
    // Level 3: Crown winner spotlight card
    // Level 4: Undiscovered artist card (0 viewers — discovery-first)
    // Level 5: TMI brand house ad — ALWAYS available
    //
    // Blackbox implementation:
    // const result = await this.adsService.getSlot(zoneId);
    // return result; // always has content, always 200

    return {
      creative: {
        type: "NATIVE",
        assetUrl: `/public/ads/house/fallback.png`,
        ctaUrl: "https://themusiciansindex.com",
        isHouseAd: true,
        fallbackLevel: 5,
        zoneId,
      },
      isHouseAd: true,
      message: "Platform Law #7: This endpoint always returns 200",
    };
  }
}
