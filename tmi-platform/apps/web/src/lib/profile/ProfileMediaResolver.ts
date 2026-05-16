import { resolveProfileMediaPriority } from "@/lib/home/ProfileMediaPriorityResolver";

export function resolveProfileMedia(input: {
  motionClip?: string;
  liveClip?: string;
  coverFrame?: string;
  fallbackStill?: string;
}) {
  return resolveProfileMediaPriority(input);
}
