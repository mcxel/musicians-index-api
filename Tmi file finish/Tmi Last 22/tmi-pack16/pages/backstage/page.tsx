// apps/web/src/app/backstage/page.tsx
// Backstage
// Layout: default | Auth: artist
// Copilot wires: useEventPreLive(eventId), usePerformerReadiness()
// VS Code proves: only performers access, countdown shows
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Backstage · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: ARTIST role required — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--backstage">
      <div className="tmi-page__inner">
        {/* BackstageRoomShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Backstage</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
