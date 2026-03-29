// apps/web/src/app/fan-club/[artistSlug]/feed/page.tsx
// Fan Club Feed | Auth: auth
// Copilot wires: useFanClubFeed(artistSlug), gate: member only
// VS Code proves: non-members see paywall, members see posts
import { Metadata } from 'next';
export const metadata: Metadata = { title: "Fan Club Feed · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: any authenticated user
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* FanClubFeedPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>Fan Club Feed</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
