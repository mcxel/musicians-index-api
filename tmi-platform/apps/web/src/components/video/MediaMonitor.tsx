"use client";

import React, { useEffect, useRef, useState } from 'react';

interface MediaMonitorProps {
  mode: 'self-view' | 'remote-view' | 'standby';
  isActive: boolean;
}

export default function MediaMonitor({ mode, isActive }: MediaMonitorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      setIsInitializing(true);
      setError(null);

      try {
        // 1. Check if browser supports WebRTC (requires HTTPS or localhost)
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported. Ensure you are using HTTPS.");
        }

        // 2. Request Camera & Mic
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: true,
        });

        activeStream = mediaStream;

        // 3. Attach stream to the video element safely
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error("WebRTC Initialization Error:", err);
        setError(err.name === 'NotAllowedError' ? "Camera access denied by user." : "Failed to access camera.");
      } finally {
        setIsInitializing(false);
      }
    };

    if (isActive && mode === 'self-view') {
      startCamera();
    }

    // 4. Cleanup: Stop all tracks when component unmounts (prevents ghost cameras)
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, mode]);

  return (
    <div className="relative w-full h-full bg-glass-dark border border-gold-neon rounded-lg overflow-hidden flex items-center justify-center shadow-glow">
      {/* Error State */}
      {error && (
        <div className="absolute z-10 text-red-500 font-bold bg-black/80 px-4 py-2 rounded border border-red-500">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isInitializing && !error && (
        <div className="absolute z-10 text-gold-neon animate-pulse font-mono uppercase tracking-widest">
          Initializing Camera...
        </div>
      )}

      {/* The Video Surface */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={mode === 'self-view'} // Mute self to prevent feedback loop
        className={`w-full h-full object-cover transition-opacity duration-500 ${isInitializing ? 'opacity-0' : 'opacity-100'}`}
      />
      
      {/* Hardware UI Overlay */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <span className="px-2 py-1 bg-black/60 text-xs text-white uppercase border border-white/20 rounded backdrop-blur">
          {mode === 'self-view' ? '● LIVE (SELF)' : '● STANDBY'}
        </span>
      </div>
    </div>
  );
}