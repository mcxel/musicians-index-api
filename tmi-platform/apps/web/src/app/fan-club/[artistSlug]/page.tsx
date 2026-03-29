// apps/web/src/app/fan-club/[artistSlug]/page.tsx
// Fan Club | Auth: none
// Copilot wires: useFanClub(artistSlug)
// VS Code proves: landing page loads with tiers and member count
import { Metadata } from 'next';
export const metadata: Metadata = { title: "Fan Club · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: none — public
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* FanClubLandingPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>Fan Club</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
