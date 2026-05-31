"use client";

import { useState } from 'react';

interface ConversationPreview {
  id: string;
  name: string;
  role: string;
  icon: string;
  accentColor: string;
  lastMessage: string;
  timeAgo: string;
  unread: number;
  isOnline: boolean;
}

const SEED_CONVERSATIONS: ConversationPreview[] = [
  { id: 'kreach', name: 'Kreach',       role: 'ARTIST',   icon: '🎵', accentColor: '#AA2DFF', lastMessage: 'Yo, I\'m live on the platform — let\'s run this', timeAgo: '2m',  unread: 2, isOnline: true  },
  { id: 'kg',     name: 'KG',           role: 'PRODUCER', icon: '🎹', accentColor: '#FFD700', lastMessage: 'New beat pack just dropped, check it out',       timeAgo: '9m',  unread: 1, isOnline: true  },
  { id: 'savage', name: 'Savage Guns',  role: 'ARTIST',   icon: '🔥', accentColor: '#FF2DAA', lastMessage: 'Check the new freestyle I just posted',           timeAgo: '1h',  unread: 0, isOnline: false },
  { id: 'jason',  name: 'Jason Smith',  role: 'PROMOTER', icon: '⭐', accentColor: '#00FF88', lastMessage: 'Booking confirmed — let\'s get this locked in',   timeAgo: '3h',  unread: 0, isOnline: true  },
];

export default function MessagesWidget() {
  const [search, setSearch] = useState('');
  const [conversations] = useState<ConversationPreview[]>(SEED_CONVERSATIONS);

  const filtered = conversations.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
      {/* Header Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
            padding: '10px 16px', color: '#fff', fontSize: 13,
            outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Conversation List */}
      <div style={{ flex: 1, overflowY: 'auto' }} className="tmi-scroll">
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '48px 0', fontSize: 13 }}>
            No conversations found.
          </p>
        )}

        {filtered.map(conv => (
          <div
            key={conv.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 12px',
              background: conv.unread > 0 ? 'rgba(0,255,255,0.04)' : 'transparent',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              cursor: 'pointer', transition: 'background 0.15s',
              borderRadius: 8,
            }}
          >
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: `${conv.accentColor}22`,
                border: `2px solid ${conv.accentColor}66`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>
                {conv.icon}
              </div>
              {conv.isOnline && (
                <span style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: '#00FF88', border: '2px solid #060410' }} />
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontWeight: conv.unread > 0 ? 800 : 600, fontSize: 13, color: '#fff' }}>{conv.name}</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', flexShrink: 0, marginLeft: 8 }}>{conv.timeAgo}</span>
              </div>
              <div style={{ fontSize: 11, color: conv.unread > 0 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {conv.lastMessage}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}