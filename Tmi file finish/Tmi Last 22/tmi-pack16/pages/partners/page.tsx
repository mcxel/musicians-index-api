// apps/web/src/app/partners/page.tsx
// Partners
// Layout: default | Auth: none
// Copilot wires: —
// VS Code proves: partners page renders
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Partners · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--partners">
      <div className="tmi-page__inner">
        {/* PartnersShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Partners</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
