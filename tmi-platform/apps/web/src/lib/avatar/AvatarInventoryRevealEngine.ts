export type AvatarInventoryClass = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";

const classes: AvatarInventoryClass[] = ["COMMON", "RARE", "EPIC", "LEGENDARY"];

export function resolveAvatarInventoryClass(seed: string): AvatarInventoryClass {
  const hash = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return classes[hash % classes.length] ?? "COMMON";
}

export function resolveAvatarInventoryGlow(kind: AvatarInventoryClass): string {
  switch (kind) {
    case "RARE":
      return "#00ffff";
    case "EPIC":
      return "#ff2daa";
    case "LEGENDARY":
      return "#facc15";
    default:
      return "#a1a1aa";
  }
}
