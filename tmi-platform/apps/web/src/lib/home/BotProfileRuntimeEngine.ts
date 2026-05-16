import { resolveProfileMediaPriority } from "./ProfileMediaPriorityResolver";
import { getBotIdentityProfiles, type BotIdentityProfile } from "./BotIdentityRegistry";

export interface BotProfileRuntimeRecord extends BotIdentityProfile {
  mediaSource: "motion-clip" | "live-clip" | "cover-frame" | "fallback-still" | "missing";
  resolvedMediaUrl: string;
  coverFrameUrl: string;
  canAnimate: boolean;
}

export function getBotProfileRuntimeProfiles(): BotProfileRuntimeRecord[] {
  return getBotIdentityProfiles().map((profile) => {
    const media = resolveProfileMediaPriority({
      motionClip: profile.motionClip,
      liveClip: profile.liveClip,
      coverFrame: profile.coverFrame ?? profile.profileImage,
      fallbackStill: profile.profileImage,
    });

    return {
      ...profile,
      mediaSource: media.sourceType,
      resolvedMediaUrl: media.resolvedSrc,
      coverFrameUrl: media.coverFrame,
      canAnimate: media.canAnimate,
    };
  });
}
