export interface LiveMediaInput {
  streamUrl?: string;
  motionPortraitUrl?: string;
  profileImageUrl?: string;
}

export interface LiveMediaResolution {
  resolvedUrl: string;
  sourceType: "live-feed" | "motion-portrait" | "profile-image" | "fallback";
}

const FALLBACK_MEDIA = "/tmi-curated/host-main.png";

class LiveMediaResolver {
  resolveArtist(input: LiveMediaInput): LiveMediaResolution {
    if (input.streamUrl) {
      return { resolvedUrl: input.streamUrl, sourceType: "live-feed" };
    }
    if (input.motionPortraitUrl) {
      return { resolvedUrl: input.motionPortraitUrl, sourceType: "motion-portrait" };
    }
    if (input.profileImageUrl) {
      return { resolvedUrl: input.profileImageUrl, sourceType: "profile-image" };
    }
    return { resolvedUrl: FALLBACK_MEDIA, sourceType: "fallback" };
  }
}

export const liveMediaResolver = new LiveMediaResolver();
