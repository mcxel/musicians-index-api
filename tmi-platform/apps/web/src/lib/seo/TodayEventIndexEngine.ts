import { WhatsHappeningTodayEngine } from "@/lib/events/WhatsHappeningTodayEngine";

export interface TodayEventIndex {
  whatsHappeningToday: string[];
  liveRightNow: string[];
  tonightBattles: string[];
  liveNearYou: string[];
  worldwideLiveNow: string[];
}

export class TodayEventIndexEngine {
  static build(): TodayEventIndex {
    const all = WhatsHappeningTodayEngine.listAll();
    return {
      whatsHappeningToday: all.map((event) => event.slug),
      liveRightNow: all.filter((event) => event.liveNow).map((event) => event.slug),
      tonightBattles: all.filter((event) => event.type === "battle").map((event) => event.slug),
      liveNearYou: all.filter((event) => event.country === "US").map((event) => event.slug),
      worldwideLiveNow: all.filter((event) => event.liveNow).map((event) => `${event.country}:${event.slug}`),
    };
  }
}

export default TodayEventIndexEngine;
