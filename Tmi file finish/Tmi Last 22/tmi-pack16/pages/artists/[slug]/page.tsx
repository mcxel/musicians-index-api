// apps/web/src/app/artists/[slug]/page.tsx
// Artist Profile
// Layout: default | Auth: none
// Copilot wires: useArtistProfile(slug)
// VS Code proves: Diamond shows for Marcel/BJ; rank correct
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Artist Profile · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--artists-slug">
      <div className="tmi-page__inner">
        {/* ArtistHeroPanel, DiamondTierBadge — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Artist Profile</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
