// apps/web/src/app/tip/[artistSlug]/page.tsx
// Tip an Artist | Auth: auth
// Copilot wires: useArtistProfile(slug), useTipJar(artistId)
// VS Code proves: tip sends, artist receives notification
import { Metadata } from 'next';
export const metadata: Metadata = { title: "Tip an Artist · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: any authenticated user
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* TipJarWidget full-page — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>Tip an Artist</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
