"use client";

import { useEffect, useState } from "react";

export default function HomepageAnimatedStats({ label, target }: { label: string; target: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const duration = 900;
    const id = window.setInterval(() => {
      const elapsed = Date.now() - started;
      const ratio = Math.min(1, elapsed / duration);
      setValue(Math.round(target * ratio));
      if (ratio >= 1) window.clearInterval(id);
    }, 16);
    return () => window.clearInterval(id);
  }, [target]);

  return (
    <div className="rounded-xl border border-amber-300/40 bg-amber-500/10 px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-100">{label}</p>
      <p className="text-xl font-black text-white">{value.toLocaleString()}</p>
    </div>
  );
}
