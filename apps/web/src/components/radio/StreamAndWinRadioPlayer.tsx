'use client';

import React, { useEffect, useState } from 'react';
import { Play, Pause, FastForward, Radio } from 'lucide-react';
import type { Submission } from '@/lib/submissions/SubmissionEngine';
import { usePlaylistEngine } from '@/hooks/usePlaylistEngine';
import type { PlaylistTrack } from '@/engines/PlaylistEngine';
import { getEquippedChassisId, subscribeMediaPlayerInventory } from '@/lib/artifacts/MediaPlayerInventory';
import { MEDIA_PLAYER_CHASSIS_REGISTRY, FREE_DEFAULT_CHASSIS_ID } from '@/lib/artifacts/PlaylistArtifactEngine';

export default function StreamAndWinRadioPlayer() {
  // Engine #1 bridge: legacy-compatible / pending PlaylistEngine migration.
  const playlist = usePlaylistEngine();
  const [tracks, setTracks] = useState<Submission[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Chassis skin convergence: inherit user's equipped player skin from canonical authority
  const [equippedChassisId, setEquippedChassisId] = useState<string>(() => {
    return getEquippedChassisId('guest') || FREE_DEFAULT_CHASSIS_ID;
  });

  useEffect(() => {
    return subscribeMediaPlayerInventory(() => {
      setEquippedChassisId(getEquippedChassisId('guest') || FREE_DEFAULT_CHASSIS_ID);
    });
  }, []);

  const chassis = (MEDIA_PLAYER_CHASSIS_REGISTRY as Record<string, any>)[equippedChassisId] ??
    MEDIA_PLAYER_CHASSIS_REGISTRY[FREE_DEFAULT_CHASSIS_ID];
  const accent = chassis?.accent ?? '#00FFFF';

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
            artist: s.submitterId,
            genre: s.genre ?? undefined,
            sourceUrl: s.url,
          }));
          playlist.hydrateQueue(queue);
          playlist.attachToRuntime({ roomId: 'stream-and-win-radio' });
          playlist.setVisibility('public');
        }
        setLoadState('ready');
      } catch (err) {
        console.error('Failed to load radio queue', err);
        setLoadState('error');
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
    const message =
      loadState === 'loading' ? 'Tuning Frequencies...'
      : loadState === 'error' ? 'Unable to load rotation. Refresh to retry.'
      : 'No songs in rotation yet. Submit music to enter this station.';
    return (
      <div
        className="w-full p-4 rounded-xl flex items-center justify-center gap-3 transition-colors duration-300"
        style={{
          background: '#050510',
          border: `1px solid ${accent}33`,
          boxShadow: `0 0 15px ${accent}11`,
        }}
      >
        <span style={{ fontSize: 16 }}>{chassis?.icon ?? '📻'}</span>
        <Radio className={loadState === 'loading' ? 'animate-pulse' : ''} style={{ color: accent, opacity: 0.6 }} size={16} />
        <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {message}
        </span>
      </div>
    );
  }

  return (
    <div
      className="w-full rounded-xl p-4 flex items-center gap-4 transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, #050510 0%, #0d0d24 100%)',
        border: `1px solid ${accent}55`,
        boxShadow: `0 0 25px ${accent}22`,
      }}
    >
      {/* Album Art / Visualizer with Chassis Icon */}
      <div
        className="w-16 h-16 rounded flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          background: '#02020a',
          border: `1px solid ${accent}44`,
        }}
      >
        {isPlaying && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{ background: `${accent}22` }}
          />
        )}
        <span style={{ fontSize: 20, zIndex: 1 }}>{chassis?.icon ?? '📻'}</span>
        <Radio size={14} style={{ color: isPlaying ? accent : 'rgba(255,255,255,0.4)', zIndex: 1 }} />
      </div>

      {/* Track Info */}
      <div className="flex-1 overflow-hidden">
        <div
          className="text-[9px] font-black tracking-[0.2em] uppercase mb-1"
          style={{ color: accent }}
        >
          STREAM & WIN RADIO · {chassis?.label?.toUpperCase() ?? 'STANDARD'} CHASSIS
        </div>
        <div className="text-sm font-bold text-white truncate">{currentTrack.title}</div>
        <div className="text-xs text-white/50 truncate">{currentTrack.genre || 'General'} • XP & Rotation Enabled</div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => (isPlaying ? playlist.pause() : playlist.play())}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          style={{
            background: accent,
            color: '#050510',
            boxShadow: `0 0 12px ${accent}66`,
          }}
        >
          {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current translate-x-0.5" />}
        </button>
        <button
          onClick={nextTrack}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: `1px solid ${accent}33`,
            color: '#fff',
          }}
        >
          <FastForward size={14} className="fill-white" />
        </button>
      </div>
    </div>
  );
}
