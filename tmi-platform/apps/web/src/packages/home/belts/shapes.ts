export type ShapeVariant = "hex" | "star" | "angled" | "ribbon" | "badge";

export function shapeClipPath(variant: ShapeVariant): string {
  switch (variant) {
    case "hex":
      return "polygon(24% 0%, 76% 0%, 100% 50%, 76% 100%, 24% 100%, 0% 50%)";
    case "star":
      return "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";
    case "angled":
      return "polygon(8% 0%, 100% 0%, 92% 100%, 0% 100%)";
    case "ribbon":
      return "polygon(0 0, 94% 0, 100% 50%, 94% 100%, 0 100%, 6% 50%)";
    case "badge":
    default:
      return "circle(50% at 50% 50%)";
  }
}
