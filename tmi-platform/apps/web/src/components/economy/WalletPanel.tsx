'use client';
// WalletPanel.tsx — Artist earnings dashboard: tips, beats, bookings, payout
// Copilot wires: useWallet(artistId), requestPayout()
// Proof: balances show, pending/available split, payout button works
export function WalletPanel({ artistId }: { artistId: string }) {
  return (
    <div className="tmi-wallet">
      <div className="tmi-wallet__header">My Wallet</div>
      <div className="tmi-wallet__balances">
        <div className="tmi-wallet__balance-item">
          <span className="tmi-wallet__balance-label">Available</span>
          <span className="tmi-wallet__balance-val" data-slot="available">$0.00</span>
        </div>
        <div className="tmi-wallet__balance-item">
          <span className="tmi-wallet__balance-label">Pending</span>
          <span className="tmi-wallet__balance-val" data-slot="pending">$0.00</span>
        </div>
        <div className="tmi-wallet__balance-item">
          <span className="tmi-wallet__balance-label">All Time</span>
          <span className="tmi-wallet__balance-val" data-slot="total">$0.00</span>
        </div>
      </div>
      <div className="tmi-wallet__breakdown" data-slot="breakdown">
        {/* Tips, beats, bookings breakdown */}
      </div>
      <button className="tmi-btn-primary" disabled>Request Payout (min $20)</button>
      <div className="tmi-wallet__history" data-slot="transactions">
        {/* Recent transactions */}
      </div>
    </div>
  );
}
