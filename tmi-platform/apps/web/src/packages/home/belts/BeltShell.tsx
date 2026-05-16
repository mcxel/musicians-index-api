import React from "react";

type BeltShellProps = {
  id: string;
  title: string;
  tone: "live" | "discovery" | "marketplace" | "events" | "default" | "editorial";
  kicker: string;
  children: React.ReactNode;
};

export default function BeltShell({ id, title, tone, kicker, children }: BeltShellProps) {
  return (
    <section id={id} className="relative w-full mt-24 pt-12 pb-16">
      {/* Belt Separation Background Layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900/40 to-zinc-950 pointer-events-none -z-10" />
      
      {/* Divider Glow Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent shadow-[0_0_25px_rgba(0,255,255,0.8)]" />
      
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6">
        <header className="mb-8 pl-4 border-l-4 border-cyan-400">
          <span className="block text-[11px] font-black tracking-[0.3em] uppercase text-cyan-400/80 mb-1">{kicker}</span>
          <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white drop-shadow-lg">{title}</h2>
        </header>
        <div className="relative w-full">{children}</div>
      </div>
    </section>
  );
}