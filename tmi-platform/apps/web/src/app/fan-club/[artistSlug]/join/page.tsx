// apps/web/src/app/fan-club/[artistSlug]/join/page.tsx
// Join Fan Club | Auth: auth
// Copilot wires: useFanClubJoin(artistSlug), Stripe subscription
// VS Code proves: join flow completes, badge shows
import { Metadata } from 'next';
export const metadata: Metadata = { title: "Join Fan Club · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: any authenticated user
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* FanClubJoinPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>Join Fan Club</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
