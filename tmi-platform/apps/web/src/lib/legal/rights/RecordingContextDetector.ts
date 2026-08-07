/**
 * RecordingContextDetector — detects USER RECORDING/BROADCASTING + freestyle + background music.
 */

import type { RecordingContext, MediaSurface } from "./types";

export function detectRecordingContext(input: {
  userRecordingOrBroadcasting?: boolean;
  freestyleActive?: boolean;
  backgroundMusicAssetId?: string | null;
  surface?: MediaSurface;
  roomId?: string;
}): RecordingContext {
  return {
    userRecordingOrBroadcasting: Boolean(input.userRecordingOrBroadcasting),
    freestyleActive: Boolean(input.freestyleActive),
    backgroundMusicAssetId: input.backgroundMusicAssetId ?? null,
    surface: input.surface ?? "LIVE",
    roomId: input.roomId,
  };
}

/**
 * When USER RECORDING/BROADCASTING + NO FREESTYLE ACTIVE + BACKGROUND MUSIC
 * → Creator Safe Mode decision path applies to the recording mix.
 */
export function shouldApplyCreatorRecordingSplit(ctx: RecordingContext): boolean {
  return (
    ctx.userRecordingOrBroadcasting &&
    !ctx.freestyleActive &&
    Boolean(ctx.backgroundMusicAssetId)
  );
}
