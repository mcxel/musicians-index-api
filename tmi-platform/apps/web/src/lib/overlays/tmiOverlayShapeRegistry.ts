export type TmiOverlayShapeId =
  | "rect"
  | "rounded-rect"
  | "circle"
  | "oval"
  | "triangle"
  | "blob"
  | "star"
  | "shield"
  | "neon-ring"
  | "awkward-90s"
  | "magazine-cutout"
  | "custom-svg-mask";

export type TmiOverlayShapeDefinition = {
  id: TmiOverlayShapeId;
  label: string;
  cssClipPath?: string;
};

export const TMI_OVERLAY_SHAPES: TmiOverlayShapeDefinition[] = [
  { id: "rect", label: "Rectangle" },
  { id: "rounded-rect", label: "Rounded Rectangle", cssClipPath: "inset(0 round 16px)" },
  { id: "circle", label: "Circle", cssClipPath: "circle(50% at 50% 50%)" },
  { id: "oval", label: "Oval", cssClipPath: "ellipse(50% 40% at 50% 50%)" },
  { id: "triangle", label: "Triangle", cssClipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" },
  { id: "blob", label: "Blob", cssClipPath: "polygon(12% 18%, 40% 6%, 78% 12%, 92% 44%, 86% 80%, 52% 94%, 22% 84%, 8% 52%)" },
  { id: "star", label: "Star", cssClipPath: "polygon(50% 2%, 61% 36%, 98% 36%, 68% 57%, 78% 94%, 50% 72%, 22% 94%, 32% 57%, 2% 36%, 39% 36%)" },
  { id: "shield", label: "Shield", cssClipPath: "polygon(50% 0%, 88% 12%, 88% 56%, 50% 100%, 12% 56%, 12% 12%)" },
  { id: "neon-ring", label: "Neon Ring", cssClipPath: "circle(50% at 50% 50%)" },
  { id: "awkward-90s", label: "Awkward 90s", cssClipPath: "polygon(6% 8%, 86% 2%, 98% 28%, 88% 92%, 22% 98%, 2% 74%)" },
  { id: "magazine-cutout", label: "Magazine Cutout", cssClipPath: "inset(4% 6% 8% 6% round 8px)" },
  { id: "custom-svg-mask", label: "Custom SVG Mask" },
];

export function getOverlayShape(shapeId: TmiOverlayShapeId): TmiOverlayShapeDefinition | undefined {
  return TMI_OVERLAY_SHAPES.find((shape) => shape.id === shapeId);
}
