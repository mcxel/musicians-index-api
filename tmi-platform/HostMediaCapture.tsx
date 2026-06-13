import React, { useEffect, useRef } from 'react';
import { MediaCaptureService } from '@/systems/webrtc/MediaCaptureService';

interface HostMediaCaptureProps {
  signalingServerUrl?: string;
}

export const HostMediaCapture: React.FC<HostMediaCaptureProps> = ({ 
  signalingServerUrl = 'wss://signal.berntoutglobal.com/host' 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaServiceRef = useRef<MediaCaptureService>(new MediaCaptureService());

  useEffect(() => {
    if (videoRef.current) {
      mediaServiceRef.current.startCapture(videoRef.current, signalingServerUrl);
    }
    return () => {
      mediaServiceRef.current.stopCapture();
    };
  }, [signalingServerUrl]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0a0a0f', borderRadius: 8, overflow: 'hidden' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(255, 0, 0, 0.8)', color: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 900, letterSpacing: '0.15em' }}>
        ● LIVE HOST
      </div>
    </div>
  );
};