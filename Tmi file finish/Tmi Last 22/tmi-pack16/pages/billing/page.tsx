// apps/web/src/app/billing/page.tsx
// Billing
// Layout: default | Auth: auth
// Copilot wires: useSubscription()
// VS Code proves: subscription status shows
import { Metadata } from 'next';


export const metadata: Metadata = { title: 'Billing · The Musician's Index' };

export default function Page({ params }: { params: { slug?: string } }) {
  // Auth: any authenticated user — middleware enforces
  // Redirect to /login if no session
  // Copilot: replace placeholder with real data from API
  return (
    <main className="tmi-page tmi-page--billing">
      <div className="tmi-page__inner">
        {/* BillingPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1 className="tmi-page-placeholder__title">Billing</h1>
          <p className="tmi-page-placeholder__note">Shell ready — Copilot wires data and sub-components</p>
        </div>
      </div>
    </main>
  );
}
