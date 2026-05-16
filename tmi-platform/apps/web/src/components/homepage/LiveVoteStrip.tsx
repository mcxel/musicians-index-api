"use client";

import { getBadgeStyle } from "@/theme/magazine-palette-engine";

type LiveVoteStripProps = {
  votes: string;
  label?: string;
  note?: string;
};

export default function LiveVoteStrip({
  votes,
  label = "Live Crown Vote",
  note = "Updates every 30 seconds · Final vote closes Sunday 11pm ET",
}: LiveVoteStripProps) {
  return (
    <div className="mb-8 rounded-lg border border-cyan-300/45 bg-black/45 p-6 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <span style={getBadgeStyle("hip-hop", "outline")}>{label}</span>
          <p className="mt-2 text-lg font-bold text-zinc-50">Vote for next week&apos;s #1</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-cyan-200 drop-shadow-[0_0_10px_rgba(0,255,255,0.7)]">{votes}</p>
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-400">votes live</p>
        </div>
      </div>
      <div className="h-1 w-full rounded bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
      <p className="mt-3 text-[11px] uppercase tracking-[0.1em] text-zinc-300">{note}</p>
    </div>
  );
}
