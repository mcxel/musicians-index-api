// apps/web/src/app/venues/[slug]/schedule/page.tsx
// Venue Schedule
// Layout: default | Auth: none
// Copilot wires: useVenueSchedule(slug)
// VS Code proves: upcoming events load
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Venue Schedule · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--venues-slug-schedule">
      <div className="tmi-page__inner">
        {/* VenueSchedulePanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Venue Schedule</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
