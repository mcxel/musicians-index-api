// apps/web/src/app/world-map/page.tsx
// World Map
// Layout: default | Auth: none
// Copilot wires: useWorldMap(), useCityActivity()
// VS Code proves: world map renders with active venues
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'World Map · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--world-map">
      <div className="tmi-page__inner">
        {/* WorldMapShell, CityMapPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">World Map</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
