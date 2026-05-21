// apps/web/src/app/highlights/page.tsx
// Highlights
// Layout: default | Auth: none
// Copilot wires: useHighlights({ scope:'recent', limit:20 })
// VS Code proves: highlight clips load
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Highlights · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--highlights">
      <div className="tmi-page__inner">
        {/* HighlightRail — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Highlights</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
