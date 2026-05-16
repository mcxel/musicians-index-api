import { formatCountdownMs } from "@/lib/live/CountdownResolver";

export type RoomQueueEntry = {
  id: string;
  title: string;
  startsAt: Date;
  occupancy: number;
  availableSpots: number;
  status: "live" | "starting-soon" | "queued";
};

export function buildNextRoomQueue(args: {
  now: Date;
  baseTitle: string;
  offsetsMinutes?: number[];
}): RoomQueueEntry[] {
  const { now, baseTitle, offsetsMinutes = [0, 12, 28, 60] } = args;

  return offsetsMinutes.map((offset, index) => {
    const startsAt = new Date(now.getTime() + offset * 60 * 1000);
    const availableSpots = Math.max(2, 18 - index * 3);
    const occupancy = 100 - Math.round((availableSpots / 18) * 100);
    return {
      id: `${baseTitle.toLowerCase().replace(/\s+/g, "-")}-${index + 1}`,
      title: `${baseTitle} Room ${String.fromCharCode(65 + index)}`,
      startsAt,
      occupancy,
      availableSpots,
      status: offset === 0 ? "live" : offset <= 15 ? "starting-soon" : "queued",
    };
  });
}

export function resolveRoomRestartLabel(now: Date, restartAt: Date): string {
  return `This room restarts in ${formatCountdownMs(restartAt.getTime() - now.getTime())}`;
}
