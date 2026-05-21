// apps/web/src/app/support/page.tsx
// Support
// Layout: default | Auth: none
// Copilot wires: useHelpTopics()
// VS Code proves: help topics load
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Support · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--support">
      <div className="tmi-page__inner">
        {/* SupportShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Support</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
