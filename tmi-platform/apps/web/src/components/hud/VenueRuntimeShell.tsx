"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RoomHUD } from './RoomHUD';
// Ready for integration with @react-three/fiber and @react-three/drei

interface VenueRuntimeShellProps {
  venueId: string;
  venueClass: string;
  enable3D?: boolean;
}

export const VenueRuntimeShell: React.FC<VenueRuntimeShellProps> = ({
  venueId,
  venueClass,
  enable3D = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [mediaPermissionGranted, setMediaPermissionGranted] = useState(false);

  // Advanced Pipeline 1: WebRTC Gated Behind User Interaction (HD / 60FPS)
  const joinRoomAndEnableMedia = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 60, max: 60 } }, 
            audio: { echoCancellation: true, noiseSuppression: true } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
          setMediaPermissionGranted(true);
        }
      }
    } catch (err) {
      console.error('TMI WebRTC Pipeline Capture Error. Verify Permissions/HTTPS:', err);
    }
  };

  // Advanced Pipeline 2: 3D Environment Initialization
  useEffect(() => {
    if (enable3D && canvasRef.current) {
        const ctx = canvasRef.current.getContext('webgl2');
        if (ctx) {
            ctx.clearColor(0.02, 0.02, 0.05, 1.0); // TMI Dark Space Baseline
            ctx.clear(ctx.COLOR_BUFFER_BIT);
        }
    }
  }, [enable3D]);

  useEffect(() => {
    return () => {
      // Safely kill AV streams on unmount to release hardware locks
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="tmi-venue-runtime relative w-full h-screen bg-[#050510] overflow-hidden flex flex-col font-sans">
      
      {/* Level 1: 3D Canvas Context */}
      <div className="absolute inset-0 w-full h-full z-0 flex items-center justify-center bg-gradient-to-b from-black to-[#050510]">
        {enable3D && <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />}
        {enable3D && !streamActive && <span className="text-gray-600 font-mono tracking-widest text-sm z-10">[ 3D VENUE ENGINE IDLE ]</span>}
      </div>

      {/* Level 2: Media Overlay Panel (WebRTC Live Feed) */}
      <div className="absolute top-24 right-6 z-30 flex flex-col items-end space-y-4">
        {streamActive && (
            <motion.video 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                ref={videoRef} autoPlay playsInline muted 
                className="w-72 h-40 rounded-xl shadow-[0_0_30px_rgba(0,255,255,0.3)] border border-[#00FFFF]/40 object-cover bg-black" 
            />
        )}
        
        {!mediaPermissionGranted && (
            <button onClick={joinRoomAndEnableMedia} className="bg-[#FF2DAA] hover:bg-fuchsia-500 text-white px-8 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(255,45,170,0.6)] transition-all uppercase tracking-widest text-xs">
                Activate Camera / Mic
            </button>
        )}
      </div>

      {/* Level 3: Fully Integrated HUD Composition */}
      <RoomHUD venueId={venueId} venueClass={venueClass} />
    </div>
  );
};