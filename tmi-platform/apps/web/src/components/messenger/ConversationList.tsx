'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useConversationStore } from './ConversationStore';

function fmtTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export function ConversationList() {
  const { conversations, currentConversationId, setCurrentConversationId } = useConversationStore();
  const router = useRouter();

  return (
    <div style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #1f1f3a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 800, letterSpacing: 1 }}>Conversations</span>
        <Link href="/messages/new" style={{ fontSize: 10, fontWeight: 800, color: '#FF2DAA', border: '1px solid rgba(255,45,170,0.35)', borderRadius: 6, padding: '4px 10px', textDecoration: 'none', letterSpacing: '0.08em' }}>
          + New
        </Link>
      </div>
      {conversations.length === 0 ? (
        <div style={{ padding: 20, color: '#9aa0c2', fontSize: 13, textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
          No conversations yet.<br />
          <Link href="/messages/new" style={{ color: '#FF2DAA', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>Start one →</Link>
        </div>
      ) : (
        conversations.map((c) => {
          const active = c.id === currentConversationId;
          return (
            <button
              key={c.id}
              onClick={() => { setCurrentConversationId(c.id); router.push(`/messages/${c.id}`); }}
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
