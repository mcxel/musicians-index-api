// apps/web/src/types/shared.ts

export type Vec2 = { x: number; y: number; z?: number };

export interface EnhancedSeatState {
  id?: string;
  seatId: string;
  position: Vec2;
  tier?: string;
  occupiedBy?: string;
  isReserved?: boolean;
  sponsorBadge?: string;
  [key: string]: unknown;
}

export type SeatState = EnhancedSeatState;

export interface AvatarState {
  id: string;
  seatId?: string;
  position: Vec2;
  [key: string]: unknown;
}

export interface EquippedItems {
  [key: string]: unknown;
}

export type EmoteType = string;

