// apps/web/src/app/events/[slug]/results/page.tsx
// Event Results
// Layout: default | Auth: none
// Copilot wires: useEventResults(slug)
// VS Code proves: results and winner card display
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Event Results · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--events-slug-results">
      <div className="tmi-page__inner">
        {/* ResultsTablePanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Event Results</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
