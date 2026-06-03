'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const C = {
  bg: '#07071a', panel: '#0d0d2a', border: '#1a1a3a', accent: '#00FFFF',
  fuchsia: '#FF2DAA', gold: '#FFD700', text: '#fff', dim: '#666', dim2: '#333',
};

interface ApiThread {
  threadId: string;
  kind: string;
  participants: { userId: string; displayName: string; avatarUrl: string; role: string }[];
  lastMessage: { messageId: string; senderId: string; senderName: string; body: string; type: string; createdAt: number } | null;
  unreadCount: number;
  updatedAt: number;
}
interface ApiMessage {
  messageId: string;
  senderId: string;
  senderName: string;
  body: string;
  type: string;
  createdAt: number;
  isOwn: boolean;
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function otherParticipant(thread: ApiThread, myId: string) {
  return thread.participants.find(p => p.userId !== myId) ?? thread.participants[0];
}

export default function MessagesPage() {
  const [threads, setThreads] = useState<ApiThread[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [myId, setMyId] = useState('');
  const [showNewMsg, setShowNewMsg] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [newBody, setNewBody] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadThreads = useCallback(async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json() as { threads: ApiThread[] };
        setThreads(data.threads ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (threadId: string) => {
    const res = await fetch(`/api/messages/${threadId}`);
    if (res.ok) {
      const data = await res.json() as { messages: ApiMessage[]; participants: ApiThread['participants'] };
      setMessages(data.messages ?? []);
      const me = data.participants.find(p => p.userId === myId);
      if (!me && data.participants.length > 0) {
        // Try to get myId from cookies via a lightweight endpoint
      }
    }
  }, [myId]);

  useEffect(() => { void loadThreads(); }, [loadThreads]);

  useEffect(() => {
    if (selectedId) { void loadMessages(selectedId); }
  }, [selectedId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages every 5 seconds when a thread is open
  useEffect(() => {
    if (!selectedId) return;
    const t = setInterval(() => { void loadMessages(selectedId); void loadThreads(); }, 5000);
    return () => clearInterval(t);
  }, [selectedId, loadMessages, loadThreads]);

  async function sendMessage() {
    if (!input.trim() || !selectedId || sending) return;
    setSending(true);
    try {
      await fetch(`/api/messages/${selectedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: input.trim() }),
      });
      setInput('');
      await loadMessages(selectedId);
      await loadThreads();
    } finally {
      setSending(false);
    }
  }

  async function startNewConversation() {
    if (!newRecipient.trim() || !newBody.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: newRecipient, recipientName: newRecipient, body: newBody }),
      });
      if (res.ok) {
        const data = await res.json() as { threadId: string };
        setShowNewMsg(false);
        setNewRecipient('');
        setNewBody('');
        await loadThreads();
        setSelectedId(data.threadId);
      }
    } finally {
      setSending(false);
    }
  }

  const selectedThread = threads.find(t => t.threadId === selectedId);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '20px 28px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 20, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: 3, color: C.accent, margin: 0 }}>MESSAGES</h1>
        {threads.some(t => t.unreadCount > 0) && (
          <span style={{ background: C.fuchsia, color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 12, padding: '2px 8px' }}>
            {threads.reduce((s, t) => s + t.unreadCount, 0)} unread
          </span>
        )}
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setShowNewMsg(true)}
          style={{ background: C.accent, color: C.bg, border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 13, letterSpacing: 1 }}
        >
          + New Message
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 'calc(100vh - 72px)' }}>
        {/* Thread list */}
        <div style={{ width: 300, borderRight: `1px solid ${C.border}`, overflowY: 'auto', flexShrink: 0 }}>
          {loading ? (
            <div style={{ padding: 32, color: C.dim, textAlign: 'center', fontSize: 14 }}>Loading…</div>
          ) : threads.length === 0 ? (
            <div style={{ padding: 32, color: C.dim, textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
              <p style={{ fontSize: 13 }}>No conversations yet</p>
              <button onClick={() => setShowNewMsg(true)} style={{ marginTop: 12, background: C.accent, color: C.bg, border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                Start a conversation
              </button>
            </div>
          ) : (
            threads.map(t => {
              const other = otherParticipant(t, myId);
              const isSelected = t.threadId === selectedId;
              return (
                <div
                  key={t.threadId}
                  onClick={() => setSelectedId(t.threadId)}
                  style={{
                    padding: '14px 16px',
                    cursor: 'pointer',
                    background: isSelected ? '#0f0f2e' : 'transparent',
                    borderBottom: `1px solid ${C.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    borderLeft: isSelected ? `3px solid ${C.accent}` : '3px solid transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${C.fuchsia}, ${C.accent})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, flexShrink: 0, fontWeight: 700, color: '#fff',
                  }}>
                    {other?.displayName?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <span style={{ fontWeight: t.unreadCount > 0 ? 700 : 400, fontSize: 14 }}>{other?.displayName ?? 'User'}</span>
                      <span style={{ fontSize: 10, color: C.dim }}>{t.lastMessage ? timeAgo(t.lastMessage.createdAt) : ''}</span>
                    </div>
                    <div style={{ fontSize: 12, color: t.unreadCount > 0 ? '#bbb' : C.dim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.lastMessage?.body ?? 'No messages yet'}
                    </div>
                  </div>
                  {t.unreadCount > 0 && (
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: C.bg, flexShrink: 0 }}>
                      {t.unreadCount}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Thread detail */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedThread ? (
            <>
              <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
                {(() => { const o = otherParticipant(selectedThread, myId); return <><div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${C.fuchsia}, ${C.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>{o?.displayName?.charAt(0) ?? '?'}</div><span>{o?.displayName ?? 'User'}</span><span style={{ fontSize: 11, color: C.dim, textTransform: 'uppercase', letterSpacing: 2, marginLeft: 4 }}>{o?.role}</span></>; })()}
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px' }}>
                {messages.length === 0 ? (
                  <div style={{ color: C.dim, textAlign: 'center', marginTop: 40, fontSize: 14 }}>No messages yet — say hello!</div>
                ) : (
                  messages.map(m => (
                    <div key={m.messageId} style={{ display: 'flex', justifyContent: m.isOwn ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                      <div style={{
                        maxWidth: '72%',
                        background: m.isOwn ? `linear-gradient(135deg, ${C.fuchsia}33, ${C.accent}22)` : C.panel,
                        border: `1px solid ${m.isOwn ? C.accent + '44' : C.border}`,
                        borderRadius: m.isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        padding: '10px 14px',
                      }}>
                        {!m.isOwn && <div style={{ fontSize: 10, color: C.dim, marginBottom: 4, fontWeight: 600 }}>{m.senderName}</div>}
                        <div style={{ fontSize: 14, lineHeight: 1.5 }}>{m.body}</div>
                        <div style={{ fontSize: 10, color: C.dim, marginTop: 4, textAlign: 'right' }}>{timeAgo(m.createdAt)}</div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10, background: 'rgba(0,0,0,0.3)' }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }}
                  placeholder="Type a message… (Enter to send)"
                  style={{ flex: 1, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', color: C.text, fontSize: 14, outline: 'none' }}
                />
                <button
                  onClick={() => void sendMessage()}
                  disabled={sending || !input.trim()}
                  style={{ background: sending ? C.dim : C.accent, color: C.bg, border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 14, opacity: sending ? 0.6 : 1 }}
                >
                  {sending ? '…' : 'Send'}
                </button>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.dim, flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 56 }}>💬</div>
              <p style={{ fontSize: 15, letterSpacing: 1 }}>Select a conversation</p>
              <button onClick={() => setShowNewMsg(true)} style={{ background: C.accent, color: C.bg, border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700, cursor: 'pointer', fontSize: 13, letterSpacing: 1 }}>
                Start New Conversation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New message modal */}
      {showNewMsg && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowNewMsg(false)}>
          <div style={{ background: '#0d0d2a', border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, width: 420, maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 900, letterSpacing: 2, color: C.accent }}>NEW MESSAGE</h2>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: C.dim, letterSpacing: 2, display: 'block', marginBottom: 6 }}>TO (User ID or display name)</label>
              <input
                value={newRecipient}
                onChange={e => setNewRecipient(e.target.value)}
                placeholder="Recipient ID"
                style={{ width: '100%', background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', color: C.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 11, color: C.dim, letterSpacing: 2, display: 'block', marginBottom: 6 }}>MESSAGE</label>
              <textarea
                value={newBody}
                onChange={e => setNewBody(e.target.value)}
                placeholder="Your message…"
                rows={4}
                style={{ width: '100%', background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', color: C.text, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowNewMsg(false)} style={{ background: 'transparent', border: `1px solid ${C.border}`, color: C.dim, borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              <button
                onClick={() => void startNewConversation()}
                disabled={!newRecipient.trim() || !newBody.trim() || sending}
                style={{ background: C.accent, color: C.bg, border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 13, opacity: sending ? 0.6 : 1 }}
              >
                {sending ? 'Sending…' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
