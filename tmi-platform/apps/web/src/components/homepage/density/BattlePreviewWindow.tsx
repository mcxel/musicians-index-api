"use client";

interface BattlePreviewWindowProps {
  title: string;
  entries: string;
  heat: string;
  eta: string;
}

export default function BattlePreviewWindow({ title, entries, heat, eta }: BattlePreviewWindowProps) {
  return (
    <div className="rounded-xl border border-fuchsia-300/40 bg-black/90 p-3 shadow-[0_0_24px_rgba(217,70,239,0.28)] backdrop-blur-sm">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-fuchsia-200">Battle Preview</p>
      <p className="mt-1 text-[11px] font-black uppercase tracking-[0.08em] text-white">{title}</p>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        <div className="rounded border border-fuchsia-300/20 bg-fuchsia-400/10 px-2 py-1">
          <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-300">Entries</p>
          <p className="text-[10px] font-bold uppercase text-fuchsia-100">{entries}</p>
        </div>
        <div className="rounded border border-cyan-300/20 bg-cyan-400/10 px-2 py-1">
          <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-300">Heat</p>
          <p className="text-[10px] font-bold uppercase text-cyan-100">{heat}</p>
        </div>
        <div className="rounded border border-amber-300/20 bg-amber-400/10 px-2 py-1">
          <p className="text-[8px] uppercase tracking-[0.12em] text-zinc-300">Start</p>
          <p className="text-[10px] font-bold uppercase text-amber-100">{eta}</p>
        </div>
      </div>
    </div>
  );
}
