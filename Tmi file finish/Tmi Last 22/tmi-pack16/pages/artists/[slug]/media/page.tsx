// apps/web/src/app/artists/[slug]/media/page.tsx
// Artist Media
// Layout: default | Auth: none
// Copilot wires: useArtistMedia(slug)
// VS Code proves: media locker loads, links playable
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Artist Media · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--artists-slug-media">
      <div className="tmi-page__inner">
        {/* ArtistMediaLockerPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Artist Media</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
