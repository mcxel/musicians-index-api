// apps/web/src/app/competitions/[slug]/bracket/page.tsx
// Competition Bracket | Auth: none
// Copilot wires: useCompetitionBracket(slug)
// VS Code proves: bracket renders with correct matchups
import { Metadata } from 'next';
export const metadata: Metadata = { title: "Competition Bracket · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: none — public
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* CompetitionBracketPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>Competition Bracket</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
