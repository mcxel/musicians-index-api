export type TmiRearOverlayShape = {
  id: string;
  xPct: number;
  yPct: number;
  size: number;
  blur: number;
  hue: number;
  alpha: number;
};

export function buildRearOverlayShapes(seed = Date.now(), count = 12): TmiRearOverlayShape[] {
  let s = seed % 2147483647;
  const rand = () => {
    s = (s * 48271) % 2147483647;
    return (s - 1) / 2147483646;
  };

  return new Array(count).fill(0).map((_, i) => ({
    id: `rear-shape-${seed}-${i}`,
    xPct: Math.round(rand() * 100),
    yPct: Math.round(rand() * 100),
    size: 80 + Math.round(rand() * 220),
    blur: 12 + Math.round(rand() * 26),
    hue: 180 + Math.round(rand() * 170),
    alpha: Number((0.08 + rand() * 0.2).toFixed(2)),
  }));
}
