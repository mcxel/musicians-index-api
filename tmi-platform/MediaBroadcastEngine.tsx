'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type MediaLayer = 'main' | 'pip' | 'shared';

export interface BroadcastFeed {
  id: string;
  layer: MediaLayer;
  title: string;
  url?: string;
  isActive: boolean;
}

interface MediaBroadcastContextType {
  activeFeeds: BroadcastFeed[];
  setMainFeed: (feed: Partial<BroadcastFeed>) => void;
  setPipFeed: (feed: Partial<BroadcastFeed> | null) => void;
  broadcastToLobbyWall: (feed: BroadcastFeed) => void;
}

const MediaBroadcastContext = createContext<MediaBroadcastContextType | null>(null);

export function MediaBroadcastProvider({ children }: { children: React.ReactNode }) {
  const [activeFeeds, setActiveFeeds] = useState<BroadcastFeed[]>([]);

  // Central listener for Playlist events upgrading to video feeds
  useEffect(() => {
    const handlePlaylistVideo = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      setPipFeed({ id: 'playlist-pip', title: customEvent.detail.title, url: customEvent.detail.url });
    };
    window.addEventListener('PLAYLIST_VIDEO_START', handlePlaylistVideo);
    return () => window.removeEventListener('PLAYLIST_VIDEO_START', handlePlaylistVideo);
  }, []);

  const updateFeedLayer = (layer: MediaLayer, feed: Partial<BroadcastFeed> | null) => {
    setActiveFeeds(prev => {
      const filtered = prev.filter(f => f.layer !== layer);
      if (feed) {
        return [...filtered, { ...feed, layer, id: feed.id || Math.random().toString(), isActive: true } as BroadcastFeed];
      }
      return filtered;
    });
  };

  const setMainFeed = (feed: Partial<BroadcastFeed>) => updateFeedLayer('main', feed);
  const setPipFeed = (feed: Partial<BroadcastFeed> | null) => updateFeedLayer('pip', feed);
  const broadcastToLobbyWall = (feed: BroadcastFeed) => window.dispatchEvent(new CustomEvent('LOBBY_WALL_BROADCAST', { detail: feed }));

  return (
    <MediaBroadcastContext.Provider value={{ activeFeeds, setMainFeed, setPipFeed, broadcastToLobbyWall }}>
      {children}
      {/* Universal PiP Renderer (Layer 2) */}
      <PictureInPictureRenderer feeds={activeFeeds.filter(f => f.layer === 'pip')} onClose={() => setPipFeed(null)} />
    </MediaBroadcastContext.Provider>
  );
}

export const useMediaBroadcast = () => {
  const ctx = useContext(MediaBroadcastContext);
  if (!ctx) throw new Error('useMediaBroadcast must be used within MediaBroadcastProvider');
  return ctx;
};

function PictureInPictureRenderer({ feeds, onClose }: { feeds: BroadcastFeed[], onClose: () => void }) {
  if (feeds.length === 0) return null;
  const feed = feeds[0];

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, width: 340, aspectRatio: '16/9', background: 'rgba(5,8,21,0.95)', border: '2px solid #00FFFF', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,229,255,0.3)', zIndex: 9999, overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
      <div style={{ padding: '6px 12px', background: 'rgba(0,229,255,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 900, color: '#00FFFF', letterSpacing: '0.1em' }}>PiP: {feed.title}</span>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14 }}>×</button>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 12, position: 'relative' }}>
        {feed.url ? <video src={feed.url} autoPlay controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontFamily: 'var(--font-orbitron)' }}>MEDIA CONNECTED</span>}
      </div>
    </div>
  );
}