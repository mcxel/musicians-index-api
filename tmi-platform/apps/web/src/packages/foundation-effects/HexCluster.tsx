"use client";

/**
 * Reusable structural shape for Discovery Belts and Genre selection.
 * Converts boring grid lists into visually engaging 1980s geometric clusters.
 */
export default function HexCluster({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-4 justify-center items-center p-6">
      {items.map((item, index) => (
        <div key={index} className="flex items-center justify-center w-32 h-28 bg-zinc-900 border border-fuchsia-500/30 text-zinc-300 font-bold uppercase tracking-wider shadow-lg hover:border-fuchsia-400 hover:shadow-[0_0_15px_rgba(255,0,255,0.4)] transition-all cursor-pointer transform hover:-translate-y-1" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}>
          <span className="text-center text-xs">{item}</span>
        </div>
      ))}
    </div>
  );
}
