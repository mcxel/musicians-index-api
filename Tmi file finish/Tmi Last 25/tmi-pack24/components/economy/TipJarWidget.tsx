'use client';
// TipJarWidget.tsx — Tip button shown in rooms and on artist profiles
// Copilot wires: useTipJar(artistId), Stripe PaymentIntent
// Proof: amounts show, payment confirms, TipExplosionEffect fires in room
export function TipJarWidget({ artistId, artistName }: { artistId: string; artistName: string }) {
  const AMOUNTS = [1, 5, 10, 25];
  return (
    <div className="tmi-tip-jar">
      <div className="tmi-tip-jar__label">Tip {artistName}</div>
      <div className="tmi-tip-jar__amounts">
        {AMOUNTS.map(a => (
          <button key={a} className="tmi-tip-jar__amount-btn" data-amount={a}>
            ${a}
          </button>
        ))}
        <button className="tmi-tip-jar__amount-btn tmi-tip-jar__amount-btn--custom">Custom</button>
      </div>
      <div className="tmi-tip-jar__confirm" data-slot="confirm-step" style={{display:'none'}}>
        <button className="tmi-btn-primary">Confirm Tip</button>
      </div>
    </div>
  );
}
