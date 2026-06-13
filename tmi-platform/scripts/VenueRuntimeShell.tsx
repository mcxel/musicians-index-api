"use client";

import React, { useState, useRef, useEffect } from 'react';
import { RoomHUD } from '../apps/web/src/components/hud/RoomHUD';
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
  const [streamActive, setStreamActive] = useState(false);
  const [mediaPermissionGranted, setMediaPermissionGranted] = useState(false);

  // Advanced Pipeline 1: WebRTC Gated Behind User Interaction
  const joinRoomAndEnableMedia = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 1280, height: 720, frameRate: 30 }, 
            audio: true 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
          setMediaPermissionGranted(true);
        }
      }
    } catch (err) {
      console.error('TMI WebRTC Pipeline Capture Error:', err);
    }
  };

  useEffect(() => {
    return () => {
      // Safely kill AV streams on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="tmi-venue-runtime relative w-full h-screen bg-[#050510] overflow-hidden flex flex-col">
      
      {/* Level 1: 3D Canvas Context (Ready for Three.js inject) */}
      <div className="absolute inset-0 w-full h-full z-0 flex items-center justify-center bg-gradient-to-b from-black to-[#050510]">
        {enable3D && <span className="text-gray-600 font-mono tracking-widest">[ 3D WebGL Canvas Layer ]</span>}
      </div>

      {/* Level 2: Media Overlay Panel */}
      <div className="absolute top-6 right-6 z-10 flex flex-col items-end space-y-4">
        {streamActive && <video ref={videoRef} autoPlay playsInline muted className="w-64 h-36 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.2)] border border-[#00FFFF]/30 object-cover bg-black" />}
        
        {!mediaPermissionGranted && (
            <button onClick={joinRoomAndEnableMedia} className="bg-[#FF2DAA] hover:bg-fuchsia-500 text-white px-6 py-2 rounded-full font-bold shadow-[0_0_15px_rgba(255,45,170,0.5)] transition-all">
                Join Room Camera/Mic
            </button>
        )}
      </div>

      {/* Level 3: HUD Integration & Sponsor Canisters */}
      <RoomHUD venueId={venueId} venueClass={venueClass} />
    </div>
  );
};