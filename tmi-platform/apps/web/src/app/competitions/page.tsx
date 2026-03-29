// apps/web/src/app/competitions/page.tsx
// Competitions | Auth: none
// Copilot wires: useCompetitions({ status:'all' })
// VS Code proves: open and past competitions load
import { Metadata } from 'next';
export const metadata: Metadata = { title: "Competitions · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: none — public
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* CompetitionsShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>Competitions</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
