// apps/web/src/app/venues/[slug]/sponsors/page.tsx
// Venue Sponsors
// Layout: default | Auth: none
// Copilot wires: useVenueSponsors(slug)
// VS Code proves: sponsor boards load
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Venue Sponsors · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--venues-slug-sponsors">
      <div className="tmi-page__inner">
        {/* VenueSponsorBoard — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Venue Sponsors</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
