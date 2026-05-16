const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function formatCountdownMs(ms: number): string {
  if (ms <= 0) return "00:00:00";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

export function formatWeekdayTime(date: Date): string {
  const day = DAY_NAMES[date.getDay()] ?? "Sunday";
  const rawHour = date.getHours();
  const minute = date.getMinutes().toString().padStart(2, "0");
  const ampm = rawHour >= 12 ? "PM" : "AM";
  const hour12 = rawHour % 12 || 12;
  return `${day} ${hour12}:${minute} ${ampm}`;
}

export function resolveEventCountdownStatus(args: {
  now: Date;
  startsAt: Date;
  endsAt: Date;
  label: string;
}): string {
  const { now, startsAt, endsAt, label } = args;
  if (now >= startsAt && now < endsAt) return "LIVE NOW";
  if (now < startsAt) return `STARTS IN ${formatCountdownMs(startsAt.getTime() - now.getTime())}`;
  return `NEXT ${label.toUpperCase()}: ${formatWeekdayTime(startsAt)}`;
}
