// apps/web/src/app/credits/page.tsx
// Fan Credits | Auth: auth
// Copilot wires: useFanCredits(userId), purchaseCredits(bundleId)
// VS Code proves: balance shows, purchase flow works
import { Metadata } from 'next';
export const metadata: Metadata = { title: "Fan Credits · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: any authenticated user
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* FanCreditWidget full-page — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>Fan Credits</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
