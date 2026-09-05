/** monitor=0 → Monitor A (top), monitor=1 → Monitor B (bottom). cellIndex -1 = full frame. */
export interface MonitorShareSlot {
  monitor: 0 | 1;
  cellIndex: number;
}

export function isSameShareSlot(a: MonitorShareSlot | null, b: MonitorShareSlot | null): boolean {
  if (!a || !b) return false;
  return a.monitor === b.monitor && a.cellIndex === b.cellIndex;
}

export function shareSlotTargetsCell(
  shareSlot: MonitorShareSlot | null,
  monitor: 0 | 1,
  cellIndex: number,
): boolean {
  if (!shareSlot) return false;
  if (shareSlot.monitor !== monitor) return false;
  if (shareSlot.cellIndex === -1) return cellIndex === -1;
  return shareSlot.cellIndex === cellIndex;
}

/** Screen-share capture / lifecycle errors — real UI states, never silent dead buttons. */
export type ScreenShareErrorCode =
  | "cancelled"
  | "denied"
  | "ended"
  | "unsupported"
  | "audio_unavailable"
  | "track_disconnected"
  | null;

export interface ScreenShareSource {
  id: string;
  label: string;
  stream: MediaStream;
  alive: boolean;
  hasAudio: boolean;
}
