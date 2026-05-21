// apps/web/src/app/venues/[slug]/archive/page.tsx
// Venue Archive
// Layout: default | Auth: none
// Copilot wires: useVenueArchive(slug)
// VS Code proves: past events load
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Venue Archive · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--venues-slug-archive">
      <div className="tmi-page__inner">
        {/* VenueHistoryPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Venue Archive</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
