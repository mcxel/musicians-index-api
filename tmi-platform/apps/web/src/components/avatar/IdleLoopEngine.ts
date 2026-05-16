export type IdleLoopFrame = {
  breatheScale: number;
  swayDeg: number;
  bobY: number;
};

export function getIdleLoopFrame(nowMs: number): IdleLoopFrame {
  const t = nowMs / 1000;
  return {
    breatheScale: 1 + Math.sin(t * 2.2) * 0.02,
    swayDeg: Math.sin(t * 1.4) * 2,
    bobY: Math.sin(t * 2.8) * 1.8,
  };
}
