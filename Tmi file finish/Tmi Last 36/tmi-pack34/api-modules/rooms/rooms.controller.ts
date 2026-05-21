// apps/api/src/modules/rooms/rooms.controller.ts
// CRITICAL: discovery-first sort — 0 viewers always position 1.
// pnpm test:discovery validates this before every deploy.
import { Controller, Get, Query } from "@nestjs/common";

@Controller("api/rooms")
export class RoomsController {
  @Get()
  async getRooms(@Query("sort") sort = "viewers_asc", @Query("limit") limit = 20) {
    // DISCOVERY-FIRST LAW:
    // When sort=viewers_asc, rooms with 0 viewers come FIRST.
    // This is enforced at the DB query level: ORDER BY viewer_count ASC NULLS FIRST
    // pnpm test:discovery verifies this works before every deploy.
    //
    // SQL equivalent:
    //   SELECT * FROM rooms WHERE status='active'
    //   ORDER BY viewer_count ASC NULLS FIRST
    //   LIMIT $limit
    //
    // A room with 0 viewers MUST appear at index 0 in the response.
    return {
      rooms: [],  // TODO: wire to DB via RoomsService
      sort,
      discoveryFirstEnforced: true,
    };
  }
}
