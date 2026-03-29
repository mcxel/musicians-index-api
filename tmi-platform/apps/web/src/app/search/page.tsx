// apps/web/src/app/search/page.tsx
// Search | Auth: none
// Copilot wires: useSearch(q, type), group by entity type
// VS Code proves: results load, LIVE rooms first
import { Metadata } from 'next';
export const metadata: Metadata = { title: "Search · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: none — public
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* GlobalSearchBar, SearchResultCard — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>Search</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
