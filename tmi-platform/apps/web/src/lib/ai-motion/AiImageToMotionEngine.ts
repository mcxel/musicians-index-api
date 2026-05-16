import { createMotion, type MotionCreateResult } from "./AiMotionCreatorEngine";

export type ImageToMotionSubjectType =
  | "artist-image"
  | "host-image"
  | "venue-image"
  | "billboard-image"
  | "battle-poster"
  | "ticket-art"
  | "nft-art";

export function convertImageToMotionLoop(input: {
  imageRef: string;
  subjectType: ImageToMotionSubjectType;
  ownerSystem: string;
  route: string;
  durationSeconds: number;
}): MotionCreateResult {
  return createMotion({
    motionType:
      input.subjectType === "host-image"
        ? "host-idle"
        : input.subjectType === "venue-image"
        ? "venue-loop"
        : input.subjectType === "billboard-image"
        ? "billboard-loop"
        : input.subjectType === "battle-poster"
        ? "battle-loop"
        : input.subjectType === "ticket-art"
        ? "ticket-loop"
        : input.subjectType === "nft-art"
        ? "nft-loop"
        : "avatar-loop",
    subject: input.subjectType,
    durationSeconds: input.durationSeconds,
    sourceAssetRef: input.imageRef,
    ownerSystem: input.ownerSystem,
    route: input.route,
  });
}
