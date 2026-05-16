export type MagazineTransitionState =
  | "closed"
  | "opening"
  | "open"
  | "turning"
  | "closing";

export function toVisualState(
  shellState: "closed" | "open",
  transitionState: MagazineTransitionState
): "closed" | "half-open" | "open" {
  if (transitionState === "opening" || transitionState === "closing" || transitionState === "turning") {
    return "half-open";
  }
  return shellState;
}

export function computeShellTransform(
  shellState: "closed" | "open",
  transitionState: MagazineTransitionState
): string {
  if (transitionState === "opening") {
    return "rotateY(-62deg) scale(0.97)";
  }
  if (transitionState === "turning") {
    return "rotateY(-24deg) scale(0.985)";
  }
  if (transitionState === "closing") {
    return "rotateY(68deg) scale(0.97)";
  }
  if (shellState === "open") {
    return "rotateY(0deg) scale(1)";
  }
  return "rotateY(0deg) scale(1)";
}

export function computeContentOpacity(transitionState: MagazineTransitionState): number {
  if (transitionState === "opening" || transitionState === "closing") {
    return 0.08;
  }
  return 1;
}
