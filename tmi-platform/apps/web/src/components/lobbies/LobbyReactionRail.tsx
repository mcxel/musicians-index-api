'use client';

export type LobbyReactionType = 'fire' | 'heart' | 'star' | 'mic' | 'crown' | 'shock';

type LobbyReactionRailProps = {
  reactions?: Array<{ id: string; emoji: string; count: number }>;
  onSendReaction?: (type: LobbyReactionType) => void;
  reactionCount?: number;
};

export default function LobbyReactionRail({
  reactions = [],
  onSendReaction,
  reactionCount,
}: LobbyReactionRailProps) {
  const resolvedReactions = reactions.length
    ? reactions
    : typeof reactionCount === 'number'
      ? [{ id: 'agg', emoji: '🔥', count: reactionCount }]
      : [];

  return (
    <section
      aria-label="Lobby reaction rail"
      role="region"
      tabIndex={0}
      data-runtime="lobby-reaction-rail"
      data-telemetry="lobby.reactions.render"
      className="rounded-md border border-white/20 p-3"
    >
      <header className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Reactions</h3>
        <button type="button" aria-label="Open reaction controls" className="text-xs underline">
          Manage
        </button>
      </header>
      <ul className="flex flex-wrap gap-2 text-xs">
        {resolvedReactions.length === 0 ? (
          <li aria-live="polite">No live reactions</li>
        ) : (
          resolvedReactions.map((r) => (
            <li key={r.id} className="rounded border border-white/20 px-2 py-1">
              {r.emoji} {r.count}
            </li>
          ))
        )}
      </ul>
      {onSendReaction ? (
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={() => onSendReaction('fire')} className="text-[10px] underline">Fire</button>
          <button type="button" onClick={() => onSendReaction('heart')} className="text-[10px] underline">Heart</button>
        </div>
      ) : null}
    </section>
  );
}
