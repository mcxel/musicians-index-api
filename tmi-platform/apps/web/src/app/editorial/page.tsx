// apps/web/src/app/editorial/page.tsx
// Editorial | Auth: none
// Copilot wires: useLatestIssue(), useFeaturedArticles()
// VS Code proves: latest issue loads
import { Metadata } from 'next';
export const metadata: Metadata = { title: "Editorial · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: none — public
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* EditorialHomepageShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>Editorial</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
