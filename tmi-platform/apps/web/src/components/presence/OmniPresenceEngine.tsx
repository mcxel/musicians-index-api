'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ArenaRadar from '@/components/arena/ArenaRadar';
import { messageThreadEngine, type MessageThread } from '@/lib/messaging/MessageThreadEngine';

const C = {
  bg: "#070714", card: "#0D0D24", panel: "#111130",
  or: "#FF6B1A", cy: "#00D4FF", gd: "#FFD700",
  pu: "#9B59FF", pk: "#FF69B4", gn: "#00FF88",
  bd: "#1E1E45", tx: "#E8E8FF", mt: "#7878AA", rd: "#FF4444"
};

interface OmniPresenceEngineProps {
  slug?: string;
  displayName?: string;
  defaultTab?: 'videotiles' | 'audio' | 'live' | 'messages' | 'radar';
}

function timeAgo(ts: number): string {
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface InboxRow { id: string; recipientId: string; from: string; avatar: string; text: string; time: string; unread: boolean; }

function threadToRow(thread: MessageThread, currentUserId: string): InboxRow {
  const other = thread.participants.find((p) => p.userId !== currentUserId) ?? thread.participants[0];
  const last = thread.lastMessage;
  const unread = !!last && last.senderId !== currentUserId && !last.readBy.has(currentUserId);
  return {
    id: thread.threadId,
    recipientId: other?.userId ?? thread.threadId,
    from: other?.displayName ?? 'Unknown',
    avatar: other?.role === 'artist' ? '🎤' : other?.role === 'sponsor' ? '💼' : other?.role === 'admin' ? '🛡️' : '💬',
    text: last?.body ?? '',
    time: last ? timeAgo(last.createdAt) : '',
    unread,
  };
}

export default function OmniPresenceEngine({ slug, displayName = 'Artist', defaultTab = 'videotiles' }: OmniPresenceEngineProps) {
  const [activeTab, setActiveTab] = useState<'videotiles' | 'audio' | 'live' | 'messages' | 'radar'>(defaultTab);
  const [voiceVol, setVoiceVol] = useState(75);
  const [beatVol, setBeatVol] = useState(65);
  const [msgInput, setMsgInput] = useState('');
  const [inboxRows, setInboxRows] = useState<InboxRow[]>([]);
  const router = useRouter();

  // Real inbox — replaces a hardcoded MOCK_MESSAGES array that showed the
  // same four fake senders ("Chario Ace", "Wavetek"...) on every profile
  // regardless of whose inbox it actually was.
  useEffect(() => {
    if (!slug) { setInboxRows([]); return; }
    const threads = messageThreadEngine.getUserThreads(slug);
    setInboxRows(threads.map((t) => threadToRow(t, slug)));
  }, [slug]);

  const duckedBeat = voiceVol > 70 ? Math.max(20, beatVol - Math.round((voiceVol - 70) * 0.75)) : beatVol;

  return (
    <div style={{ background: C.bg, borderRadius: 14, border: `1px solid ${C.bd}`, overflow: 'hidden', marginTop: 24 }}>
      {/* Header */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.bd}`, padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 900, color: C.or, letterSpacing: 1 }}>TMI OMNI-PRESENCE</div>
          <div style={{ fontSize: 8, color: C.mt, marginTop: 2, letterSpacing: 0.5 }}>MESSENGER · VIDEO · AUDIO DUCKING · LIVE ROUTING</div>
        </div>
        <div style={{ fontSize: 9, color: C.gn, fontWeight: 800 }}>● ONLINE</div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '2px', padding: '10px 18px 0', borderBottom: `1px solid ${C.bd}`, background: C.card }}>
        {([
          { id: 'messages',   label: '💬 Messages' },
          { id: 'videotiles', label: '📹 Video' },
          { id: 'audio',      label: '🎚 Audio' },
          { id: 'live',       label: '⏺ Go Live' },
          { id: 'radar',      label: '⚡ Arena' },
        ] as { id: 'messages' | 'videotiles' | 'audio' | 'live' | 'radar'; label: string }[]).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '7px 14px', background: activeTab === tab.id ? C.or : 'transparent',
            color: activeTab === tab.id ? '#fff' : C.mt,
            border: 'none', borderBottom: activeTab === tab.id ? `2px solid ${C.or}` : '2px solid transparent',
            borderRadius: '6px 6px 0 0', fontWeight: 800, cursor: 'pointer', fontSize: 10,
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '20px 18px' }}>

        {/* Messages tab — links to /messages/[id] routes */}
        {activeTab === 'messages' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.cy, letterSpacing: '0.1em' }}>INBOX — {displayName}</div>
              <Link href="/messages" style={{ fontSize: 8, fontWeight: 800, color: C.or, border: `1px solid ${C.or}44`, borderRadius: 5, padding: '3px 9px', textDecoration: 'none', letterSpacing: '0.08em' }}>
                OPEN INBOX →
              </Link>
            </div>
            {inboxRows.length === 0 && (
              <div style={{ fontSize: 10, color: C.mt, padding: '10px 0 16px' }}>No messages yet.</div>
            )}
            <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
              {inboxRows.map(msg => (
                <button
                  key={msg.id}
                  onClick={() => router.push(`/messages/${msg.recipientId}`)}
                  style={{
                    background: msg.unread ? 'rgba(0,212,255,0.05)' : C.panel,
                    border: `1px solid ${msg.unread ? C.cy + '30' : C.bd}`,
                    borderRadius: 8, padding: '10px 14px',
                    display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                    textAlign: 'left', width: '100%', color: 'inherit',
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{msg.avatar}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: msg.unread ? 900 : 700, color: msg.unread ? '#fff' : C.mt }}>{msg.from}</span>
                      <span style={{ fontSize: 8, color: C.mt }}>{msg.time}</span>
                    </div>
                    <div style={{ fontSize: 10, color: msg.unread ? 'rgba(255,255,255,0.7)' : C.mt, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.text}</div>
                  </div>
                  {msg.unread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.cy, flexShrink: 0 }} />}
                </button>
              ))}
            </div>
            {/* Quick reply — routes to /messages/new */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={msgInput}
                onChange={e => setMsgInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && msgInput.trim()) {
                    router.push(`/messages/new`);
                    setMsgInput('');
                  }
                }}
                placeholder="Quick message... (Enter to compose)"
                style={{ flex: 1, background: C.panel, border: `1px solid ${C.bd}`, borderRadius: 6, padding: '8px 12px', color: C.tx, fontSize: 11, outline: 'none' }}
              />
              <button
                onClick={() => router.push('/messages/new')}
                style={{ background: C.or, color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontWeight: 800, fontSize: 10, cursor: 'pointer' }}
              >
                New
              </button>
            </div>
          </div>
        )}

        {/* Video tiles tab */}
        {activeTab === 'videotiles' && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: C.cy, letterSpacing: '0.1em', marginBottom: 14 }}>VIDEO TILE ENGINE</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14 }}>
              {[
                { name: 'Tiana (TG)', role: 'Performer', em: '🎤', gold: true  },
                { name: 'Julius',     role: 'Hype Master',em: '🦦', gold: false },
                { name: 'Redbeard',  role: 'Co-Host',    em: '🎙', gold: false },
                { name: 'SByeeGil',  role: 'Fan',        em: '⭐', gold: false },
              ].map(p => (
                <div key={p.name} style={{
                  background: C.panel, borderRadius: 10, overflow: 'hidden',
                  border: p.gold ? `2px solid ${C.gd}` : `1px solid ${C.bd}`,
                  boxShadow: p.gold ? `0 0 12px ${C.gd}33` : 'none',
                }}>
                  <div style={{ height: 100, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>
                    {p.em}
                  </div>
                  <div style={{ padding: '8px 10px', background: C.card }}>
                    <div style={{ fontSize: 11, fontWeight: 900, color: C.tx }}>{p.name}</div>
                    <div style={{ fontSize: 9, color: C.mt, marginTop: 2 }}>{p.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audio tab */}
        {activeTab === 'audio' && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: C.or, letterSpacing: '0.1em', marginBottom: 14 }}>AUDIO DUCKING &amp; MIXER</div>
            {voiceVol > 70 && duckedBeat < beatVol && (
              <div style={{ background: `${C.gd}22`, border: `1px solid ${C.gd}`, padding: '10px 14px', borderRadius: 8, color: C.gd, fontSize: 11, fontWeight: 800, marginBottom: 16 }}>
                ⚡ AUTO-DUCKING — Beat → {duckedBeat}% · Voice priority: {voiceVol}%
              </div>
            )}
            <div style={{ background: C.card, padding: 20, borderRadius: 10, border: `1px solid ${C.bd}` }}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.cy, fontWeight: 800, marginBottom: 8 }}>Voice Volume <span>{voiceVol}%</span></label>
                <input type="range" min="0" max="100" value={voiceVol} onChange={e => setVoiceVol(Number(e.target.value))} style={{ width: '100%', accentColor: C.cy }} />
              </div>
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.gd, fontWeight: 800, marginBottom: 8 }}>
                  Beat / Music {voiceVol > 70 && <span style={{ fontSize: 9, color: C.rd }}>DUCKED</span>} <span>{duckedBeat}%</span>
                </label>
                <input type="range" min="0" max="100" value={duckedBeat} disabled style={{ width: '100%', opacity: 0.5 }} />
              </div>
            </div>
          </div>
        )}

        {/* Live routing tab */}
        {activeTab === 'live' && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: C.rd, letterSpacing: '0.1em', marginBottom: 14 }}>INSTANT LIVE ROUTING</div>
            <div style={{ background: `${C.rd}11`, border: `1px solid ${C.rd}`, padding: 24, borderRadius: 10, textAlign: 'center', marginBottom: 14 }}>
              <button style={{ background: C.rd, color: '#fff', border: 'none', padding: '14px 28px', fontSize: 14, fontWeight: 900, borderRadius: 8, letterSpacing: 2, cursor: 'pointer', boxShadow: `0 0 18px ${C.rd}55` }}>
                ⏺ GO LIVE NOW
              </button>
              <div style={{ fontSize: 9, color: C.mt, marginTop: 10 }}>Broadcasts to all connected surfaces</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {['🎭 Fan Theater', '🔴 Battle Arena', '🌀 Cypher Room'].map(dest => (
                <button key={dest} style={{ background: C.panel, border: `1px solid ${C.bd}`, borderRadius: 7, padding: '8px 6px', color: C.mt, fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>{dest}</button>
              ))}
            </div>
          </div>
        )}

        {/* Arena Radar tab */}
        {activeTab === 'radar' && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#FF2DAA', letterSpacing: '0.1em', marginBottom: 14 }}>⚡ LIVE ARENA RADAR</div>
            <ArenaRadar compact maxItems={6} />
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { href: '/arena/hip-hop', label: '🎤 Hip-Hop',  color: '#FFD700' },
                { href: '/arena/rnb',     label: '🔥 R&B',      color: '#FF2DAA' },
                { href: '/arena/edm',     label: '🎧 EDM',      color: '#00FFFF' },
                { href: '/arena/rap',     label: '🎙 Rap',      color: '#39FF14' },
                { href: '/arena/cypher',  label: '⚡ Cypher',   color: '#FF2DAA' },
                { href: '/arena',         label: 'ALL ARENAS →', color: '#fff'    },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ fontSize: 9, fontWeight: 800, color: l.color, border: `1px solid ${l.color}33`, borderRadius: 5, padding: '4px 10px', textDecoration: 'none', background: `${l.color}08`, letterSpacing: '0.06em' }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
