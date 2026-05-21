// apps/web/src/app/for-sponsors/page.tsx
// For Sponsors
// Layout: default | Auth: none
// Copilot wires: —
// VS Code proves: page renders
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'For Sponsors · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--for-sponsors">
      <div className="tmi-page__inner">
        {/* ForSponsorsShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">For Sponsors</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
