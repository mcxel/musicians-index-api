'use client';

import React, { useEffect, useState } from 'react';
import { useMediaBroadcast } from '@/components/media/MediaBroadcastEngine';

interface VideoPayload {
  title: string;
  artist: string;
  color: string;
  url?: string;
}

export default function SharedRoomVideoPanel() {
  const [activeVideo, setActiveVideo] = useState<VideoPayload | null>(null);
  const { setPipFeed } = useMediaBroadcast();

  useEffect(() => {
    const handleVideoStart = (e: Event) => {
      const customEvent = e as CustomEvent<VideoPayload>;
      setActiveVideo(customEvent.detail);
    };

    const handleVideoPause = () => {
      // We leave the video up but could trigger pause state syncing here
      setActiveVideo(null); 
    };

    window.addEventListener('PLAYLIST_VIDEO_START', handleVideoStart);
    window.addEventListener('PLAYLIST_VIDEO_PAUSE', handleVideoPause);

    return () => {
      window.removeEventListener('PLAYLIST_VIDEO_START', handleVideoStart);
      window.removeEventListener('PLAYLIST_VIDEO_PAUSE', handleVideoPause);
    };
  }, []);

  if (!activeVideo) return null;

  return (
    <div style={{ 
      width: '100%', 
      aspectRatio: '16/9', 
      background: '#000', 
      borderRadius: 12, 
      border: `2px solid ${activeVideo.color || '#00FFFF'}`,
      boxShadow: `0 0 30px ${activeVideo.color || '#00FFFF'}44`,
      overflow: 'hidden',
      position: 'relative',
      marginBottom: 20
    }}>
      {/* In production this takes the activeVideo.url via HLS/WebRTC player */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>▶️</div>
        <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '0.1em', fontFamily: 'var(--font-orbitron)' }}>{activeVideo.title}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>SHARED ROOM WATCH MODE ACTIVE</div>
      </div>
      <div style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 50 }}>
        <button 
          onClick={() => setPipFeed({ id: 'shared-room', title: activeVideo.title, url: activeVideo.url, layer: 'pip', isActive: true })}
          style={{ background: 'rgba(0,0,0,0.8)', border: `1px solid ${activeVideo.color || '#00FFFF'}`, color: activeVideo.color || '#00FFFF', fontSize: 10, fontWeight: 900, padding: '6px 12px', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.1em', transition: 'all 0.2s' }}
        >
          ↗ POP OUT (PiP)
        </button>
      </div>
      <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(230,48,0,0.8)', color: '#fff', fontSize: 10, fontWeight: 900, padding: '4px 8px', borderRadius: 4, letterSpacing: '0.1em' }}>
        LOBBY SYNC
      </div>
    </div>
  );
}