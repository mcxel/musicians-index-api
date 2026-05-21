// apps/web/src/app/artists/[slug]/battles/page.tsx
// Artist Battles
// Layout: default | Auth: none
// Copilot wires: useArtistBattles(slug)
// VS Code proves: battle history loads with outcomes
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Artist Battles · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--artists-slug-battles">
      <div className="tmi-page__inner">
        {/* ArtistBattleHistoryPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Artist Battles</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
