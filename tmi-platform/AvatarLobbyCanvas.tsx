"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from 'three';

interface AvatarLobbyCanvasProps {
  is3DReady?: boolean;
  roomName?: string;
}

/**
 * AvatarLobbyCanvas: The foundational shell for the 3D Avatar integration.
 * Handles compact, expanded, and fullscreen views.
 */
export default function AvatarLobbyCanvas({ is3DReady = false, roomName = "TMI Lobby" }: AvatarLobbyCanvasProps) {
  const [mode, setMode] = useState<"compact" | "expanded" | "fullscreen">("compact");
  const mountRef = useRef<HTMLDivElement>(null);

  // Initialize 3D Ultra-Realistic WebGL Venue Engine
  useEffect(() => {
    if (!is3DReady || !mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050510');
    // Add atmospheric venue fog
    scene.fog = new THREE.FogExp2('#050510', 0.05);

    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    // Enable Ultra-Realistic shadows and rendering
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    mountRef.current.appendChild(renderer.domElement);

    // Cinematic Venue Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const spotLight = new THREE.SpotLight(0x00FFFF, 2);
    spotLight.position.set(0, 10, 5);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = true;
    scene.add(spotLight);

    camera.position.z = 5;

    const animate = function () {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [is3DReady, mode]);

  return (
    <div 
      className={`relative w-full transition-all duration-500 ease-in-out border border-white/10 rounded-xl overflow-hidden bg-[#050510] ${
        mode === "compact" ? "h-64" : mode === "expanded" ? "h-96" : "fixed inset-0 z-50 h-screen rounded-none"
      }`}
    >
      {/* Header / Controls */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-3 bg-gradient-to-b from-black/80 to-transparent">
        <div className="text-[10px] font-black tracking-widest text-[#00FFFF] uppercase">
          {roomName} {is3DReady && "· 3D MODE"}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setMode(mode === "compact" ? "expanded" : "compact")}
            className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[9px] font-bold text-white/70 tracking-wider transition-colors"
          >
            {mode === "compact" ? "EXPAND" : "COMPACT"}
          </button>
          <button 
            onClick={() => setMode(mode === "fullscreen" ? "compact" : "fullscreen")}
            className="px-3 py-1 bg-[#00FFFF]/10 hover:bg-[#00FFFF]/20 border border-[#00FFFF]/30 rounded text-[9px] font-bold text-[#00FFFF] tracking-wider transition-colors"
          >
            {mode === "fullscreen" ? "EXIT FULLSCREEN" : "FULLSCREEN"}
          </button>
        </div>
      </div>

      {/* Canvas Mount Point */}
      <div className="absolute inset-0 z-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1a2e] via-[#050510] to-[#000]">
        {is3DReady ? (
          <div ref={mountRef} className="w-full h-full">
            {/* WebGL/Three.js Venue Output Mounts Here */}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* 2D Placeholder / Bobblehead Scale Reference */}
            <motion.div 
              animate={{ y: [-5, 5, -5] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 sm:w-32 sm:h-32 bg-white/5 border border-dashed border-white/20 rounded-full flex items-center justify-center text-4xl"
            >
              👤
            </motion.div>
            <div className="mt-4 text-[10px] text-white/40 font-mono tracking-widest uppercase">Awaiting 3D Assets</div>
          </div>
        )}
      </div>
    </div>
  );
}