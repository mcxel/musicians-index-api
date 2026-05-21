// apps/web/src/app/cities/page.tsx
// Cities
// Layout: default | Auth: none
// Copilot wires: useCities({ active:true })
// VS Code proves: active city scenes load
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Cities · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--cities">
      <div className="tmi-page__inner">
        {/* CitiesListShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Cities</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
