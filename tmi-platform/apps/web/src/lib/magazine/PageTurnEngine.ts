export type PageTurnMode = "opening" | "turning";
export type PageTurnDirection = "forward" | "backward";
export type PageFlipPhase = "accelerate" | "fold" | "edge" | "swap" | "return";

export type PageFlipFrame = {
  rotate: string;
  scaleX: string;
  opacity: number;
  duration: string;
  ease: string;
};

export function getPageFlipFrame(mode: PageTurnMode, direction: PageTurnDirection, phase: PageFlipPhase): PageFlipFrame {
  if (phase === "accelerate") {
    return {
      rotate: direction === "forward" ? "-12deg" : "12deg",
      scaleX: "0.994",
      opacity: 1,
      duration: mode === "opening" ? "100ms" : "75ms",
      ease: "cubic-bezier(0.2,0.7,0.4,1)",
    };
  }

  if (phase === "fold") {
    return {
      rotate: direction === "forward" ? "-82deg" : "82deg",
      scaleX: "0.94",
      opacity: 0.92,
      duration: mode === "opening" ? "190ms" : "175ms",
      ease: "cubic-bezier(0.33,1,0.68,1)",
    };
  }

  if (phase === "edge") {
    return {
      rotate: direction === "forward" ? "-94deg" : "94deg",
      scaleX: "0.68",
      opacity: 0.3,
      duration: "80ms",
      ease: "linear",
    };
  }

  if (phase === "swap") {
    return {
      rotate: direction === "forward" ? "-94deg" : "94deg",
      scaleX: "0.66",
      opacity: 0.06,
      duration: "65ms",
      ease: "linear",
    };
  }

  return {
    rotate: "0deg",
    scaleX: "1",
    opacity: 0,
    duration: mode === "opening" ? "290ms" : "240ms",
    ease: "cubic-bezier(0.16,1,0.3,1)",
  };
}
