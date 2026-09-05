'use client';
import React, { useEffect, useRef, useState } from 'react';
import { TMIWebViewBridge } from '@/lib/hardware/TMIWebViewBridge';

export default function MediaCapturePanel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initCapture = async () => {
      try {
        // Utilize Media Capture and Streams API
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720, frameRate: 30 }, 
          audio: true 
        });
        
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error('[MediaCapturePanel] Failed to access media devices', err);
        setError('Camera/Microphone access denied or unavailable.');
        // Fallback to WebKit bridge if embedded in an app
        TMIWebViewBridge.requestHardwareAccess();
      }
    };

    initCapture();

    return () => {
      // Cleanup hardware tracks on unmount
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  // MediaRecorder API implementation for local capture/VOD generation
  const toggleRecording = () => {
    if (!stream) return;
    
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          // In production, this pushes chunks to the TMI Upload/Ingest Pipeline
          console.log(`[MediaRecorder] Captured chunk size: ${e.data.size} bytes`);
        }
      };
      
      recorder.start(2000); // Dispatch data chunks every 2 seconds
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#050510', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,255,255,0.2)' }}>
      <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      
      {error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', color: '#FF2DAA', fontSize: 12, fontWeight: 900 }}>
          {error}
        </div>
      )}
      
      <button onClick={toggleRecording} disabled={!stream} style={{ position: 'absolute', bottom: 16, left: 16, background: isRecording ? 'rgba(255,0,0,0.8)' : 'rgba(0,255,255,0.8)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 11, fontWeight: 900, cursor: stream ? 'pointer' : 'not-allowed', letterSpacing: '0.1em' }}>
        {isRecording ? '● STOP RECORDING' : '▶ START RECORDING'}
      </button>
    </div>
  );
}
