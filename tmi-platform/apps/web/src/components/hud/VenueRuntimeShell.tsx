"use client";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows, Grid } from '@react-three/drei';
import { RoomHUD } from './RoomHUD';

interface VenueRuntimeShellProps {
  venueId: string;
  venueClass: string;
  enable3D?: boolean;
}

type CaptureMode = 'camera' | 'screen';

function VenueStage() {
  return (
    <group>
      {/* Stage platform */}
      <mesh position={[0, -0.5, 0]} receiveShadow castShadow>
        <boxGeometry args={[12, 0.3, 6]} />
        <meshStandardMaterial color="#0a0a1a" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Stage edge glow strips — cyan */}
      <mesh position={[0, -0.34, 3]}>
        <boxGeometry args={[12, 0.02, 0.06]} />
        <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={3} />
      </mesh>
      {/* Stage edge glow strips — fuchsia */}
      <mesh position={[0, -0.34, -3]}>
        <boxGeometry args={[12, 0.02, 0.06]} />
        <meshStandardMaterial color="#FF2DAA" emissive="#FF2DAA" emissiveIntensity={3} />
      </mesh>
      {/* Center mic stand placeholder */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.6, 8]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Scene3D() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <spotLight
        position={[0, 12, 0]}
        angle={0.4}
        penumbra={0.8}
        intensity={4}
        color="#AA2DFF"
        castShadow
      />
      <spotLight position={[-8, 10, 4]} angle={0.3} penumbra={1} intensity={2} color="#00FFFF" />
      <spotLight position={[8, 10, 4]} angle={0.3} penumbra={1} intensity={2} color="#FF2DAA" />
      <VenueStage />
      <Grid
        position={[0, -0.66, 0]}
        args={[30, 30]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#00FFFF"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#AA2DFF"
        fadeDistance={20}
        fadeStrength={1}
        infiniteGrid
      />
      <ContactShadows position={[0, -0.65, 0]} opacity={0.6} scale={20} blur={2} far={4} />
      <Environment preset="night" />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={Math.PI / 4}
        autoRotate
        autoRotateSpeed={0.4}
      />
    </>
  );
}

export const VenueRuntimeShell: React.FC<VenueRuntimeShellProps> = ({
  venueId,
  venueClass,
  enable3D = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [mediaGranted, setMediaGranted] = useState(false);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('camera');
  const [captureError, setCaptureError] = useState('');

  const stopCurrentStream = () => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(t => t.stop());
      activeStreamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreamActive(false);
    setMediaGranted(false);
  };

  const startCameraCapture = async () => {
    setCaptureError('');
    try {
      stopCurrentStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 60, max: 60 } },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      activeStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStreamActive(true);
      setMediaGranted(true);
      setCaptureMode('camera');
    } catch (err) {
      setCaptureError('Camera access denied. Check browser permissions.');
      console.error('[TMI WebRTC] Camera capture error:', err);
    }
  };

  // Screen capture for game streaming — uses getDisplayMedia instead of getUserMedia
  const startScreenCapture = async () => {
    setCaptureError('');
    try {
      stopCurrentStream();
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60 },
          // @ts-expect-error — cursor is a non-standard but widely supported constraint
          cursor: 'always',
        },
        audio: true,
      });
      activeStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStreamActive(true);
      setMediaGranted(true);
      setCaptureMode('screen');
      // Auto-stop when user ends screen share via browser UI
      stream.getVideoTracks()[0]?.addEventListener('ended', stopCurrentStream);
    } catch (err) {
      if ((err as Error).name !== 'NotAllowedError') {
        setCaptureError('Screen capture failed. Try again.');
      }
      console.error('[TMI WebRTC] Screen capture error:', err);
    }
  };

  useEffect(() => {
    return () => stopCurrentStream();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="tmi-venue-runtime relative w-full h-screen bg-[#050510] overflow-hidden flex flex-col font-sans">

      {/* Level 1: 3D Canvas — R3F with glowing TMI stage */}
      {enable3D && (
        <div className="absolute inset-0 w-full h-full z-0">
          <Canvas
            className="w-full h-full"
            camera={{ position: [0, 3, 10], fov: 50 }}
            gl={{ antialias: true, alpha: false }}
            shadows
          >
            <Suspense fallback={null}>
              <Scene3D />
            </Suspense>
          </Canvas>
        </div>
      )}
      {enable3D && !streamActive && (
        <div className="absolute inset-0 flex items-end justify-center z-10 pb-32 pointer-events-none">
          <span className="text-[#AA2DFF] font-mono tracking-[0.4em] text-xs opacity-40">
            [ TMI 3D VENUE — {venueClass.toUpperCase()} ]
          </span>
        </div>
      )}

      {/* Level 2: WebRTC Media Panel */}
      <div className="absolute top-24 right-6 z-30 flex flex-col items-end gap-3">
        {streamActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-72 h-40 rounded-xl object-cover bg-black border border-[#00FFFF]/40 shadow-[0_0_30px_rgba(0,255,255,0.3)]"
            />
            <div
              className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.7)', fontSize: 8, letterSpacing: '0.12em', color: '#00FF88' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse inline-block" />
              {captureMode === 'screen' ? 'SCREEN SHARE' : 'LIVE'}
            </div>
            <button
              onClick={stopCurrentStream}
              className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs transition-all"
              style={{ background: 'rgba(255,45,170,0.7)' }}
            >
              ×
            </button>
          </motion.div>
        )}

        {/* Capture controls */}
        {!mediaGranted ? (
          <div className="flex flex-col gap-2 items-end">
            <button
              onClick={startCameraCapture}
              className="px-5 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all min-h-[40px]"
              style={{ background: '#FF2DAA', color: '#fff', boxShadow: '0 0 20px rgba(255,45,170,0.5)' }}
            >
              Activate Camera / Mic
            </button>
            <button
              onClick={startScreenCapture}
              className="px-5 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all min-h-[40px]"
              style={{ background: 'rgba(0,255,255,0.1)', color: '#00FFFF', border: '1px solid rgba(0,255,255,0.3)' }}
            >
              Share Screen
            </button>
            {captureError && (
              <div style={{ fontSize: 10, color: '#FF6B6B', maxWidth: 200, textAlign: 'right' }}>
                {captureError}
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            {captureMode === 'camera' ? (
              <button
                onClick={startScreenCapture}
                className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest min-h-[36px]"
                style={{ background: 'rgba(0,255,255,0.1)', color: '#00FFFF', border: '1px solid rgba(0,255,255,0.3)' }}
              >
                Switch to Screen
              </button>
            ) : (
              <button
                onClick={startCameraCapture}
                className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest min-h-[36px]"
                style={{ background: 'rgba(255,45,170,0.1)', color: '#FF2DAA', border: '1px solid rgba(255,45,170,0.3)' }}
              >
                Switch to Camera
              </button>
            )}
          </div>
        )}
      </div>

      {/* Level 3: HUD Composition */}
      <RoomHUD venueId={venueId} venueClass={venueClass} />
    </div>
  );
};
