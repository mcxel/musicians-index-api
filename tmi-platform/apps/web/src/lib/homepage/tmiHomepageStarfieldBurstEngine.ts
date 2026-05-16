export type StarParticle = {
  id: string;
  angle: number;
  velocity: number;
  radius: number;
  glow: number;
};

export function createStarfieldBurst(count = 36): StarParticle[] {
  const out: StarParticle[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      id: `p_${i}`,
      angle: Math.random() * Math.PI * 2,
      velocity: 0.6 + Math.random() * 2.2,
      radius: 6 + Math.random() * 24,
      glow: 0.4 + Math.random() * 0.6,
    });
  }
  return out;
}

export function stepStarfield(particles: StarParticle[], dt = 0.016): StarParticle[] {
  return particles.map((p) => ({
    ...p,
    radius: p.radius + p.velocity * 60 * dt,
    velocity: Math.max(0.08, p.velocity * 0.985),
    glow: Math.max(0.18, p.glow * 0.992),
  }));
}
