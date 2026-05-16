export type TmiHomepageStarburstRay = {
  id: string;
  angleDeg: number;
  length: number;
  width: number;
  hue: number;
};

export function buildHomepageStarburst(seed = Date.now(), rays = 14): TmiHomepageStarburstRay[] {
  let s = seed % 2147483647;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  return new Array(rays).fill(0).map((_, i) => ({
    id: `burst-${seed}-${i}`,
    angleDeg: Math.round((360 / rays) * i + rand() * 14),
    length: 120 + Math.round(rand() * 160),
    width: 3 + Math.round(rand() * 6),
    hue: 185 + Math.round(rand() * 150),
  }));
}
