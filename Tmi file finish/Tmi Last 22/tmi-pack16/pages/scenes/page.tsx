// apps/web/src/app/scenes/page.tsx
// Scenes
// Layout: default | Auth: none
// Copilot wires: useScenes()
// VS Code proves: regional scenes load
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Scenes · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--scenes">
      <div className="tmi-page__inner">
        {/* ScenesShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Scenes</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
