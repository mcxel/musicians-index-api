// apps/api/src/modules/stream-win/stream-win.controller.ts
// Stream & Win: points rewarded for platform engagement.
import { Controller, Get, Post, Body, Req } from "@nestjs/common";

export type StreamWinEventType =
  | "daily_login"         // +5 pts
  | "watched_30_min"      // +10 pts
  | "tipped_artist"       // +15 pts
  | "entered_contest"     // +20 pts
  | "completed_sponsor_task" // +25 pts  (artist only)
  | "won_contest"         // +100 pts
  | "went_live"           // +30 pts   (artist only)
  | "article_published";  // +20 pts   (artist only)

const POINTS: Record<StreamWinEventType, number> = {
  daily_login: 5,
  watched_30_min: 10,
  tipped_artist: 15,
  entered_contest: 20,
  completed_sponsor_task: 25,
  won_contest: 100,
  went_live: 30,
  article_published: 20,
};

@Controller("api/stream-win")
export class StreamWinController {
  @Get("score")
  async getScore(@Req() req: any) {
    // Returns current user's Stream & Win score
    return { weeklyScore: 0, allTimeScore: 0, rank: null, streak: 0 };
  }

  @Post("event")
  async recordEvent(@Body() body: { eventType: StreamWinEventType }, @Req() req: any) {
    const points = POINTS[body.eventType] ?? 0;
    // TODO: Add points to StreamWinScore, check for milestones
    return { pointsEarned: points, newScore: points, newStreak: 1 };
  }
}
