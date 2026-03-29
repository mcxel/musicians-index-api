// apps/web/src/app/competitions/[slug]/page.tsx
// Competition | Auth: none
// Copilot wires: useCompetition(slug)
// VS Code proves: competition info loads
import { Metadata } from 'next';
export const metadata: Metadata = { title: "Competition · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: none — public
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* CompetitionDetailShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>Competition</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
