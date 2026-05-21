// apps/web/src/app/artists/[slug]/sponsors/page.tsx
// Artist Sponsors
// Layout: default | Auth: none
// Copilot wires: useArtistSponsors(slug)
// VS Code proves: sponsor panels show
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Artist Sponsors · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--artists-slug-sponsors">
      <div className="tmi-page__inner">
        {/* ArtistSponsorPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Artist Sponsors</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
