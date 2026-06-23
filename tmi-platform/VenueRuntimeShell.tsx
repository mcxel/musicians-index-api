"use client";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment, OrbitControls, ContactShadows } from '@react-three/drei';
import { RoomHUD } from '../components/hud/RoomHUD';

function StageModel() {
  // Place your real stage .glb or .gltf path in the public directory here
  const { scene } = useGLTF('/models/venue-stage.glb');
  return <primitive object={scene} scale={1.5} position={[0, -1, 0]} />;
}

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

  // Picture-in-Picture Pipeline for Unobstructed Viewing
  const togglePiP = async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (err) {
        console.error('TMI PiP Error:', err);
      }
    }
  };

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
        {enable3D && (
          <Canvas className="absolute inset-0 w-full h-full" camera={{ position: [0, 2, 8], fov: 45 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.4} />
              <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} castShadow />
              <StageModel />
              <Environment preset="night" />
              <ContactShadows position={[0, -1, 0]} opacity={0.5} scale={20} blur={2} far={4} />
              <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2 + 0.1} minPolarAngle={Math.PI / 3} />
            </Suspense>
          </Canvas>
        )}
        {enable3D && !streamActive && <span className="text-gray-600 font-mono tracking-widest text-sm z-10 absolute pointer-events-none">[ 3D VENUE ENGINE IDLE ]</span>}
      </div>

      {/* Level 2: Media Overlay Panel (WebRTC Live Feed) */}
      <div className="absolute top-24 right-6 z-30 flex flex-col items-end space-y-4">
        {streamActive && (
            <div className="flex flex-col items-end gap-2">
              <motion.video 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  ref={videoRef} autoPlay playsInline muted 
                  className="w-72 h-40 rounded-xl shadow-[0_0_30px_rgba(0,255,255,0.3)] border border-[#00FFFF]/40 object-cover bg-black" 
              />
              <div className="flex items-center gap-2">
                <button onClick={togglePiP} className="bg-[#AA2DFF]/80 backdrop-blur-md hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold shadow-[0_0_15px_rgba(170,45,255,0.4)] transition-all uppercase tracking-widest text-[9px]">
                  Pop Out (PiP)
                </button>
              </div>
            </div>
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