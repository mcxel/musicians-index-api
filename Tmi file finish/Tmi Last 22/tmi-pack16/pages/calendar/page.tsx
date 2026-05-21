// apps/web/src/app/calendar/page.tsx
// Event Calendar
// Layout: default | Auth: none
// Copilot wires: useUpcomingEvents({ limit:20 })
// VS Code proves: events load with correct dates
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Event Calendar · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--calendar">
      <div className="tmi-page__inner">
        {/* EventCalendarPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Event Calendar</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
