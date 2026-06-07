'use client';

import React from 'react';
import { useConversationStore } from './ConversationStore';

function fmtTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export function ConversationList() {
  const { conversations, currentConversationId, setCurrentConversationId } = useConversationStore();

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <div style={{ padding: 14, borderBottom: '1px solid #1f1f3a', fontWeight: 800, letterSpacing: 1 }}>
        Conversations
      </div>
      {conversations.length === 0 ? (
        <div style={{ padding: 16, color: '#9aa0c2', fontSize: 13 }}>No conversations yet.</div>
      ) : (
        conversations.map((c) => {
          const active = c.id === currentConversationId;
          return (
            <button
              key={c.id}
              onClick={() => setCurrentConversationId(c.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 14px',
                border: 'none',
                cursor: 'pointer',
                background: active ? '#16163a' : 'transparent',
                borderBottom: '1px solid #1f1f3a',
                color: '#fff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <strong>{c.title}</strong>
                <span style={{ color: '#9aa0c2' }}>{fmtTime(c.lastMessageAt)}</span>
              </div>
              <div style={{ fontSize: 11, color: '#9aa0c2', marginTop: 2 }}>{c.type.toUpperCase()}</div>
            </button>
          );
        })
      )}
    </div>
  );
}
