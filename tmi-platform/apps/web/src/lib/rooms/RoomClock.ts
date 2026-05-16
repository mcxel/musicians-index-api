export type RoomClock = {
  now(): number;
};

export const defaultClock: RoomClock = {
  now: () => Date.now(),
};
