// apps/web/src/app/leaderboards/page.tsx
// Leaderboards
// Layout: default | Auth: none
// Copilot wires: useLeaderboards({ scope:'weekly' })
// VS Code proves: rankings display correctly
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Leaderboards · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--leaderboards">
      <div className="tmi-page__inner">
        {/* LeaderboardPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Leaderboards</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
