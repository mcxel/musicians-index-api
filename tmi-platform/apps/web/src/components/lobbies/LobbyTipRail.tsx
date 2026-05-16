'use client';

type LobbyTipRailProps = {
  totalTipsCents?: number;
  tipTotal?: number;
  onSendTip?: (amount: number) => void;
};

export default function LobbyTipRail({ totalTipsCents = 0, tipTotal, onSendTip }: LobbyTipRailProps) {
  const effectiveTipsCents = typeof tipTotal === 'number' ? tipTotal : totalTipsCents;
  const dollars = (effectiveTipsCents / 100).toFixed(2);

  return (
    <section
      aria-label="Lobby tip rail"
      role="region"
      tabIndex={0}
      data-runtime="lobby-tip-rail"
      data-telemetry="lobby.tips.render"
      className="rounded-md border border-white/20 p-3"
    >
      <header className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Tips</h3>
        <button type="button" aria-label="Open tip actions" className="text-xs underline">
          Tip
        </button>
      </header>
      <p aria-live="polite" className="text-xs">
        Total tips: ${dollars}
      </p>
      {onSendTip ? (
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={() => onSendTip(100)} className="text-[10px] underline">$1</button>
          <button type="button" onClick={() => onSendTip(500)} className="text-[10px] underline">$5</button>
        </div>
      ) : null}
    </section>
  );
}
