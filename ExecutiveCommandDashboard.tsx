import React from 'react';
import Link from 'next/link';

export interface StatCard {
  label: string;
  value: string | number;
  trend?: string;
}

export interface ExecutiveCommandDashboardProps {
  operatorName: string;
  commandTitle: string;
  accentColor: 'cyan' | 'magenta' | 'emerald' | 'gold';
  subtitle: string;
  statusPill: string;
  statCards: StatCard[];
  feedObserverTitle: string;
}

export default function ExecutiveCommandDashboard({
  operatorName,
  commandTitle,
  accentColor,
  subtitle,
  statusPill,
  statCards,
  feedObserverTitle,
}: ExecutiveCommandDashboardProps) {
  // Color mapping for Tailwind to prevent purge issues and maintain the TMI Neon 80s style
  const colorMaps = {
    cyan: 'border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]',
    magenta: 'border-fuchsia-500 text-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.4)]',
    emerald: 'border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]',
    gold: 'border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]',
  };

  const bgGlowMaps = {
    cyan: 'bg-cyan-500/10',
    magenta: 'bg-fuchsia-500/10',
    emerald: 'bg-emerald-500/10',
    gold: 'bg-amber-500/10',
  };

  const activeTheme = colorMaps[accentColor];
  const activeBgGlow = bgGlowMaps[accentColor];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-white/30 p-4 md:p-8 relative overflow-hidden">
      {/* CRT Scanline Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] z-50 opacity-20" />
      
      <div className={`max-w-7xl mx-auto rounded-3xl border-2 ${activeTheme} bg-black/60 backdrop-blur-2xl p-6 md:p-10 relative z-10`}>
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-2">
              <span className={activeTheme.split(' ')[1]}>{commandTitle}</span>
            </h1>
            <p className="text-zinc-400 font-mono text-sm tracking-widest uppercase">
              OPERATOR: <span className="text-white font-bold">{operatorName}</span> | {subtitle}
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-full border ${activeTheme} ${activeBgGlow} font-black text-xs uppercase tracking-widest flex items-center`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse mr-2" />
              {statusPill}
            </div>
            <Link href="/admin" className="px-4 py-2 border border-zinc-700 hover:bg-zinc-800 rounded-full font-mono text-xs uppercase transition-colors">
              Return to Admin
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Stats & Operations */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statCards.map((stat, idx) => (
                <div key={idx} className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
                  <span className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mb-2">{stat.label}</span>
                  <span className="text-3xl font-black text-white">{stat.value}</span>
                  {stat.trend && <span className={`text-[10px] font-bold uppercase mt-2 ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>{stat.trend}</span>}
                </div>
              ))}
            </div>

            {/* System Observatories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Active Truth State */}
              <div className={`border border-zinc-800 rounded-2xl p-6 bg-gradient-to-br from-zinc-900 to-black`}>
                <h3 className="text-xs font-black uppercase text-zinc-400 tracking-widest border-b border-zinc-800 pb-3 mb-4">Live Platform State</h3>
                <ul className="space-y-3 font-mono text-xs">
                  <li className="flex justify-between"><span className="text-zinc-500">Route Health:</span> <span className="text-emerald-400">200 OK</span></li>
                  <li className="flex justify-between"><span className="text-zinc-500">Active Homepage:</span> <span className="text-white">/home/2 (Discovery)</span></li>
                  <li className="flex justify-between"><span className="text-zinc-500">Global Focus Artist:</span> <span className="text-white">Tiara Griff</span></li>
                  <li className="flex justify-between"><span className="text-zinc-500">Trending Genre:</span> <span className="text-white">Hip-Hop / Cypher</span></li>
                  <li className="flex justify-between"><span className="text-zinc-500">Build Status:</span> <span className="text-amber-400">Awaiting Validation</span></li>
                </ul>
              </div>

              {/* Conductor & Bot Diagnostics */}
              <div className={`border border-zinc-800 rounded-2xl p-6 bg-gradient-to-br from-zinc-900 to-black`}>
                <h3 className="text-xs font-black uppercase text-zinc-400 tracking-widest border-b border-zinc-800 pb-3 mb-4">Conductor Analytics</h3>
                <ul className="space-y-3 font-mono text-xs">
                  <li className="flex justify-between"><span className="text-zinc-500">Michael Charlie:</span> <span className="text-emerald-400">ONLINE</span></li>
                  <li className="flex justify-between"><span className="text-zinc-500">Julius Instances:</span> <span className="text-white">14 Active</span></li>
                  <li className="flex justify-between"><span className="text-zinc-500">Artifact Count:</span> <span className="text-white">1,042 Sealed</span></li>
                  <li className="flex justify-between"><span className="text-zinc-500">Errors/Warnings:</span> <span className="text-cyan-400">0 / 3</span></li>
                  <li className="flex justify-between"><span className="text-zinc-500">Last Proof:</span> <span className="text-zinc-300">{new Date().toISOString().split('T')[0]}</span></li>
                </ul>
              </div>

            </div>
          </div>

          {/* Right Column: Feed Observer & Navigation */}
          <div className="space-y-8">
            
            {/* Home Feed Observer */}
            <div className={`border-2 ${activeTheme} ${activeBgGlow} rounded-2xl p-6 h-64 flex flex-col relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-10 bg-[url('/noise.png')] mix-blend-overlay"></div>
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 z-10 flex items-center">
                <span className="w-2 h-2 rounded-full bg-current animate-ping mr-2" />
                {feedObserverTitle}
              </h3>
              <div className="flex-1 bg-black/50 rounded-xl border border-white/10 p-4 font-mono text-[10px] text-zinc-300 overflow-y-auto z-10">
                <p className="mb-2 text-zinc-500">// INITIALIZING FEED OBSERVER...</p>
                <p className="mb-2 text-emerald-400">&gt; Connection to TMI_ARENA_ENGINE established.</p>
                <p className="mb-2 text-white">&gt; 12 Live Rooms detected.</p>
                <p className="mb-2 text-white">&gt; 3,412 Active Viewers sync confirmed.</p>
                <p className="mb-2 text-white">&gt; Julius behavior bot rotating 4 items.</p>
                <p className="text-cyan-400 animate-pulse">&gt; WAITING FOR DATA PACKETS_</p>
              </div>
            </div>

            {/* Quick Links Matrix */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-widest mb-4">Jump Gates</h3>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/home/1" className="block text-center py-3 bg-black border border-zinc-800 rounded-lg hover:border-zinc-600 font-mono text-xs transition-all hover:text-white text-zinc-400">/home/1</Link>
                <Link href="/home/2" className="block text-center py-3 bg-black border border-zinc-800 rounded-lg hover:border-zinc-600 font-mono text-xs transition-all hover:text-white text-zinc-400">/home/2</Link>
                <Link href="/home/3" className="block text-center py-3 bg-black border border-zinc-800 rounded-lg hover:border-zinc-600 font-mono text-xs transition-all hover:text-white text-zinc-400">/home/3</Link>
                <Link href="/home/4" className="block text-center py-3 bg-black border border-zinc-800 rounded-lg hover:border-zinc-600 font-mono text-xs transition-all hover:text-white text-zinc-400">/home/4</Link>
                <Link href="/home/5" className="block text-center py-3 bg-black border border-zinc-800 rounded-lg hover:border-zinc-600 font-mono text-xs transition-all hover:text-white text-zinc-400 col-span-2">/home/5 (Charts)</Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}