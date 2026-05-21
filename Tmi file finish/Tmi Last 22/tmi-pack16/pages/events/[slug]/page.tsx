// apps/web/src/app/events/[slug]/page.tsx
// Event Page
// Layout: default | Auth: none
// Copilot wires: useEvent(slug)
// VS Code proves: event page renders with correct info
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Event Page · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--events-slug">
      <div className="tmi-page__inner">
        {/* EventHeroPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Event Page</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
