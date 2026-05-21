// apps/web/src/app/safety/page.tsx
// Safety
// Layout: default | Auth: none
// Copilot wires: useSafetyResources()
// VS Code proves: safety resources load
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Safety · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--safety">
      <div className="tmi-page__inner">
        {/* SafetyShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Safety</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
