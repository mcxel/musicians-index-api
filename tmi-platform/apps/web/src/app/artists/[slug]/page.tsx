'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ArtistDashboardPage({ params }: { params: { slug: string } }) {
  const [isLive, setIsLive] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-3xl text-cyan-400 font-black mb-6">COMMAND DECK: {params.slug}</h1>
      
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="border border-zinc-800 p-6 rounded-xl bg-zinc-900">
          <h2 className="text-xl mb-4">Broadcast Control</h2>
          <button 
            onClick={() => setIsLive(!isLive)} 
            className={`px-6 py-3 rounded font-bold uppercase w-full ${isLive ? 'bg-zinc-800 text-white' : 'bg-magenta-500 text-black'}`}
          >
            {isLive ? 'End Session' : 'Go Live (Bind Camera)'}
          </button>
          {isLive && <p className="mt-4 text-xs text-red-500 animate-pulse">● LIVE BROADCASTING...</p>}
        </div>

        <div className="border border-zinc-800 p-6 rounded-xl bg-zinc-900">
          <h2 className="text-xl mb-4">Live Event Telemetry</h2>
          <p className="text-sm text-zinc-500">{isLive ? 'Collecting shards...' : 'Waiting for broadcast...'}</p>
        </div>
      </div>

      <div className="border-t border-zinc-800 pt-6">
        <Link href={`/artists/${params.slug}`}>
          <button className="text-cyan-400 underline">Return to Public Profile</button>
        </Link>
      </div>
    </div>
  );
}