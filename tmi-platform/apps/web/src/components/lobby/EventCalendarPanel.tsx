'use client';
// EventCalendarPanel.tsx — Scheduled concerts and listening parties
// Copilot wires: useUpcomingEvents({ limit: 10 })
// Proof: events load, dates correct, click navigates to /events/[slug]
export function EventCalendarPanel() {
  return (
    <div className="tmi-event-calendar">
      <div className="tmi-event-calendar__label">EVENT CALENDAR</div>
      <div className="tmi-event-calendar__sub">Scheduled concerts and listening parties</div>
      <div className="tmi-event-calendar__list" data-slot="events">
        {/* Copilot maps event data here */}
        {['Concerts', 'Saturday', 'Wednesday'].map((item, i) => (
          <div key={i} className="tmi-event-calendar__item">{item}</div>
        ))}
      </div>
    </div>
  );
}
