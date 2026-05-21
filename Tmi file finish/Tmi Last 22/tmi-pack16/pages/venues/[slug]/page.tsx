// apps/web/src/app/venues/[slug]/page.tsx
// Venue Page
// Layout: default | Auth: none
// Copilot wires: useVenueProfile(slug)
// VS Code proves: venue renders with identity and rooms
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Venue Page · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--venues-slug">
      <div className="tmi-page__inner">
        {/* VenueHeroPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Venue Page</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
