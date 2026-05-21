// apps/web/src/app/archive/page.tsx
// Archive
// Layout: default | Auth: none
// Copilot wires: useArchive({ page:1, limit:20 })
// VS Code proves: archived issues load
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Archive · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--archive">
      <div className="tmi-page__inner">
        {/* ArchiveShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Archive</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
