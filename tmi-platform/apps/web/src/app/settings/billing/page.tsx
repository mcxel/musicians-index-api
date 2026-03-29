// apps/web/src/app/settings/billing/page.tsx
// Settings: Billing | Auth: auth
// Copilot wires: useSubscription(), usePaymentMethod()
// VS Code proves: current plan shows, upgrade works
import { Metadata } from 'next';
export const metadata: Metadata = { title: "Settings: Billing · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: any authenticated user
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* UserSettingsShell + BillingPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>Settings: Billing</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
