'use client';
// PrizeAnnouncementCard.tsx — Prize/reward announcement in the preview slot
// Uses same preview slot system — consistent with all other preview modes
// Copilot wires: triggered by stage-director-bot on prize event
export function PrizeAnnouncementCard({ prizeName, prizeValue, winnerName }: { prizeName: string; prizeValue?: string; winnerName?: string }) {
  return (
    <div className="tmi-prize-card">
      <div className="tmi-prize-card__crown">👑</div>
      <div className="tmi-prize-card__label">PRIZE UNLOCKED</div>
      <div className="tmi-prize-card__name">{prizeName}</div>
      {prizeValue && <div className="tmi-prize-card__value">{prizeValue}</div>}
      {winnerName && <div className="tmi-prize-card__winner">Won by {winnerName}</div>}
    </div>
  );
}
