import {
  motionPortraitEngine,
  type MotionPortraitResolution,
} from "./MotionPortraitEngine";

export interface ArtistMotionResolverInput {
  artistId: string;
  liveFeedUrl?: string;
  profileImageUrl?: string;
  fallbackImageUrl?: string;
}

export function resolveArtistMotion(
  input: ArtistMotionResolverInput,
): MotionPortraitResolution {
  return motionPortraitEngine.resolve(input.artistId, {
    liveFeedUrl: input.liveFeedUrl,
    profileImageUrl: input.profileImageUrl,
    fallbackImageUrl: input.fallbackImageUrl,
  });
}