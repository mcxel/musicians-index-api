'use client';

import Link from 'next/link';

export default function TmiHomebookJumpNav() {
  const pages = ['1', '1-2', '2', '3', '4', '5'];
  
  return (
    <nav className="flex items-center gap-2 border border-white/10 bg-black/60 px-4 py-2.5 rounded-2xl backdrop-blur-md shadow-[0_0_25px_rgba(0,0,0,0.8)] pointer-events-auto">
      <span className="text-[9px] uppercase tracking-[0.2em] text-fuchsia-400 font-black mr-1 drop-shadow-[0_0_5px_rgba(217,70,239,0.5)]">Page</span>
      {pages.map(p => (
        <Link key={p} href={`/home/${p}`} className="h-6 w-6 flex items-center justify-center rounded-md border border-white/10 text-[10px] font-bold text-zinc-300 hover:bg-fuchsia-500/30 hover:border-fuchsia-400 hover:text-white transition-all duration-300">
          {p}
        </Link>
      ))}
    </nav>
  );
}