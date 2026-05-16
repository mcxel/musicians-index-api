export interface ProfileMediaPriorityInput {
  motionClip?: string;
  liveClip?: string;
  coverFrame?: string;
  fallbackStill?: string;
}

export interface ProfileMediaPriorityResolution {
  resolvedSrc: string;
  sourceType: "motion-clip" | "live-clip" | "cover-frame" | "fallback-still" | "missing";
  motionClip?: string;
  liveClip?: string;
  coverFrame: string;
  fallbackStill: string;
  canAnimate: boolean;
}

export function resolveProfileMediaPriority(input: ProfileMediaPriorityInput): ProfileMediaPriorityResolution {
  const fallbackStill = input.fallbackStill ?? input.coverFrame ?? "";
  const coverFrame = input.coverFrame ?? fallbackStill;

  if (input.motionClip) {
    return {
      resolvedSrc: input.motionClip,
      sourceType: "motion-clip",
      motionClip: input.motionClip,
      liveClip: input.liveClip,
      coverFrame,
      fallbackStill,
      canAnimate: true,
    };
  }

  if (input.liveClip) {
    return {
      resolvedSrc: input.liveClip,
      sourceType: "live-clip",
      motionClip: input.motionClip,
      liveClip: input.liveClip,
      coverFrame,
      fallbackStill,
      canAnimate: true,
    };
  }

  if (coverFrame) {
    return {
      resolvedSrc: coverFrame,
      sourceType: "cover-frame",
      motionClip: input.motionClip,
      liveClip: input.liveClip,
      coverFrame,
      fallbackStill,
      canAnimate: false,
    };
  }

  if (fallbackStill) {
    return {
      resolvedSrc: fallbackStill,
      sourceType: "fallback-still",
      motionClip: input.motionClip,
      liveClip: input.liveClip,
      coverFrame,
      fallbackStill,
      canAnimate: false,
    };
  }

  return {
    resolvedSrc: "",
    sourceType: "missing",
    motionClip: input.motionClip,
    liveClip: input.liveClip,
    coverFrame: "",
    fallbackStill: "",
    canAnimate: false,
  };
}
