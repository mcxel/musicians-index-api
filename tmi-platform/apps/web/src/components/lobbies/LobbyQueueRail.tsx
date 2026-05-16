'use client';

export type LobbyQueueEntry = {
  slotId: string;
  performerId: string;
  performerName: string;
  state: 'waiting' | 'onDeck' | 'live' | 'complete';
  readyTimerLabel?: string;
  failedEntryCount?: number;
};

type LobbyQueueRailProps = {
  items?: Array<{ id: string; label: string }>;
  entries?: LobbyQueueEntry[];
  onJoinQueue?: (performerId: string, performerName: string) => void;
  onLeaveQueue?: (performerId: string) => void;
  onNextPerformer?: () => void;
  onHostOverride?: () => void;
  onFailedEntry?: (performerId: string) => void;
  showAdminControls?: boolean;
};

export default function LobbyQueueRail({
  items = [],
  entries = [],
  onNextPerformer,
  onHostOverride,
  showAdminControls = false,
}: LobbyQueueRailProps) {
  const resolvedItems = entries.length
    ? entries.map((entry) => ({ id: entry.slotId, label: `${entry.performerName} · ${entry.state}` }))
    : items;

  return (
    <section
      aria-label="Lobby queue rail"
      role="region"
      tabIndex={0}
      data-runtime="lobby-queue-rail"
      data-telemetry="lobby.queue.render"
      className="rounded-md border border-white/20 p-3"
    >
      <header className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Queue</h3>
        <button type="button" aria-label="Open queue controls" className="text-xs underline">
          Controls
        </button>
      </header>
      <ul className="space-y-1 text-xs">
        {resolvedItems.length === 0 ? (
          <li aria-live="polite">No queued performers</li>
        ) : (
          resolvedItems.map((item) => <li key={item.id}>{item.label}</li>)
        )}
      </ul>
      {showAdminControls ? (
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={onNextPerformer} className="text-[10px] underline">
            Next
          </button>
          <button type="button" onClick={onHostOverride} className="text-[10px] underline">
            Override
          </button>
        </div>
      ) : null}
    </section>
  );
}
