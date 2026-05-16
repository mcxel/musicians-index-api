export type AvatarPocketPullStage = "idle" | "reach" | "pull" | "reveal";

export function getAvatarPocketPullStage(tick: number): AvatarPocketPullStage {
  const slot = tick % 4;
  if (slot === 1) return "reach";
  if (slot === 2) return "pull";
  if (slot === 3) return "reveal";
  return "idle";
}

export function getAvatarPocketPullLabel(stage: AvatarPocketPullStage): string {
  switch (stage) {
    case "reach":
      return "Pocket reach";
    case "pull":
      return "Item pull";
    case "reveal":
      return "Show reveal";
    default:
      return "Idle";
  }
}
