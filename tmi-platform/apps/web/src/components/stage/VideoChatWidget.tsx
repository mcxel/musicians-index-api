'use client';

import { useEffect, useRef } from 'react';

interface VideoChatWidgetProps {
  stream: MediaStream | null;
  peerName?: string;
  accentColor?: string;
}

export default function VideoChatWidget({
  stream,
  peerName = 'Remote',
  accentColor = '#00FFFF',
}: VideoChatWidgetProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (stream) {
      el.srcObject = stream;
    } else {
      el.srcObject = null;
    }
  }, [stream]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#060410',
        border: `1px solid ${accentColor}33`,
        boxShadow: `0 0 20px ${accentColor}22`,
        borderRadius: 4,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={false}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          aria-label={`${peerName} live video stream`}
        />
      ) : (
        /* Standby — stream not yet attached, but component is allowed in DOM */
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            color: `${accentColor}88`,
            fontFamily: 'monospace',
            fontSize: 12,
            letterSpacing: '0.12em',
          }}
        >
          <div style={{ fontSize: 32 }}>📡</div>
          <span style={{ textTransform: 'uppercase' }}>AWAITING STREAM</span>
          <span style={{ opacity: 0.5 }}>{peerName}</span>
        </div>
      )}

      {/* Name badge */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          background: 'rgba(6,4,16,0.8)',
          border: `1px solid ${accentColor}44`,
          borderRadius: 3,
          padding: '2px 8px',
          fontFamily: 'monospace',
          fontSize: 11,
          color: accentColor,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        {peerName}
      </div>
    </div>
  );
}
