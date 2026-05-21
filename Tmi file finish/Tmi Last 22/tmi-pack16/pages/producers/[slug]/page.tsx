// apps/web/src/app/producers/[slug]/page.tsx
// Producer Profile
// Layout: default | Auth: none
// Copilot wires: useProducerProfile(slug)
// VS Code proves: producer profile renders
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Producer Profile · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--producers-slug">
      <div className="tmi-page__inner">
        {/* ProducerHeroPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Producer Profile</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
