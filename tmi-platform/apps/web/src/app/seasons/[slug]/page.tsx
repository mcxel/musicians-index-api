// apps/web/src/app/seasons/[slug]/page.tsx
// Season Rankings | Auth: none
// Copilot wires: useSeason(slug), useSeasonRankings(slug)
// VS Code proves: season info + rankings load
import { Metadata } from 'next';
export const metadata: Metadata = { title: "Season Rankings · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: none — public
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* SeasonDetailPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>Season Rankings</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
