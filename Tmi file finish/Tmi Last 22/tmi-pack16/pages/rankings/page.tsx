// apps/web/src/app/rankings/page.tsx
// Rankings
// Layout: default | Auth: none
// Copilot wires: useRankings({ scope:'global' })
// VS Code proves: all rankings load
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Rankings · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--rankings">
      <div className="tmi-page__inner">
        {/* RankingsShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Rankings</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
