'use client';

import React, { useEffect, useRef } from 'react';
import { useMediaStream } from '@/hooks/useMediaStream';

const C = {
  bg: 'rgba(10, 10, 25, 0.8)',
  border: '1px solid rgba(0, 255, 136, 0.35)',
  text: '#fff',
  dim: '#999',
  error: '#FF4444',
  accent: '#00FF88',
};

/** Light constraints = faster getUserMedia for gem → Admin Cam. */
const FAST_PREVIEW_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    facingMode: 'user',
    width: { ideal: 640 },
    height: { ideal: 360 },
  },
  audio: false,
};

type LiveCameraPreviewProps = {
  /** When true (default), open the stream as soon as the overlay mounts — no Start click. */
  autoStart?: boolean;
};

export function LiveCameraPreview({ autoStart = true }: LiveCameraPreviewProps) {
  const { stream, status, error, startStream, stopStream } = useMediaStream(FAST_PREVIEW_CONSTRAINTS);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Snappy gem path: request camera immediately on mount; tear down on unmount.
  useEffect(() => {
    if (!autoStart) return;
    void startStream();
    return () => {
      stopStream();
    };
  }, [autoStart, startStream, stopStream]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      void videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  return (
    <div
      className="flex flex-col gap-2 p-2 rounded-lg"
      style={{ background: C.bg, border: C.border, height: '100%' }}
    >
      <div
        className="aspect-video w-full flex items-center justify-center rounded"
        style={{ background: '#000', overflow: 'hidden', minHeight: 200, flex: 1 }}
      >
        {status === 'error' ? (
          <div style={{ color: C.error, padding: 12, textAlign: 'center', fontSize: 12 }}>
            {error?.message || 'Could not access camera.'}
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                onClick={() => {
                  void startStream();
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: `1px solid ${C.accent}`,
                  background: 'rgba(0,255,136,0.12)',
                  color: C.accent,
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Retry Camera
              </button>
            </div>
          </div>
        ) : status === 'active' && stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
          />
        ) : (
          <div style={{ color: C.dim, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em' }}>
            {status === 'requesting' ? 'OPENING CAMERA…' : 'CAMERA READY'}
          </div>
        )}
      </div>
    </div>
  );
}
