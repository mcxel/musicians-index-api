// apps/web/src/app/appeals/page.tsx
// Appeals
// Layout: default | Auth: none
// Copilot wires: useAppealSubmit()
// VS Code proves: appeal form submits
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Appeals · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--appeals">
      <div className="tmi-page__inner">
        {/* AppealForm — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Appeals</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
