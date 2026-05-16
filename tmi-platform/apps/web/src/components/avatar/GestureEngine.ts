export type GestureState = "idle" | "wave" | "point" | "celebrate" | "talk";

export type GestureFrame = {
  headDeg: number;
  leftArmDeg: number;
  rightArmDeg: number;
  torsoShiftY: number;
};

export function getGestureFrame(state: GestureState, elapsedMs: number): GestureFrame {
  const t = elapsedMs / 1000;

  switch (state) {
    case "wave": {
      const swing = Math.sin(t * 8) * 20;
      return { headDeg: 4, leftArmDeg: -6, rightArmDeg: 30 + swing, torsoShiftY: -1 };
    }
    case "point": {
      return { headDeg: -7, leftArmDeg: -10, rightArmDeg: 48, torsoShiftY: -2 };
    }
    case "celebrate": {
      const bounce = Math.sin(t * 6) * 3;
      return { headDeg: Math.sin(t * 4) * 5, leftArmDeg: -36, rightArmDeg: 36, torsoShiftY: bounce };
    }
    case "talk": {
      const nod = Math.sin(t * 5) * 3;
      return { headDeg: nod, leftArmDeg: -4, rightArmDeg: 8, torsoShiftY: 0 };
    }
    default:
      return { headDeg: 0, leftArmDeg: 0, rightArmDeg: 0, torsoShiftY: 0 };
  }
}
