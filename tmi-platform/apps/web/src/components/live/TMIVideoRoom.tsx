'use client';

import React, { useEffect, useRef, useState } from 'react';

interface TMIVideoRoomProps {
  isHost?: boolean;
  roomId: string;
  onBroadcastStart?: () => void;
}

export default function TMIVideoRoom({ isHost = false, roomId, onBroadcastStart }: TMIVideoRoomProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function enableStream() {
      try {
        // Initialize WebKit-native MediaCapture API for Raw Camera Access
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'user' },
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        } else {
          setError("Media Capture and Streams API not supported in this browser/environment.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to access camera and microphone. Please check permissions.");
      }
    }

    if (isHost) {
      enableStream();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isHost]);

  const toggleBroadcast = () => {
    setIsRecording(!isRecording);
    if (!isRecording && onBroadcastStart) {
      onBroadcastStart();
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
      {error ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ff4444', padding: '20px', textAlign: 'center', fontFamily: 'var(--font-orbitron)' }}>
          [SYS_ERR] {error}
        </div>
      ) : (
        <video 
          ref={videoRef} 
          muted={isHost} // Mute local playback to prevent echo
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.1) brightness(1.05)' }} 
        />
      )}

      {/* Director HUD Overlay */}
      <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: '8px', zIndex: 10 }}>
        {isRecording && (
          <div style={{ background: 'rgba(255,0,0,0.2)', border: '1px solid #ff0000', color: '#ff0000', padding: '4px 10px', fontSize: 12, fontWeight: 800, borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px', animation: 'pulse 2s infinite' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ff0000' }} />
            LIVE
          </div>
        )}
        <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '4px 10px', fontSize: 12, fontWeight: 700, borderRadius: '4px' }}>
          ROOM: {roomId.toUpperCase()}
        </div>
      </div>

      {isHost && !error && (
        <button onClick={toggleBroadcast} style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: isRecording ? 'rgba(255,0,0,0.8)' : 'var(--cyan)', color: isRecording ? '#fff' : '#000', border: 'none', padding: '12px 24px', fontSize: 14, fontWeight: 900, borderRadius: '24px', cursor: 'pointer', zIndex: 10, fontFamily: 'var(--font-orbitron)' }}>
          {isRecording ? 'END BROADCAST' : 'INITIALIZE STREAM'}
        </button>
      )}
    </div>
  );
}