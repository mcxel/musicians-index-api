// apps/web/src/app/artists/[slug]/bookings/page.tsx
// Artist Bookings
// Layout: default | Auth: artist
// Copilot wires: useArtistBookings(slug)
// VS Code proves: booking panel opens, requests work
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Artist Bookings · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: ARTIST role required — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--artists-slug-bookings">
      <div className="tmi-page__inner">
        {/* ArtistBookingPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Artist Bookings</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
