// apps/web/src/app/genres/page.tsx
// Genres
// Layout: default | Auth: none
// Copilot wires: useGenres()
// VS Code proves: genre clusters render
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Genres · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--genres">
      <div className="tmi-page__inner">
        {/* GenresShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Genres</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
