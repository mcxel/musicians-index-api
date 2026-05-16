'use client';
// ArtistArticleRail.tsx — Horizontal rail of artist's magazine articles
// Copilot wires: useArtistArticles(artistId, { limit:6 })
// Proof: articles load, click navigates to /articles/[slug]
export function ArtistArticleRail({ artistId }: { artistId: string }) {
  return (
    <div className="tmi-article-rail">
      <div className="tmi-article-rail__header">
        <span className="tmi-section-label">Articles</span>
        <button className="tmi-btn-ghost tmi-btn--sm">See All →</button>
      </div>
      <div className="tmi-article-rail__scroll" data-slot="articles">
        <div className="tmi-article-card tmi-placeholder">Article Title</div>
      </div>
    </div>
  );
}
