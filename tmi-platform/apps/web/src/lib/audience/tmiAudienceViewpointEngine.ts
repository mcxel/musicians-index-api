import type { TmiSeatPosition } from "@/lib/audience/tmiFanAvatarSeatAssignment";
import type { TmiSeatTier } from "@/lib/audience/tmiSeatTierEngine";

export type TmiAudienceViewpoint = {
  cameraX: number;
  cameraY: number;
  cameraZ: number;
  lookAtX: number;
  lookAtY: number;
  lookAtZ: number;
  fov: number;
  tier: TmiSeatTier;
};

export function getAudienceViewpointFromSeat(seat: TmiSeatPosition, tier: TmiSeatTier): TmiAudienceViewpoint {
  const yBoost = tier === "sponsor-vip-front-glow" ? 1.4 : tier === "premium-front-row" ? 1.2 : 1.0;
  const fov = tier === "free-back-row" ? 72 : tier === "paid-mid-row" ? 66 : 60;

  return {
    cameraX: seat.x,
    cameraY: seat.y + yBoost,
    cameraZ: seat.z + 2.6,
    lookAtX: 0,
    lookAtY: 1.2,
    lookAtZ: -6.4,
    fov,
    tier,
  };
}
