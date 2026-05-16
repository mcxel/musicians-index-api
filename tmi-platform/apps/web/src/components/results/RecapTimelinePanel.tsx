'use client';
// RecapTimelinePanel.tsx — Chronological recap of event moments
// Copilot wires: useEventRecap(eventId) — returns timeline moments
// Proof: moments load chronologically with timestamps
export function RecapTimelinePanel({ eventId }: { eventId: string }) {
  return (
    <div className="tmi-recap-timeline">
      <div className="tmi-recap-timeline__header">Event Recap</div>
      <div className="tmi-recap-timeline__moments" data-slot="moments">
        {/* Copilot maps moment cards: timestamp, type, description, clip */}
      </div>
    </div>
  );
}
