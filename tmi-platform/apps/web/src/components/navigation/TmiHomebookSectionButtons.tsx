'use client';

import Link from 'next/link';

export default function TmiHomebookSectionButtons() {
  const sections = [
    { name: 'Magazine', route: '/magazine' },
    { name: 'Charts', route: '/charts' },
    { name: 'Cypher', route: '/cypher' },
    { name: 'Live', route: '/live' },
    { name: 'Store', route: '/store' },
    { name: 'Artist Hub', route: '/dashboard/artist' },
    { name: 'Fan Hub', route: '/dashboard/fan' },
  ];
  
  return (
    <nav className="flex flex-wrap items-center gap-3 border border-white/10 bg-black/60 px-5 py-2.5 rounded-2xl backdrop-blur-md shadow-[0_0_25px_rgba(0,0,0,0.8)] pointer-events-auto">
      <Link href="/" className="text-cyan-400 font-black italic tracking-tighter text-lg mr-2 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] hover:scale-105 transition-transform">TMI</Link>
      <div className="h-5 w-px bg-white/20 mx-1" />
      {sections.map(s => (
        <Link key={s.name} href={s.route} className="text-[10px] uppercase tracking-[0.15em] font-black text-zinc-300 hover:text-cyan-300 transition-all duration-300 hover:drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
          {s.name}
        </Link>
      ))}
    </nav>
  );
}