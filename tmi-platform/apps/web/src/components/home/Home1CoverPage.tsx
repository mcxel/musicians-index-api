"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const COLORS = ["#ffffff", "#FFD700", "#00FF88", "#FF2020"];

export default function Home1CoverPage() {
  const [colorIdx, setColorIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setColorIdx(i => (i + 1) % COLORS.length), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative w-full pt-6 pb-12 px-4 sm:px-8 z-20 flex flex-col items-center">
      {/* Magazine Badges */}
      <div className="flex gap-4 mb-6">
        <div className="bg-[#FF2020]/20 border border-[#FF2020] text-[#FF2020] px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase flex items-center gap-2 shadow-[0_0_15px_rgba(255,32,32,0.4)]">
          <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} className="w-2 h-2 bg-[#FF2020] rounded-full" />
          VOTING LIVE
        </div>
        <div className="bg-[#FFD700]/20 border border-[#FFD700] text-[#FFD700] px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase shadow-[0_0_15px_rgba(255,215,0,0.4)]">
          👑 CROWN UPDATING
        </div>
      </div>

      {/* Typewriter Masthead */}
      <motion.h1 
        className="text-5xl sm:text-7xl md:text-9xl font-black text-center tracking-tighter uppercase mb-8"
        style={{ color: COLORS[colorIdx], transition: "color 0.5s ease" }}
      >
        THE MUSICIAN'S INDEX
      </motion.h1>

      {/* Arena Triangle (Promoted above the fold) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mt-8">
        <Link href="/battles/live" className="group relative overflow-hidden rounded-2xl border border-[#FF2DAA]/40 bg-[#FF2DAA]/10 p-8 text-center transition-all hover:bg-[#FF2DAA]/20 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,45,170,0.3)]">
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">⚔️</div>
          <div className="text-xl font-black text-[#FF2DAA] tracking-widest">BATTLE ARENA</div>
        </Link>
        <Link href="/rooms/cypher-arena" className="group relative overflow-hidden rounded-2xl border border-[#00FFFF]/40 bg-[#00FFFF]/10 p-8 text-center transition-all hover:bg-[#00FFFF]/20 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,255,255,0.3)]">
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎤</div>
          <div className="text-xl font-black text-[#00FFFF] tracking-widest">CYPHER ARENA</div>
        </Link>
        <Link href="/rooms/challenge-arena" className="group relative overflow-hidden rounded-2xl border border-[#FFD700]/40 bg-[#FFD700]/10 p-8 text-center transition-all hover:bg-[#FFD700]/20 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,215,0,0.3)]">
          <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎵</div>
          <div className="text-xl font-black text-[#FFD700] tracking-widest">CHALLENGE ARENA</div>
        </Link>
      </div>

      {/* Editorial Belt */}
      <div className="w-full max-w-6xl mt-16 border-t border-white/10 pt-8">
        <div className="text-[#FF2DAA] text-xs font-black tracking-[0.3em] mb-6">THIS WEEK IN TMI</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="border border-white/10 bg-white/5 p-6 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
            <div className="text-[#00FFFF] text-[9px] font-bold tracking-widest mb-2">ARTIST SPOTLIGHT</div>
            <h3 className="text-lg font-bold text-white leading-tight mb-2">Ray Journey Builds His Empire</h3>
            <p className="text-xs text-white/50">From open mic to sold-out arena — the blueprint nobody told you about.</p>
          </article>
          <article className="border border-white/10 bg-white/5 p-6 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
            <div className="text-[#FFD700] text-[9px] font-bold tracking-widest mb-2">BATTLE RECAP</div>
            <h3 className="text-lg font-bold text-white leading-tight mb-2">Nova Cipher: The Science of the Cypher</h3>
            <p className="text-xs text-white/50">Why Nova's battle style is rewriting the rules for every performer.</p>
          </article>
          <article className="border border-white/10 bg-white/5 p-6 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
            <div className="text-[#00FF88] text-[9px] font-bold tracking-widest mb-2">INDUSTRY</div>
            <h3 className="text-lg font-bold text-white leading-tight mb-2">BeatMarket: The Producers Are Here</h3>
            <p className="text-xs text-white/50">12,000 beats. One marketplace. Built specifically for TMI creators.</p>
          </article>
        </div>
      </div>
    </section>
  );
}