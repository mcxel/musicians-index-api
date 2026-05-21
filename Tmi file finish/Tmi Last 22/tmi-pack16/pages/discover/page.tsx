// apps/web/src/app/discover/page.tsx
// Discover
// Layout: default | Auth: none
// Copilot wires: useDiscovery(), useRecommendations(userId)
// VS Code proves: discovery cards load, genre filters work
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Discover · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--discover">
      <div className="tmi-page__inner">
        {/* DiscoveryPageShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Discover</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
