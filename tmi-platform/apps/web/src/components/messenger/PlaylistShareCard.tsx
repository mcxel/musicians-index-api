'use client';

import React from 'react';
import type { Message } from './types';

export function PlaylistShareCard({ message }: { message: Message }) {
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
      <div style={{ fontSize: 12, color: '#9aa0c2' }}>
        Playlist ID: {message.playlistId ?? 'N/A'}
      </div>
      <button
        style={{
          marginTop: 8,
          background: '#00d5ff',
          color: '#041122',
          border: 'none',
          borderRadius: 6,
          padding: '6px 10px',
          fontWeight: 700,
          cursor: 'pointer',
          fontSize: 12,
        }}
      >
        Open Playlist
      </button>
    </div>
  );
}
