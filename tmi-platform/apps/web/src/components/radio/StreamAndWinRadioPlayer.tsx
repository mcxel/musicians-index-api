'use client';

import React, { useEffect, useState } from 'react';
import { Play, Pause, FastForward, Radio } from 'lucide-react';
import type { Submission } from '@/lib/submissions/SubmissionEngine';
import { usePlaylistEngine } from '@/hooks/usePlaylistEngine';
import type { PlaylistTrack } from '@/engines/PlaylistEngine';

export default function StreamAndWinRadioPlayer() {
  // Engine #1 bridge: legacy-compatible / pending PlaylistEngine migration.
  const playlist = usePlaylistEngine();
  const [tracks, setTracks] = useState<Submission[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchRadioQueue() {
      try {
        const res = await fetch('/api/submissions?type=track&status=live&public=1&limit=50');
        const data = await res.json();
        if (data.submissions) {
          setTracks(data.submissions);
          const queue: PlaylistTrack[] = (data.submissions as Submission[]).map((s, i) => ({
            id: s.id ?? `${i}`,
            title: s.title ?? `Track ${i + 1}`,
            genre: s.genre ?? undefined,
          }));
          playlist.hydrateQueue(queue);
          playlist.attachToRuntime({ roomId: 'stream-and-win-radio' });
          playlist.setVisibility('public');
        }
      } catch (err) {
        console.error('Failed to load radio queue', err);
      }
    }
    fetchRadioQueue();
  }, []);

  const currentTrack = tracks[currentIndex];
  const isPlaying = playlist.state.isPlaying;

  const nextTrack = () => {
    if (!tracks.length) return;
    setCurrentIndex((prev) => (prev + 1) % tracks.length);
    playlist.next();
  };

  if (!currentTrack) {
    return (
      <div className="w-full bg-[#050510] border border-white/10 p-4 rounded-xl flex items-center justify-center gap-3">
        <Radio className="text-white/30 animate-pulse" />
        <span className="text-xs font-mono text-white/50 uppercase tracking-widest">Tuning Frequencies...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-[#050510] to-[#0a0a1a] border border-[#00FFFF]/30 rounded-xl p-4 flex items-center gap-4 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
      {/* Album Art / Visualizer */}
      <div className="w-16 h-16 bg-black rounded flex items-center justify-center border border-white/10 relative overflow-hidden">
        {isPlaying && <div className="absolute inset-0 bg-[#00FFFF]/20 animate-pulse" />}
        <Radio size={24} className={isPlaying ? "text-[#00FFFF]" : "text-white/30"} />
      </div>

      {/* Track Info */}
      <div className="flex-1 overflow-hidden">
        <div className="text-[9px] font-black text-[#FF2DAA] tracking-[0.2em] uppercase mb-1">STREAM & WIN RADIO</div>
        <div className="text-sm font-bold text-white truncate">{currentTrack.title}</div>
        <div className="text-xs text-white/50 truncate">{currentTrack.genre || 'General'} • XP Enabled</div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => (isPlaying ? playlist.pause() : playlist.play())}
          className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
        >
          {isPlaying ? <Pause size={18} className="fill-black" /> : <Play size={18} className="fill-black translate-x-0.5" />}
        </button>
        <button onClick={nextTrack} className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
          <FastForward size={14} className="fill-white" />
        </button>
      </div>
    </div>
  );
}