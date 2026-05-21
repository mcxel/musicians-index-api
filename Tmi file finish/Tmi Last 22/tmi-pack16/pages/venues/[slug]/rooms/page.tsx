// apps/web/src/app/venues/[slug]/rooms/page.tsx
// Venue Rooms
// Layout: default | Auth: none
// Copilot wires: useVenueRooms(slug)
// VS Code proves: active rooms under venue load
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Venue Rooms · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--venues-slug-rooms">
      <div className="tmi-page__inner">
        {/* VenueRoomsPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Venue Rooms</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
