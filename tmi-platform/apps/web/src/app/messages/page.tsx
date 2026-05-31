'use client';

import { useState } from 'react';

const CONVERSATIONS = [
  { id: 1, name: 'DJ Phantom', avatar: '🎧', preview: 'Yo, that set was fire last night!', time: '2m ago', unread: true },
  { id: 2, name: 'Lena Voss', avatar: '🎤', preview: 'When are you booking the stage again?', time: '14m ago', unread: true },
  { id: 3, name: 'CypherKing', avatar: '👑', preview: 'Battle invitation sent to your queue.', time: '1h ago', unread: false },
  { id: 4, name: 'BeatMaestro', avatar: '🎹', preview: 'Check the beat I just dropped in vault.', time: '3h ago', unread: false },
  { id: 5, name: 'TMI Support', avatar: '💬', preview: 'Your account upgrade is confirmed!', time: '1d ago', unread: false },
];

export default function MessagesPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [input, setInput] = useState('');

  const activeConvo = CONVERSATIONS.find(c => c.id === selected);

  return (
    <div style={{ background: '#07071a', minHeight: '100vh', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px 32px', borderBottom: '1px solid #1a1a3a', display: 'flex', alignItems: 'center', gap: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: 2, color: '#00FFFF', margin: 0 }}>MESSAGES</h1>
        <button style={{ background: '#00FFFF', color: '#07071a', border: 'none', borderRadius: 6, padding: '7px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 13, letterSpacing: 1 }}>
          + New Message
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 'calc(100vh - 89px)' }}>
        {/* Sidebar */}
        <div style={{ width: 320, borderRight: '1px solid #1a1a3a', overflowY: 'auto', flexShrink: 0 }}>
          {CONVERSATIONS.map(c => (
            <div
              key={c.id}
              onClick={() => setSelected(c.id)}
              style={{
                padding: '16px 20px',
                cursor: 'pointer',
                background: selected === c.id ? '#0d0d2a' : 'transparent',
                borderBottom: '1px solid #111130',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: '#1a1a3a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0,
              }}>
                {c.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: c.unread ? 700 : 400, fontSize: 15 }}>{c.name}</span>
                  <span style={{ fontSize: 11, color: '#666' }}>{c.time}</span>
                </div>
                <div style={{ fontSize: 13, color: c.unread ? '#bbb' : '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.preview}
                </div>
              </div>
              {c.unread && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00FFFF', flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>

        {/* Thread */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {activeConvo ? (
            <>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #1a1a3a', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>{activeConvo.avatar}</span>
                <span>{activeConvo.name}</span>
              </div>
              <div style={{ flex: 1, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>
                <p style={{ fontSize: 14 }}>Conversation history coming soon...</p>
              </div>
              <div style={{ padding: '16px 24px', borderTop: '1px solid #1a1a3a', display: 'flex', gap: 12 }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && setInput('')}
                  placeholder="Type a message..."
                  style={{
                    flex: 1, background: '#0d0d2a', border: '1px solid #2a2a4a',
                    borderRadius: 8, padding: '10px 16px', color: '#fff', fontSize: 14, outline: 'none',
                  }}
                />
                <button
                  onClick={() => setInput('')}
                  style={{ background: '#00FFFF', color: '#07071a', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 48 }}>💬</div>
              <p style={{ fontSize: 15 }}>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
