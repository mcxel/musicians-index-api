/**
 * VenueSyncEngine
 * Maps performer head-tracking vector to audience avatar head rotations.
 * Produces subtle, organic-feeling gaze awareness across the crowd.
 */

export interface HeadVector {
  yaw: number;   // -1 (far left) to 1 (far right)
  pitch: number; // -1 (down) to 1 (up)
  roll: number;  // -0.5 to 0.5
}

export interface SeatPosition {
  seatId: string;
  col: number; // 0–1 normalized horizontal position across stage width
  row: number; // 0–1 normalized distance from stage (0=front, 1=back)
}

export interface AvatarHeadState {
  seatId: string;
  rotateX: number; // CSS degrees — tilt toward/away from performer
  rotateY: number; // CSS degrees — turn left/right to follow gaze
  scale: number;   // subtle size emphasis when directly addressed
}

// Strength falloff by row — front row reacts most strongly
function rowStrength(row: number): number {
  return Math.max(0.1, 1 - row * 0.65);
}

// Horizontal offset: how far the seat is from where the performer is looking
function horizontalDeviation(seatCol: number, gazeX: number): number {
  return Math.abs(seatCol - ((gazeX + 1) / 2));
}

export function computeAvatarHeadStates(
  performerHead: HeadVector,
  seats: SeatPosition[],
): AvatarHeadState[] {
  return seats.map((seat) => {
    const strength = rowStrength(seat.row);
    const hDev = horizontalDeviation(seat.col, performerHead.yaw);
    const attention = Math.max(0, 1 - hDev * 1.8) * strength;

    // Y rotation: seat turns slightly toward center of gaze
    const gazeCol = (performerHead.yaw + 1) / 2;
    const turnDir = seat.col < gazeCol ? 1 : -1;
    const rotateY = turnDir * hDev * 12 * strength;

    // X rotation: front-row lean slightly forward when performer looks at them
    const rotateX = attention * performerHead.pitch * -8;

    // Subtle scale boost when directly looked at
    const scale = 1 + attention * 0.06;

    return { seatId: seat.seatId, rotateX, rotateY, scale };
  });
}

// ── Webcam head-tracking adapter ─────────────────────────────────────────────
// Converts browser landmark data (MediaPipe / simple ratio) to HeadVector.
// Pass { x, y } as fractions of the video frame (0–1).

export function landmarkToHeadVector(nose: { x: number; y: number }): HeadVector {
  return {
    yaw: (nose.x - 0.5) * 2,       // center = 0, edges = ±1
    pitch: -(nose.y - 0.4) * 2.5,  // slightly offset center so neutral looks natural
    roll: 0,
  };
}

// ── Smoothing (call each animation frame) ────────────────────────────────────
const SMOOTH = 0.12;

export function smoothHeadVector(prev: HeadVector, next: HeadVector): HeadVector {
  return {
    yaw:   prev.yaw   + (next.yaw   - prev.yaw)   * SMOOTH,
    pitch: prev.pitch + (next.pitch - prev.pitch) * SMOOTH,
    roll:  prev.roll  + (next.roll  - prev.roll)  * SMOOTH,
  };
}
