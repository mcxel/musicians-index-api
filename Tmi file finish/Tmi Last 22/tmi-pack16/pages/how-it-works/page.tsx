// apps/web/src/app/how-it-works/page.tsx
// How It Works
// Layout: default | Auth: none
// Copilot wires: —
// VS Code proves: page renders
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'How It Works · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--how-it-works">
      <div className="tmi-page__inner">
        {/* HowItWorksShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">How It Works</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
