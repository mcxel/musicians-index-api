'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoChatWidgetProps {
  active: boolean;
  onStreamStateChange?: (live: boolean) => void;
  /** External MediaStream (e.g. from useWebRtcSignaling). When provided, skips getUserMedia. */
  stream?: MediaStream | null;
}

export default function VideoChatWidget({ active, onStreamStateChange, stream: externalStream }: VideoChatWidgetProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'live' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // When an external stream is provided, attach/detach it directly — no getUserMedia
  useEffect(() => {
    if (externalStream === undefined) return;
    const el = videoRef.current;
    if (!el) return;
    if (active && externalStream) {
      el.srcObject = externalStream;
      setStatus('live');
      setErrorMessage('');
      onStreamStateChange?.(true);
    } else {
      el.srcObject = null;
      setStatus('idle');
      onStreamStateChange?.(false);
    }
  }, [active, externalStream, onStreamStateChange]);

  // Internal getUserMedia path — only runs when no external stream prop is passed
  useEffect(() => {
    if (externalStream !== undefined) return;

    const stopAll = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      onStreamStateChange?.(false);
    };

    if (!active) {
      stopAll();
      setStatus('idle');
      setErrorMessage('');
      return () => undefined;
    }

    let cancelled = false;

    const start = async () => {
      try {
        setStatus('requesting');
        setErrorMessage('');

        const media = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (cancelled) {
          media.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = media;
        if (videoRef.current) {
          videoRef.current.srcObject = media;
        }

        setStatus('live');
        onStreamStateChange?.(true);
      } catch (err) {
        stopAll();
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Failed to initialize camera stream.');
      }
    };

    start();

    return () => {
      cancelled = true;
      stopAll();
    };
  }, [active, externalStream, onStreamStateChange]);

  return (
    <section
      style={{
        border: '1px solid rgba(0,255,255,0.28)',
        borderRadius: 12,
        background: 'rgba(0,255,255,0.05)',
        padding: 12,
        display: 'grid',
        gap: 8,
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: '0.16em', color: '#00ffff', fontWeight: 800 }}>
        VIDEO CHAT WIDGET
      </div>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          minHeight: 220,
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.18)',
          background: '#050510',
          objectFit: 'cover',
        }}
      />

      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
        Status:{' '}
        <strong style={{ color: status === 'live' ? '#00ff88' : status === 'error' ? '#ff4444' : '#fff' }}>
          {status.toUpperCase()}
        </strong>
      </div>

      {status === 'error' && (
        <div style={{ fontSize: 11, color: '#ff7777', lineHeight: 1.5 }}>
          {errorMessage || 'Camera unavailable.'}
        </div>
      )}
    </section>
  );
}
