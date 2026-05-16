export type MotionSurface =
  | 'top-10-orbit'
  | 'crown-artist'
  | 'host-intro'
  | 'billboard'
  | 'venue-display'
  | 'event-poster'
  | 'room-loop';

export type MotionPriority = 'critical' | 'high' | 'medium' | 'low';

export function resolveMotionPriority(surface: MotionSurface): MotionPriority {
  if (surface === 'top-10-orbit' || surface === 'crown-artist') return 'critical';
  if (surface === 'host-intro' || surface === 'venue-display') return 'high';
  if (surface === 'billboard' || surface === 'event-poster') return 'medium';
  return 'low';
}
