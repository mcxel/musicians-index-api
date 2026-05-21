// apps/web/src/app/results/page.tsx
// Results
// Layout: default | Auth: none
// Copilot wires: useRecentResults()
// VS Code proves: results display correctly
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Results · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--results">
      <div className="tmi-page__inner">
        {/* ResultsTablePanel, WinnerCard — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Results</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
