// apps/web/src/app/dashboard/fan-clubs/page.tsx
// Fan Club Dashboard | Auth: artist
// Copilot wires: useArtistFanClub(artistId), sendMessage()
// VS Code proves: members, revenue, post tools all load
import { Metadata } from 'next';
export const metadata: Metadata = { title: "Fan Club Dashboard · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: ARTIST role required
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* FanClubDashboard — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>Fan Club Dashboard</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
