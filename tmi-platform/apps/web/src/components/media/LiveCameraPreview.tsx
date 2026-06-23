'use client';

import React, { useRef, useEffect } from 'react';
import { useMediaStream } from '@/hooks/useMediaStream';

const C = {
  bg: 'rgba(10, 10, 25, 0.8)',
  border: '1px solid rgba(170, 45, 255, 0.2)',
  text: '#fff',
  dim: '#999',
  error: '#FF4444',
  button: 'rgba(170, 45, 255, 0.3)',
  buttonHover: 'rgba(170, 45, 255, 0.5)',
};

export function LiveCameraPreview() {
  const { stream, status, error, startStream, stopStream } = useMediaStream({
    video: { width: 1280, height: 720 },
    audio: true,
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const renderContent = () => {
    if (status === 'error') {
      return <div style={{ color: C.error }}>Error: {error?.message || 'Could not access camera.'}</div>;
    }
    if (status === 'active' && stream) {
      return <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />;
    }
    return <div style={{ color: C.dim }}>Camera is off</div>;
  };

  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg" style={{ background: C.bg, border: C.border }}>
      <div className="aspect-video w-full flex items-center justify-center rounded" style={{ background: '#000', overflow: 'hidden' }}>
        {renderContent()}
      </div>
      <div className="flex justify-center gap-4">
        <button
          onClick={startStream}
          disabled={status === 'active' || status === 'requesting'}
          className="px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
          style={{ background: C.button, color: C.text, transition: 'background 0.2s' }}
        >
          {status === 'requesting' ? 'Starting...' : 'Start Camera'}
        </button>
        <button
          onClick={stopStream}
          disabled={status !== 'active'}
          className="px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50"
          style={{ background: C.button, color: C.text, transition: 'background 0.2s' }}
        >
          Stop Camera
        </button>
      </div>
    </div>
  );
}