// apps/web/src/app/artists/[slug]/timeline/page.tsx
// Artist Timeline
// Layout: default | Auth: none
// Copilot wires: useArtistTimeline(slug)
// VS Code proves: timeline events load chronologically
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Artist Timeline · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--artists-slug-timeline">
      <div className="tmi-page__inner">
        {/* ArtistTimelinePanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Artist Timeline</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
