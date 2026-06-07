'use client';

import React from 'react';
import type { Message } from './types';

export function LobbyInviteCard({ message }: { message: Message }) {
  return (
    <div
      style={{
        border: '1px solid #2b2b52',
        borderRadius: 10,
        padding: 10,
        background: '#11112b',
      }}
    >
      <div style={{ fontSize: 11, color: '#9aa0c2', marginBottom: 6 }}>Lobby Invite</div>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{message.text ?? 'You were invited'}</div>
      <div style={{ fontSize: 12, color: '#9aa0c2' }}>
        Invite ID: {message.inviteId ?? 'N/A'}
      </div>
      <button
        style={{
          marginTop: 8,
          background: '#7ef9a9',
          color: '#042215',
          border: 'none',
          borderRadius: 6,
          padding: '6px 10px',
          fontWeight: 700,
          cursor: 'pointer',
          fontSize: 12,
        }}
      >
        Join Lobby
      </button>
    </div>
  );
}
