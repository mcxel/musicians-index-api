import React from 'react';
import LiveVideoShell from './LiveVideoShell';
import TMIOverlaySystem from './TMIOverlaySystem';

export default function OverseerDeck() {
  // Simulated live feed data auto-generated from testing seed logic
  const liveFeeds = [
    { id: '1', name: 'Tiara Griff (Cypher Arena)', isSpeaking: true, viewers: 4200 },
    { id: '2', name: 'DJ Record Ralph (Dance Party)', isSpeaking: false, viewers: 8900 },
    { id: '3', name: 'Fan Box 4A', isSpeaking: true, viewers: 12 },
    { id: '4', name: 'Monthly Idol Stage (Live)', isSpeaking: false, viewers: 15400 },
    { id: '5', name: 'Gregory Marcel (Monday Night)', isSpeaking: true, viewers: 12200 },
    { id: '6', name: 'Contestant 12 (Dirty Dozens)', isSpeaking: true, viewers: 3100 },
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-100 p-8 font-sans relative">
      <TMIOverlaySystem shape="cinematic-vignette" opacity={80} />
      
      <header className="relative z-10 flex justify-between items-end mb-8 border-b border-cyan-500/30 pb-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-400">
            Overseer Deck
          </h1>
          <p className="text-zinc-400 text-sm font-bold tracking-widest mt-2 uppercase">Global Live Feed Monitor</p>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-500 font-black text-xs uppercase tracking-widest">Recording All Feeds</span>
          </div>
        </div>
      </header>

      {/* Live Monitor Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {liveFeeds.map((feed) => (
          <div key={feed.id} className="group relative">
            <LiveVideoShell performerName={feed.name} isSpeaking={feed.isSpeaking}>
              <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                 {/* Socket Feed Mount Target for Copilot */}
                 <span className="text-zinc-700 font-mono text-sm">Waiting for socket stream...</span>
              </div>
            </LiveVideoShell>
          </div>
        ))}
      </div>
    </div>
  );
}