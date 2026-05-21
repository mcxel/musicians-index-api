// apps/web/src/app/artists/[slug]/articles/page.tsx
// Artist Articles
// Layout: default | Auth: none
// Copilot wires: useArtistArticles(slug)
// VS Code proves: articles load chronologically
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Artist Articles · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--artists-slug-articles">
      <div className="tmi-page__inner">
        {/* ArtistArticleRail — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Artist Articles</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
