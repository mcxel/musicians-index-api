'use client';
// BattleResultCard.tsx — Feed card: battle outcome
// Copilot wires: data from activity feed, links to /events/[slug]/results
// Proof: winner/loser show correctly, link goes to results page
export function BattleResultCard({ winnerName, loserName, eventSlug, timestamp }: {
  winnerName:string; loserName:string; eventSlug:string; timestamp:string;
}) {
  return (
    <div className="tmi-feed-card tmi-feed-card--battle-result">
      <span className="tmi-feed-card__type-icon" aria-hidden="true">⚔️</span>
      <div className="tmi-feed-card__info">
        <span className="tmi-feed-card__title">
          <strong>{winnerName}</strong> defeated {loserName}
        </span>
        <span className="tmi-feed-card__time">{timestamp}</span>
      </div>
      <a href={`/events/${eventSlug}/results`} className="tmi-btn-ghost tmi-btn--sm">See Results</a>
    </div>
  );
}
