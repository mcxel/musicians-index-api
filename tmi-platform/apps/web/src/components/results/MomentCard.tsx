'use client';
// MomentCard.tsx — Single highlight moment card with type badge and clip
// Copilot wires: data from highlight-capture-bot output
// Proof: moment renders with correct type, timestamp, reactions
export function MomentCard({ type, timestamp, description, clipUrl, reactionCount }: { type: string; timestamp: Date; description: string; clipUrl?: string; reactionCount?: number }) {
  return (
    <div className="tmi-moment-card">
      <div className="tmi-moment-card__type-badge">{type}</div>
      <div className="tmi-moment-card__time">{new Date(timestamp).toLocaleTimeString()}</div>
      <div className="tmi-moment-card__desc">{description}</div>
      {reactionCount && <div className="tmi-moment-card__reactions">{reactionCount} reactions</div>}
      {clipUrl && <button className="tmi-btn-ghost tmi-btn--sm">▶ Watch Clip</button>}
    </div>
  );
}
