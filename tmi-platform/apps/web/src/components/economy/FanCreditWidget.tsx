'use client';
// FanCreditWidget.tsx — Fan credit balance + purchase bundles
// Copilot wires: useFanCredits(userId), purchaseCredits(bundleId)
// Proof: balance shows, purchase flow works, credits update after purchase
export function FanCreditWidget({ userId }: { userId: string }) {
  const BUNDLES = [
    { id:'100', credits:100, price:5 },
    { id:'500', credits:500, price:20 },
    { id:'1500', credits:1500, price:50 },
  ];
  return (
    <div className="tmi-fan-credits">
      <div className="tmi-fan-credits__balance">
        <span className="tmi-fan-credits__icon" aria-hidden="true">⭐</span>
        <span className="tmi-fan-credits__amount" data-slot="balance">0</span>
        <span className="tmi-fan-credits__label">Credits</span>
      </div>
      <div className="tmi-fan-credits__bundles">
        {BUNDLES.map(b => (
          <button key={b.id} className="tmi-fan-credits__bundle-btn" data-bundle={b.id}>
            <span>{b.credits} credits</span>
            <span>${b.price}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
