// apps/web/src/app/announcements/page.tsx
// Announcements
// Layout: default | Auth: auth
// Copilot wires: useAnnouncements()
// VS Code proves: announcements load
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Announcements · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: any authenticated user — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--announcements">
      <div className="tmi-page__inner">
        {/* AnnouncementCard — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Announcements</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
