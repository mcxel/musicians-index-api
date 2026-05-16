"use client";

interface CypherPreviewWindowProps {
  title: string;
  queue: string;
  wait: string;
  status: string;
}

export default function CypherPreviewWindow({ title, queue, wait, status }: CypherPreviewWindowProps) {
  return (
    <div className="rounded-xl border border-cyan-300/40 bg-black/90 p-3 shadow-[0_0_24px_rgba(34,211,238,0.28)] backdrop-blur-sm">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-cyan-200">Cypher Preview</p>
      <p className="mt-1 text-[11px] font-black uppercase tracking-[0.08em] text-white">{title}</p>
      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] uppercase">
        <span className="rounded border border-emerald-300/25 bg-emerald-400/10 px-2 py-1 text-emerald-100">{status}</span>
        <span className="rounded border border-cyan-300/25 bg-cyan-400/10 px-2 py-1 text-cyan-100">Queue {queue}</span>
        <span className="rounded border border-violet-300/25 bg-violet-400/10 px-2 py-1 text-violet-100">Wait {wait}</span>
      </div>
    </div>
  );
}
