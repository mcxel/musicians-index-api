// Shape Overlay Engine
// Locks one cover shape identity per issue cycle.
// First cycle is intentionally clean (circle / vertical-oval), then escalates.

export type IrregularShape = "circle" | "vertical-oval" | "hexagon" | "diamond" | "burst" | "pentagon";

export interface ShapeConfig {
  shape: IrregularShape;
  rotation: number;
  scale: number;
  opacity: number;
}

const ISSUE_ONE_WEEK_INDEX = 16;
const LOCKED_SHAPE_SEQUENCE: Array<Exclude<IrregularShape, "vertical-oval">> = [
  "circle",
  "hexagon",
  "diamond",
  "burst",
  "pentagon",
];

// SVG clip-path definitions for polygonal shapes only.
const SHAPE_POLYGONS: Record<Exclude<IrregularShape, "circle" | "vertical-oval">, string> = {
  // Hexagon: 6 sides
  hexagon: "50,0 100,25 100,75 50,100 0,75 0,25",

  // Diamond: 4 points
  diamond: "50,0 100,50 50,100 0,50",

  // Burst: 12-point starburst for the late-cycle cover escalation
  burst: "50,0 60,16 78,6 74,26 94,22 82,40 100,50 82,60 94,78 74,74 78,94 60,84 50,100 40,84 22,94 26,74 6,78 18,60 0,50 18,40 6,22 26,26 22,6 40,16",

  // Pentagon: 5 sides
  pentagon: "50,0 100,38 82,100 18,100 0,38",
};

export function getIssueShapePhase(weekIndex: number): number {
  const delta = weekIndex - ISSUE_ONE_WEEK_INDEX;
  return ((delta % LOCKED_SHAPE_SEQUENCE.length) + LOCKED_SHAPE_SEQUENCE.length) % LOCKED_SHAPE_SEQUENCE.length;
}

export function getIssueShape(weekIndex: number): ShapeConfig {
  const phase = getIssueShapePhase(weekIndex);
  const shape = phase === 0
    ? (weekIndex % 2 === 0 ? "circle" : "vertical-oval")
    : LOCKED_SHAPE_SEQUENCE[phase]!;

  return {
    shape,
    rotation: 0,
    scale: 1,
    opacity: 0.11,
  };
}

export function getWeeklyShape(weekIndex: number): ShapeConfig {
  return getIssueShape(weekIndex);
}

export function generateShapeStack(weekIndex: number, count: number = 3): ShapeConfig[] {
  const baseShape = getIssueShape(weekIndex);
  return Array.from({ length: count }, (_, i) => ({
    shape: baseShape.shape,
    rotation: 0,
    scale: 1 - i * 0.12,
    opacity: Math.max(0.03, baseShape.opacity - i * 0.025),
  }));
}

// SVG mask template (for use in clips)
export function generateMaskSVG(shape: IrregularShape, size: number = 400): string {
  const polygon = shape === "circle" || shape === "vertical-oval" ? SHAPE_POLYGONS.hexagon : SHAPE_POLYGONS[shape];
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <mask id="shape-mask">
          <rect width="100" height="100" fill="white" />
          <polygon points="${polygon}" fill="black" />
        </mask>
      </defs>
    </svg>
  `;
}

export function getClipPathCSS(shape: IrregularShape): string {
  if (shape === "circle") {
    return "circle(50% at 50% 50%)";
  }

  if (shape === "vertical-oval") {
    return "ellipse(34% 50% at 50% 50%)";
  }

  const polygon = SHAPE_POLYGONS[shape];
  const points = polygon
    .split(" ")
    .map((p) => {
      const [x, y] = p.split(",");
      return `${Number(x)}% ${Number(y)}%`;
    })
    .join(", ");
  
  return `polygon(${points})`;
}

export function getRotatingShapeKeyframes(shape: IrregularShape): { [key: string]: any } {
  return {
    "0%": {
      transform: "scale(1)",
      opacity: 0.12,
    },
    "50%": {
      transform: "scale(1.03)",
      opacity: 0.08,
    },
    "100%": {
      transform: "scale(1)",
      opacity: 0.12,
    },
  };
}
