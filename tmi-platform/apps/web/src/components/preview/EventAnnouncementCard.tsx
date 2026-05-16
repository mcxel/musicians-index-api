'use client';
// EventAnnouncementCard.tsx — Event/show announcement in preview slot
// Copilot wires: triggered by stage-director-bot on event start
// Proof: event card shows with correct info, countdown correct
export function EventAnnouncementCard({ eventTitle, eventType, startsAt, venueName }: { eventTitle: string; eventType?: string; startsAt?: Date; venueName?: string }) {
  return (
    <div className="tmi-event-announcement-card">
      <div className="tmi-event-announcement-card__type">{eventType || 'Event'}</div>
      <div className="tmi-event-announcement-card__title">{eventTitle}</div>
      {venueName && <div className="tmi-event-announcement-card__venue">{venueName}</div>}
      {startsAt && (
        <div className="tmi-event-announcement-card__time">
          Starts: {new Date(startsAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}
