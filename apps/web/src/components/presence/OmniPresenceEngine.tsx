'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ArenaRadar from '@/components/arena/ArenaRadar';
import { GatedMessagingCanister } from '@/components/canisters/MessagingCanister';

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

export default function OmniPresenceEngine({ slug, displayName = 'Artist', defaultTab = 'videotiles' }: OmniPresenceEngineProps) {
  const [activeTab, setActiveTab] = useState<'videotiles' | 'audio' | 'live' | 'messages' | 'radar'>(defaultTab);
  const [voiceVol, setVoiceVol] = useState(75);
  const [beatVol, setBeatVol] = useState(65);
  const router = useRouter();

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

        {/* Messages tab — canonical MessagingCanister (Prisma-backed), deep-linked
            to this profile's real user id. Was routing through MessageThreadEngine,
            an in-memory-only, non-canonical thread store — never persisted. */}
        {activeTab === 'messages' && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: C.cy, letterSpacing: '0.1em', marginBottom: 14 }}>
              MESSAGE — {displayName}
            </div>
            {slug ? (
              <GatedMessagingCanister recipientId={slug} recipientName={displayName} height={420} compact />
            ) : (
              <div style={{ fontSize: 10, color: C.mt, padding: '10px 0 16px' }}>
                No profile identity available to message.
              </div>
            )}
          </div>
        )}

        {/* Video tiles tab — replaces a hardcoded fake-participant array
            ("Tiana (TG)", "Julius", "Redbeard", "SByeeGil") that rendered on
            every profile regardless of whether a call was active. No active-
            call session source exists here yet, so this is an honest empty
            state with a real action, not synthetic attendance (Rule 20). */}
        {activeTab === 'videotiles' && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: C.cy, letterSpacing: '0.1em', marginBottom: 14 }}>VIDEO TILE ENGINE</div>
            <div style={{ background: C.panel, border: `1px solid ${C.bd}`, borderRadius: 10, padding: '28px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: C.mt, marginBottom: 14 }}>No active video call right now.</div>
              <button
                onClick={() => router.push(slug ? `/video/rooms/new?inviteId=${slug}&name=${encodeURIComponent(displayName)}` : '/video/rooms/new')}
                style={{ background: C.cy, color: '#001018', border: 'none', borderRadius: 7, padding: '9px 18px', fontWeight: 900, fontSize: 11, cursor: 'pointer', letterSpacing: '0.05em' }}
              >
                🎥 Start Video Call
              </button>
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
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('tmi:golive-request', { detail: { source: 'omni-presence' } }))}
                style={{ background: C.rd, color: '#fff', border: 'none', padding: '14px 28px', fontSize: 14, fontWeight: 900, borderRadius: 8, letterSpacing: 2, cursor: 'pointer', boxShadow: `0 0 18px ${C.rd}55` }}
              >
                ⏺ GO LIVE NOW
              </button>
              <div style={{ fontSize: 9, color: C.mt, marginTop: 10 }}>Broadcasts to all connected surfaces</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[
                { label: '🎭 Fan Theater', href: '/fan/theater' },
                { label: '🔴 Battle Arena', href: '/rooms/battle-arena' },
                { label: '🌀 Cypher Room', href: '/rooms/cypher-arena' },
              ].map(dest => (
                <button key={dest.href} onClick={() => router.push(dest.href)} style={{ background: C.panel, border: `1px solid ${C.bd}`, borderRadius: 7, padding: '8px 6px', color: C.mt, fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>{dest.label}</button>
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
