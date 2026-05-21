// apps/web/src/app/events/[slug]/watch/page.tsx
// Watch Event
// Layout: default | Auth: none
// Copilot wires: useEventWatch(slug)
// VS Code proves: watch surface loads, live stream plays
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Watch Event · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--events-slug-watch">
      <div className="tmi-page__inner">
        {/* EventWatchShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Watch Event</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
