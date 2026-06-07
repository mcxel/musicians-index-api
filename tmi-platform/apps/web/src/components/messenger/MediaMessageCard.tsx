'use client';

import React from 'react';
import type { Message } from './types';

export function MediaMessageCard({ message }: { message: Message }) {
  const mime = message.mediaMimeType ?? '';
  const url = message.mediaUrl;

  if (!url) {
    return (
      <div style={{ fontSize: 12, color: '#9aa0c2' }}>
        Media attached (no preview URL)
      </div>
    );
  }

  if (message.messageType === 'audio' || mime.startsWith('audio/')) {
    return <audio controls src={url} style={{ width: '100%' }} />;
  }

  if (message.messageType === 'video' || mime.startsWith('video/')) {
    return <video controls src={url} style={{ width: '100%', borderRadius: 8 }} />;
  }

  if (message.messageType === 'image' || mime.startsWith('image/')) {
    return (
      <img
        src={url}
        alt="Shared media"
        style={{ width: '100%', borderRadius: 8, border: '1px solid #2f2f5a' }}
      />
    );
  }

  return (
    <div style={{ fontSize: 12, color: '#9aa0c2' }}>
      Media file shared
    </div>
  );
}
