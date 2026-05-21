// apps/web/src/app/help/page.tsx
// Help
// Layout: default | Auth: none
// Copilot wires: useHelpArticles()
// VS Code proves: help articles load
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Help · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--help">
      <div className="tmi-page__inner">
        {/* HelpShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Help</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
