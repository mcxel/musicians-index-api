// apps/web/src/app/events/[slug]/bracket/page.tsx
// Event Bracket
// Layout: default | Auth: none
// Copilot wires: useEventBracket(slug)
// VS Code proves: bracket renders with correct matchups
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Event Bracket · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--events-slug-bracket">
      <div className="tmi-page__inner">
        {/* EventBracketPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Event Bracket</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
