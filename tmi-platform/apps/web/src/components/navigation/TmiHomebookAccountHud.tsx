'use client';

import Link from 'next/link';

export default function TmiHomebookAccountHud({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  return (
    <div className="flex items-center gap-4 border border-white/10 bg-black/60 px-4 py-2.5 rounded-2xl backdrop-blur-md shadow-[0_0_25px_rgba(0,0,0,0.8)] pointer-events-auto">
      {isLoggedIn ? (
        <>
          <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-200 hover:text-white transition-colors">My Account</Link>
          <Link href="/logout" className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 hover:text-red-400 transition-colors">Log Out</Link>
        </>
      ) : (
        <>
          <Link href="/signup" className="text-[10px] font-black uppercase tracking-[0.15em] text-cyan-300 hover:text-cyan-100 transition-all hover:drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">Sign Up</Link>
          <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.15em] text-fuchsia-300 hover:text-fuchsia-100 transition-all hover:drop-shadow-[0_0_5px_rgba(217,70,239,0.8)]">Log In</Link>
        </>
      )}
      <div className="h-5 w-px bg-white/20" />
      <button className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 border border-white/10 text-[9px] shadow-inner hover:bg-zinc-700 transition-colors" aria-label="Toggle Region">
        US
      </button>
      <Link href={isLoggedIn ? "/dashboard" : "/login"} className="h-7 w-7 rounded-full bg-gradient-to-tr from-cyan-500 to-fuchsia-500 p-[2px] hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(217,70,239,0.4)]" aria-label="Profile">
        <div className="h-full w-full rounded-full bg-black flex items-center justify-center text-[8px] font-black tracking-tighter text-white">TMI</div>
      </Link>
    </div>
  );
}