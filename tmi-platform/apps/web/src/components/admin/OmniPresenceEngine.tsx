'use client';

import React, { useState } from 'react';

const C = {
  bg: '#070714', card: '#0D0D24', panel: '#111130',
  or: '#FF6B1A', cy: '#00D4FF', gd: '#FFD700',
  pu: '#9B59FF', pk: '#FF69B4', gn: '#00FF88',
  bd: '#1E1E45', tx: '#E8E8FF', mt: '#7878AA', rd: '#FF4444',
};

export default function OmniPresenceEngine() {
  const [activeTab, setActiveTab] = useState('videotiles');
  const [voiceVol, setVoiceVol]   = useState(75);
  const [beatVol, setBeatVol]     = useState(65);

  const duckedBeat = voiceVol > 70 ? Math.max(20, beatVol - Math.round((voiceVol - 70) * 0.75)) : beatVol;

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.tx, fontFamily: 'sans-serif' }}>
      <div style={{ background: C.card, borderBottom: `1px solid ${C.bd}`, padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: C.or, letterSpacing: 1.5 }}>TMI OMNI-PRESENCE ENGINE</div>
          <div style={{ fontSize: 9, color: C.mt, marginTop: 3, letterSpacing: 0.5 }}>MESSENGER · VIDEO TILES · MONITOR RUNTIME · AUDIO DUCKING · LIVE ROUTING</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ background: C.cy, color: '#000', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 900 }}>PHASES 1–10</span>
          <span style={{ background: C.or, color: '#000', padding: '4px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 900 }}>BerntoutGlobal XXL</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '4px', padding: '12px 20px 0', borderBottom: `1px solid ${C.bd}`, background: C.card }}>
        {['videotiles', 'audio', 'live'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 16px', background: activeTab === tab ? C.or : 'transparent', color: activeTab === tab ? '#fff' : C.mt, border: 'none', borderBottom: activeTab === tab ? `2px solid ${C.or}` : '2px solid transparent', borderRadius: '8px 8px 0 0', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', fontSize: '12px' }}>
            {tab}
          </button>
        ))}
      </div>

      <div style={{ padding: '24px' }}>
        {activeTab === 'videotiles' && (
          <div>
            <h2 style={{ color: C.cy, marginBottom: '16px', fontSize: '16px', textTransform: 'uppercase' }}>Video Tile Mood Engine</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
              {(['Tiana (TG)', 'Julius', 'Redbeard', 'SByeeGil'] as const).map((name, i) => (
                <div key={name} style={{ background: C.panel, borderRadius: '12px', overflow: 'hidden', border: i === 0 ? `2px solid ${C.gd}` : `2px solid ${C.bd}`, boxShadow: i === 0 ? `0 0 15px ${C.gd}44` : 'none' }}>
                  <div style={{ height: '120px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                    {(['🎤', '🦦', '🎙', '⭐'] as const)[i]}
                  </div>
                  <div style={{ padding: '8px 12px', background: C.card }}>
                    <div style={{ fontSize: '12px', fontWeight: 900, marginBottom: '4px' }}>{name}</div>
                    <div style={{ fontSize: '10px', color: C.mt }}>{(['Performer', 'Hype Master', 'Co-Host', 'Fan'] as const)[i]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'audio' && (
          <div>
            <h2 style={{ color: C.or, marginBottom: '16px', fontSize: '16px', textTransform: 'uppercase' }}>Audio Ducking & Mixer Engine</h2>
            {voiceVol > 70 && duckedBeat < beatVol && (
              <div style={{ background: `${C.gd}22`, border: `1px solid ${C.gd}`, padding: '12px', borderRadius: '8px', color: C.gd, fontSize: '12px', fontWeight: 800, marginBottom: '16px' }}>
                ⚡ AUTO-DUCKING ACTIVE — Beat reduced to {duckedBeat}% · Voice priority: {voiceVol}%
              </div>
            )}
            <div style={{ background: C.card, padding: '24px', borderRadius: '12px', border: `1px solid ${C.bd}` }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: C.cy, fontWeight: 800, marginBottom: '8px' }}>
                  Voice Volume <span>{voiceVol}%</span>
                </label>
                <input type="range" min="0" max="100" value={voiceVol} onChange={e => setVoiceVol(Number(e.target.value))} style={{ width: '100%', accentColor: C.cy }} />
              </div>
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: C.gd, fontWeight: 800, marginBottom: '8px' }}>
                  Beat / Music {voiceVol > 70 && '(DUCKED)'} <span>{duckedBeat}%</span>
                </label>
                <input type="range" min="0" max="100" value={beatVol} onChange={e => setBeatVol(Number(e.target.value))} disabled={voiceVol > 70} style={{ width: '100%', opacity: voiceVol > 70 ? 0.5 : 1, cursor: voiceVol > 70 ? 'not-allowed' : 'auto' }} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'live' && (
          <div>
            <h2 style={{ color: C.rd, marginBottom: '16px', fontSize: '16px', textTransform: 'uppercase' }}>Instant Live Routing Engine</h2>
            <div style={{ background: `${C.rd}22`, border: `1px solid ${C.rd}`, padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
              <button style={{ background: C.rd, color: '#fff', border: 'none', padding: '16px 32px', fontSize: '18px', fontWeight: 900, borderRadius: '8px', letterSpacing: '2px', cursor: 'pointer', boxShadow: `0 0 20px ${C.rd}66` }}>
                ⏺ PROPAGATE LIVE SURFACES
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
