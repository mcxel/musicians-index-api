'use client';

import React, { useState, useCallback, useRef } from 'react';
import WebRTCCapture from './WebRTCCapture';

export interface WebRTCBroadcastProps {
  performerId?: string;
  accentColor?: string;
}

type BroadcastState = 'idle' | 'live' | 'ending';

export default function WebRTCBroadcast({ performerId, accentColor = '#FF2DAA' }: WebRTCBroadcastProps) {
  const [stream,         setStream]         = useState<MediaStream | null>(null);
  const [broadcastState, setBroadcastState] = useState<BroadcastState>('idle');
  const [title,          setTitle]          = useState('');
  const [roomId,         setRoomId]         = useState('cypher-arena');
  const [streamId,       setStreamId]       = useState<string | null>(null);
  const [viewerCount,    setViewerCount]    = useState(0);
  const [confirmEnd,     setConfirmEnd]     = useState(false);
  const [error,          setError]          = useState<string | null>(null);

  const viewerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleStream = useCallback((s: MediaStream) => {
    setStream(s);
  }, []);

  const handleStreamError = useCallback((msg: string) => {
    setError(msg);
  }, []);

  const goLive = useCallback(async () => {
    if (!stream) {
      setError('Start your camera first.');
      return;
    }
    if (!title.trim()) {
      setError('Enter a stream title before going live.');
      return;
    }

    setError(null);
    setBroadcastState('live');

    // Start viewer count simulation
    setViewerCount(0);
    viewerIntervalRef.current = setInterval(() => {
      setViewerCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 4000);

    try {
      const res = await fetch('/api/live/start', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ title: title.trim(), roomId, performerId: performerId ?? 'anon' }),
      });
      const data = await res.json() as { ok: boolean; streamId?: string; rtmpKey?: string };
      if (data.ok && data.streamId) {
        setStreamId(data.streamId);
      }
    } catch (err) {
      console.error('[WebRTCBroadcast] /api/live/start error:', err);
      // Non-fatal — keep broadcast "live" for UI purposes
    }
  }, [stream, title, roomId, performerId]);

  const endStream = useCallback(async () => {
    if (!confirmEnd) {
      setConfirmEnd(true);
      return;
    }

    setBroadcastState('ending');
    setConfirmEnd(false);

    if (viewerIntervalRef.current) {
      clearInterval(viewerIntervalRef.current);
      viewerIntervalRef.current = null;
    }

    if (streamId) {
      try {
        await fetch('/api/live/end', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ streamId }),
        });
      } catch (err) {
        console.error('[WebRTCBroadcast] /api/live/end error:', err);
      }
    }

    setBroadcastState('idle');
    setStreamId(null);
    setViewerCount(0);
  }, [confirmEnd, streamId]);

  const cancelEndConfirm = useCallback(() => setConfirmEnd(false), []);

  const isLive = broadcastState === 'live';

  return (
    <div style={wrapStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <span style={{ color: accentColor, fontWeight: 900, fontSize: '18px', letterSpacing: '1px' }}>
          BROADCAST STUDIO
        </span>
        {isLive && (
          <span style={liveBadgeStyle}>
            ● LIVE
          </span>
        )}
      </div>

      {/* Camera */}
      <WebRTCCapture
        onStream={handleStream}
        onError={handleStreamError}
        accentColor={accentColor}
        autoStart={false}
        showRecordingControls={false}
        showResolutionSelector={!isLive}
      />

      {/* Stream setup (idle only) */}
      {!isLive && (
        <div style={setupPanelStyle}>
          <label style={labelStyle}>Stream Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are you performing tonight?"
            maxLength={120}
            style={inputStyle}
          />

          <label style={{ ...labelStyle, marginTop: '12px' }}>Room / Venue</label>
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="cypher-arena">Cypher Arena</option>
            <option value="open-mic">Open Mic Lounge</option>
            <option value="battle-stage">Battle Stage</option>
            <option value="world-concert">World Concert Hall</option>
            <option value="producer-lab">Producer Lab</option>
            <option value="dj-booth">DJ Booth</option>
          </select>
        </div>
      )}

      {/* Viewer count (live only) */}
      {isLive && (
        <div style={statsPanelStyle}>
          <div style={statItemStyle}>
            <span style={{ fontSize: '24px', fontWeight: 900, color: accentColor }}>{viewerCount}</span>
            <span style={{ fontSize: '12px', color: '#888', marginLeft: '6px' }}>viewers</span>
          </div>
          <div style={{ fontSize: '13px', color: '#666', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '10px 16px', background: '#1a0a0a', color: '#FF6666', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* Action button */}
      <div style={actionRowStyle}>
        {!isLive ? (
          <button
            onClick={goLive}
            disabled={!stream}
            style={{
              ...goLiveBtnStyle,
              background:  stream ? accentColor : '#333',
              color:       stream ? '#fff' : '#666',
              cursor:      stream ? 'pointer' : 'not-allowed',
            }}
          >
            GO LIVE
          </button>
        ) : confirmEnd ? (
          <>
            <span style={{ color: '#888', fontSize: '14px', flex: 1 }}>End stream?</span>
            <button onClick={cancelEndConfirm} style={{ ...btnStyle, background: '#1a1a2e' }}>
              Keep Going
            </button>
            <button
              onClick={endStream}
              style={{ ...btnStyle, background: '#FF4444', color: '#fff' }}
            >
              End Stream
            </button>
          </>
        ) : (
          <button
            onClick={endStream}
            style={{ ...btnStyle, background: '#1a0a0a', border: '1px solid #FF4444', color: '#FF4444', flex: 1 }}
          >
            END STREAM
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const wrapStyle: React.CSSProperties = {
  background:    '#0D0D1A',
  border:        '1px solid #222240',
  borderRadius:  '12px',
  overflow:      'hidden',
  display:       'flex',
  flexDirection: 'column',
};

const headerStyle: React.CSSProperties = {
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'space-between',
  padding:        '14px 20px',
  borderBottom:   '1px solid #1a1a30',
  background:     '#0a0a14',
};

const liveBadgeStyle: React.CSSProperties = {
  background:   '#FF4444',
  color:        '#fff',
  fontSize:     '12px',
  fontWeight:   700,
  padding:      '3px 10px',
  borderRadius: '4px',
  letterSpacing:'1px',
  animation:    'pulse 1.5s ease-in-out infinite',
};

const setupPanelStyle: React.CSSProperties = {
  padding:    '16px 20px',
  borderTop:  '1px solid #1a1a30',
  display:    'flex',
  flexDirection: 'column',
};

const labelStyle: React.CSSProperties = {
  fontSize:     '12px',
  color:        '#666',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  background:   '#111130',
  border:       '1px solid #222240',
  borderRadius: '6px',
  color:        '#E0E0E0',
  fontSize:     '14px',
  padding:      '10px 14px',
  outline:      'none',
  width:        '100%',
  boxSizing:    'border-box',
};

const statsPanelStyle: React.CSSProperties = {
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'space-between',
  padding:        '12px 20px',
  borderTop:      '1px solid #1a1a30',
  background:     '#0a0a14',
};

const statItemStyle: React.CSSProperties = {
  display:    'flex',
  alignItems: 'baseline',
};

const actionRowStyle: React.CSSProperties = {
  display:    'flex',
  gap:        '8px',
  padding:    '14px 20px',
  borderTop:  '1px solid #1a1a30',
  background: '#0a0a14',
};

const goLiveBtnStyle: React.CSSProperties = {
  flex:         1,
  padding:      '14px',
  borderRadius: '8px',
  border:       'none',
  fontSize:     '16px',
  fontWeight:   900,
  letterSpacing:'2px',
};

const btnStyle: React.CSSProperties = {
  padding:      '10px 20px',
  borderRadius: '6px',
  border:       'none',
  cursor:       'pointer',
  fontSize:     '14px',
  color:        '#E0E0E0',
  background:   '#1a1a2e',
};
