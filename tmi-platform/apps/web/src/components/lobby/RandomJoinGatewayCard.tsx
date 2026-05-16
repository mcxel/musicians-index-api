'use client';
// RandomJoinGatewayCard.tsx — Drop into a random open room
// Copilot wires: useMatchmaking() → routes by role/genre/capacity
// Proof: user lands in an open room matching their preferences
export function RandomJoinGatewayCard() {
  return (
    <div className="tmi-random-join">
      <div className="tmi-random-join__star">★</div>
      <div className="tmi-random-join__title">JOIN RANDOM ROOM</div>
      <div className="tmi-random-join__sub">Drop in anywhere. Discover someone new.</div>
      <button className="tmi-btn-primary tmi-btn--lg" data-action="random-join">
        Join Now
      </button>
      <div className="tmi-random-join__filters">
        <button className="tmi-btn-ghost tmi-btn--sm">Hip Hop</button>
        <button className="tmi-btn-ghost tmi-btn--sm">R&B</button>
        <button className="tmi-btn-ghost tmi-btn--sm">Producer Lab</button>
        <button className="tmi-btn-ghost tmi-btn--sm">Battle</button>
      </div>
    </div>
  );
}
