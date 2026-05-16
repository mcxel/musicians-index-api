'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  { id: 'c1', name: 'Wavetek', role: 'ARTIST', icon: '🎤', accentColor: '#FF2DAA', lastMessage: 'Yo, you heard that new drop?', timeAgo: '2m', unread: 3, isOnline: true },
  { id: 'c2', name: 'Zuri Bloom', role: 'ARTIST', icon: '🌍', accentColor: '#00FF88', lastMessage: 'The cypher starts at 10pm', timeAgo: '14m', unread: 1, isOnline: true },
  { id: 'c3', name: 'Neon Vibe', role: 'DJ', icon: '🎧', accentColor: '#00FFFF', lastMessage: 'I got beats for the session', timeAgo: '1h', unread: 0, isOnline: false },
  { id: 'c4', name: 'Krypt', role: 'ARTIST', icon: '🔒', accentColor: '#AA2DFF', lastMessage: 'Check this verse I wrote', timeAgo: '3h', unread: 0, isOnline: true },
  { id: 'c5', name: 'TMI Support', role: 'SUPPORT', icon: '🛡️', accentColor: '#00FFFF', lastMessage: 'Your account is fully verified.', timeAgo: '1d', unread: 0, isOnline: true },
  { id: 'c6', name: 'TMI Booking', role: 'SYSTEM', icon: '📋', accentColor: '#FFD700', lastMessage: 'New booking request received', timeAgo: '2d', unread: 1, isOnline: true },
];

export default function MessagesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [conversations, setConversations] = useState<ConversationPreview[]>(SEED_CONVERSATIONS);

  useEffect(() => {
    // Future: fetch real conversations from /api/messages/conversations
    // For now, seed data drives the inbox
  }, []);

  const filtered = conversations.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  return (
    <main style={{ minHeight: '100vh', background: '#060410', color: '#fff', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px 20px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
                Messages
              </h1>
              {totalUnread > 0 && (
                <p style={{ fontSize: 11, color: '#00FF88', margin: '2px 0 0', fontWeight: 700 }}>
                  {totalUnread} unread
                </p>
              )}
            </div>
            <Link
              href="/messages/new"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', borderRadius: 24,
                background: 'rgba(0,255,255,0.12)', border: '1px solid rgba(0,255,255,0.3)',
                color: '#00FFFF', fontWeight: 800, fontSize: 12, letterSpacing: '0.05em',
                textDecoration: 'none',
              }}
            >
              + New Message
            </Link>
          </div>

          {/* Search */}
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
      </div>

      {/* Conversation List */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '8px 24px' }}>
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '48px 0', fontSize: 13 }}>
            No conversations found.
          </p>
        )}

        {filtered.map(conv => (
          <Link
            key={conv.id}
            href={`/messages/${conv.id}`}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px',
                background: conv.unread > 0 ? 'rgba(0,255,255,0.04)' : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = conv.unread > 0 ? 'rgba(0,255,255,0.04)' : 'transparent')}
            >
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: '50%',
                  background: `${conv.accentColor}22`,
                  border: `2px solid ${conv.accentColor}66`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}>
                  {conv.icon}
                </div>
                {conv.isOnline && (
                  <span style={{
                    position: 'absolute', bottom: 1, right: 1,
                    width: 10, height: 10, borderRadius: '50%',
                    background: '#00FF88', border: '2px solid #060410',
                  }} />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontWeight: conv.unread > 0 ? 800 : 600, fontSize: 14, color: '#fff' }}>
                    {conv.name}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', flexShrink: 0, marginLeft: 8 }}>
                    {conv.timeAgo}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <p style={{
                    fontSize: 12, color: conv.unread > 0 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)',
                    margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                    fontWeight: conv.unread > 0 ? 600 : 400,
                  }}>
                    {conv.lastMessage}
                  </p>
                  {conv.unread > 0 && (
                    <span style={{
                      flexShrink: 0, minWidth: 18, height: 18, borderRadius: 9,
                      background: '#00FFFF', color: '#060410',
                      fontSize: 10, fontWeight: 900,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0 5px',
                    }}>
                      {conv.unread}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: conv.accentColor }}>
                  {conv.role}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty state CTA */}
      {conversations.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>💬</p>
          <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>No messages yet</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
            Start a conversation with an artist, fan, or the TMI team.
          </p>
          <Link
            href="/messages/new"
            style={{
              display: 'inline-flex', padding: '12px 28px', borderRadius: 24,
              background: 'rgba(0,255,255,0.12)', border: '1px solid rgba(0,255,255,0.3)',
              color: '#00FFFF', fontWeight: 800, fontSize: 13, textDecoration: 'none',
            }}
          >
            Send Your First Message
          </Link>
        </div>
      )}
    </main>
  );
}
