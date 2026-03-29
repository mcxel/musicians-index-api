// apps/web/src/app/editorial/[slug]/page.tsx
// Article | Auth: none
// Copilot wires: useArticle(slug)
// VS Code proves: article renders with correct metadata
import { Metadata } from 'next';
export const metadata: Metadata = { title: "Article · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: none — public
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* ArticleShell — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>Article</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
