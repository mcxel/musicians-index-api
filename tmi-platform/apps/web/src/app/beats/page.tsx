// apps/web/src/app/beats/page.tsx
// Beat Marketplace | Auth: none
// Copilot wires: useBeats({ page:1, limit:24 }), genre/bpm filters
// VS Code proves: beats load, preview plays, filters work
import { Metadata } from 'next';
export const metadata: Metadata = { title: "Beat Marketplace · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: none — public
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* BeatMarketplaceShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>Beat Marketplace</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
