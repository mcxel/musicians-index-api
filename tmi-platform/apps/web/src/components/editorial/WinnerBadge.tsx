// tmi-platform/apps/web/src/components/editorial/WinnerBadge.tsx
'use client';

type WinnerBadgeProps = {
  winner: {
    stageName?: string;
  } | null;
};

export function WinnerBadge({ winner }: WinnerBadgeProps) {
  if (!winner?.stageName) {
    return null;
  }

  return (
    <div className="my-8 flex justify-center">
      <div className="rounded-lg bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 p-4 text-center text-gray-900 shadow-lg">
        <p className="text-sm font-bold uppercase tracking-wider">Winner</p>
        <p className="text-2xl font-extrabold">{winner.stageName}</p>
      </div>
    </div>
  );
}
