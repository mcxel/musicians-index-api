'use client';

import React from 'react';
import Link from 'next/link';
import type { Message } from './types';

export function PlaylistShareCard({ message }: { message: Message }) {
  const playlistId = message.playlistId;
  const href = playlistId
    ? `/hub/fan?drawer=playlist&playlistId=${encodeURIComponent(playlistId)}`
    : '/hub/fan?drawer=playlist';

  return (
    <div
      style={{
        border: '1px solid #2b2b52',
        borderRadius: 10,
        padding: 10,
        background: '#11112b',
      }}
    >
      <div style={{ fontSize: 11, color: '#9aa0c2', marginBottom: 6 }}>Playlist Share</div>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{message.text ?? 'Shared playlist'}</div>
      <div style={{ fontSize: 12, color: '#9aa0c2', marginBottom: 8 }}>
        {playlistId ? `Playlist ID: ${playlistId}` : 'No playlistId on this message'}
      </div>
      <Link
        href={href}
        style={{
          display: 'inline-block',
          marginTop: 4,
          background: '#00d5ff',
          color: '#041122',
          border: 'none',
          borderRadius: 6,
          padding: '6px 10px',
          fontWeight: 700,
          fontSize: 12,
          textDecoration: 'none',
        }}
      >
        Open Playlist
      </Link>
    </div>
  );
}
