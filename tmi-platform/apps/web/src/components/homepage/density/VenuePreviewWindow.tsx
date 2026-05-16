"use client";

interface VenuePreviewWindowProps {
  name: string;
  occupancy: number;
}

export default function VenuePreviewWindow({ name, occupancy }: VenuePreviewWindowProps) {
  return (
    <div className="rounded-xl border border-emerald-300/40 bg-black/90 p-3 shadow-[0_0_24px_rgba(16,185,129,0.28)] backdrop-blur-sm">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-200">Venue Preview</p>
      <p className="mt-1 text-[11px] font-black uppercase tracking-[0.08em] text-white">{name}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-emerald-300/90" style={{ width: `${Math.max(0, Math.min(100, occupancy))}%` }} />
      </div>
      <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-zinc-300">Occupancy {occupancy}%</p>
    </div>
  );
}
