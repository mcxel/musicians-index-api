'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getHardwareStreamWithFallback } from '../../lib/media/streamUtils';

interface LiveVideoShellProps {
  performerId: string;
  isLive?: boolean;
}

export default function LiveVideoShell({ performerId: _performerId, isLive = false }: LiveVideoShellProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');
  const [streamActive, setStreamActive] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function enableHardwareStream() {
      try {
        stream = await getHardwareStreamWithFallback();

        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }
      } catch (err) {
        console.error('[TMI_HARDWARE_ERROR] MediaDevices API failure:', err);
        setError('HARDWARE LOCK: PLATFORM LAW #5 REQUIRES HD WEBCAM / MIC ACCESS FOR STAGE ENTRY.');
      }
    }

    if (isLive) {
      void enableHardwareStream();
    }

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [isLive]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#050815',
        borderRadius: '12px',
        overflow: 'hidden',
        border: streamActive ? '2px solid #FF2DAA' : '1px solid rgba(0,229,255,0.2)',
      }}
    >
      {error ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#ff4444',
            fontFamily: 'var(--font-orbitron), sans-serif',
            padding: '24px',
            textAlign: 'center',
            fontWeight: 900,
          }}
        >
          {error}
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: streamActive ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}
        />
      )}
      {streamActive && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: '#FF2DAA',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 900,
            color: '#fff',
            fontFamily: 'var(--font-orbitron), sans-serif',
            boxShadow: '0 0 15px rgba(255,45,170,0.6)',
          }}
        >
          🔴 REC
        </div>
      )}
    </div>
  );
}
