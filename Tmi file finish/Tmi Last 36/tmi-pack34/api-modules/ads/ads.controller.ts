// apps/api/src/modules/monetization/ads.controller.ts
// Platform Law #7: GET /api/ads/slot/:id ALWAYS returns 200 — never blank.
import { Controller, Get, Param } from "@nestjs/common";

@Controller("api/ads")
export class AdsController {
  @Get("slot/:slotId")
  async getSlot(@Param("slotId") slotId: string) {
    // 1. Try to find a paid AdSlotReservation for this slot
    // 2. If found + active → return paid creative
    // 3. If not found → return house ad fallback (NEVER return empty)
    // 4. Always HTTP 200
    return {
      slotId,
      type: "house",  // "paid" | "sponsor" | "house"
      creative: {
        type: "house",
        headline: "Advertise on TMI",
        subHeadline: "Reach music fans from $9.99/week",
        ctaLabel: "See Packages",
        ctaUrl: "/advertise/packages",
      },
      disclosure: null,
      impressionId: `imp_${Date.now()}`,
    };
  }

  @Get("slot/:slotId/impression/:impressionId")
  async trackImpression(@Param("slotId") slotId: string, @Param("impressionId") impressionId: string) {
    // TODO: Record impression in AdImpression table
    return { tracked: true };
  }
}
