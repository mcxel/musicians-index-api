export type TmiStarfieldParticle = {
  id: string;
  x: number;
  y: number;
  scale: number;
  hue: number;
  lifeMs: number;
};

export function buildStarfieldBurst(seed = Date.now(), count = 24): TmiStarfieldParticle[] {
  const particles: TmiStarfieldParticle[] = [];
  let s = seed % 2147483647;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  for (let i = 0; i < count; i += 1) {
    particles.push({
      id: `star-${seed}-${i}`,
      x: Math.round(rand() * 100),
      y: Math.round(rand() * 100),
      scale: 0.45 + rand() * 1.35,
      hue: 180 + Math.round(rand() * 160),
      lifeMs: 420 + Math.round(rand() * 900),
    });
  }

  return particles;
}
