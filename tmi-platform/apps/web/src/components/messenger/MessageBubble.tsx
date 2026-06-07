'use client';

import React from 'react';
import type { Message } from './types';
import { useConversationStore } from './ConversationStore';
import { MediaMessageCard } from './MediaMessageCard';
import { PlaylistShareCard } from './PlaylistShareCard';
import { LobbyInviteCard } from './LobbyInviteCard';

function SafePlaceholder({ label }: { label: string }) {
  return (
    <div
      style={{
        border: '1px dashed #4a4a6e',
        borderRadius: 8,
        padding: 10,
        color: '#a5a5c7',
        fontSize: 12,
        background: '#121231',
      }}
    >
      {label}
    </div>
  );
}

function canRenderPublicMedia(message: Message): boolean {
  return (
    message.moderationStatus === 'approved' &&
    (message.scanStatus === 'clean' || message.adminApproved === true)
  );
}

export function MessageBubble({ message }: { message: Message }) {
  const { currentUserId, setSafetyReport } = useConversationStore();
  const isOwn = message.senderId === currentUserId;

  const bubbleStyle: React.CSSProperties = {
    maxWidth: '72%',
    background: isOwn ? '#1a2a48' : '#171733',
    border: `1px solid ${isOwn ? '#2f5d9a' : '#2b2b52'}`,
    borderRadius: isOwn ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
    padding: 10,
    color: '#fff',
  };

  let content: React.ReactNode = null;

  switch (message.messageType) {
    case 'text':
    case 'emoji':
    case 'system-event':
      content = <div style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>{message.text ?? ''}</div>;
      break;
    case 'playlist-share':
      content = canRenderPublicMedia(message) ? (
        <PlaylistShareCard message={message} />
      ) : isOwn ? (
        <SafePlaceholder label="Playlist share pending approval" />
      ) : (
        <SafePlaceholder label="Playlist unavailable" />
      );
      break;
    case 'lobby-invite':
    case 'room-invite':
      content = <LobbyInviteCard message={message} />;
      break;
    case 'image':
    case 'video':
    case 'audio':
    case 'beat-preview':
    case 'memory-artifact':
      content = canRenderPublicMedia(message) ? (
        <MediaMessageCard message={message} />
      ) : isOwn ? (
        <SafePlaceholder label="Pending Approval" />
      ) : (
        <SafePlaceholder label="Media unavailable" />
      );
      break;
    default:
      content = <SafePlaceholder label="Unsupported message type" />;
  }

  return (
    <div style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
      <div style={bubbleStyle}>
        {!isOwn ? (
          <div style={{ fontSize: 10, color: '#9aa0c2', marginBottom: 6 }}>
            {message.senderName} · {message.senderRole}
          </div>
        ) : null}
        {content}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 10, color: '#9aa0c2' }}>
            {new Date(message.createdAt).toLocaleTimeString()}
          </span>
          <button
            onClick={() => setSafetyReport({ open: true, messageId: message.id })}
            style={{
              fontSize: 10,
              color: '#ff8fa3',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Report
          </button>
        </div>
      </div>
    </div>
  );
}
