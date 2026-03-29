// apps/web/src/app/wallet/page.tsx
// My Wallet | Auth: artist
// Copilot wires: useWallet(artistId), requestPayout()
// VS Code proves: earnings show, payout button works at $20+
import { Metadata } from 'next';
export const metadata: Metadata = { title: "My Wallet · The Musician's Index" };
export default function Page({ params, searchParams }: any) {
  // Auth: ARTIST role required
  return (
    <main className="tmi-page">
      <div className="tmi-page__inner">
        {/* WalletPanel — Copilot wires here */}
        <div className="tmi-page-placeholder">
          <h1>My Wallet</h1>
          <p>Shell ready — Copilot wires data</p>
        </div>
      </div>
    </main>
  );
}
