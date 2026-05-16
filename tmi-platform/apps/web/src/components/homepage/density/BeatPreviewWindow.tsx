"use client";

interface BeatPreviewWindowProps {
  title: string;
  bpm: number;
  genre: string;
}

export default function BeatPreviewWindow({ title, bpm, genre }: BeatPreviewWindowProps) {
  return (
    <div className="rounded-xl border border-amber-300/40 bg-black/90 p-3 shadow-[0_0_24px_rgba(245,158,11,0.28)] backdrop-blur-sm">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-amber-200">Beat Preview</p>
      <p className="mt-1 text-[11px] font-black uppercase tracking-[0.08em] text-white">{title}</p>
      <div className="mt-2 flex items-center gap-2 text-[10px] uppercase">
        <span className="rounded border border-amber-300/25 bg-amber-400/10 px-2 py-1 text-amber-100">{bpm} BPM</span>
        <span className="rounded border border-cyan-300/25 bg-cyan-400/10 px-2 py-1 text-cyan-100">{genre}</span>
      </div>
    </div>
  );
}
