"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SponsorNode {
  id: string;
  name: string;
  color: string;
  logo: string;
}

export const SponsorBubbleOrbitCanister: React.FC = () => {
  const [rotation, setRotation] = useState(0);

  const sponsors: SponsorNode[] = [
    { id: 'sp1', name: 'ENERGY', color: '#00FFFF', logo: '⚡' },
    { id: 'sp2', name: 'GEAR', color: '#FFD700', logo: '🎧' },
    { id: 'sp3', name: 'SOUND', color: '#FF2DAA', logo: '🎵' },
    { id: 'sp4', name: 'VIBE', color: '#AA2DFF', logo: '✨' },
  ];

  useEffect(() => {
    // Smooth 60fps orbital rotation engine
    let animationFrameId: number;
    const rotate = () => {
      setRotation((prev) => (prev + 0.2) % 360);
      animationFrameId = requestAnimationFrame(rotate);
    };
    rotate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="absolute top-1/3 right-12 w-48 h-48 pointer-events-none perspective-[800px] z-30">
      <div className="relative w-full h-full transform-style-3d" style={{ transform: `rotateY(${rotation}deg) rotateX(-10deg)` }}>
        {sponsors.map((sponsor, i) => {
          const angle = (i / sponsors.length) * 360;
          return (
            <div
              key={sponsor.id}
              className="absolute top-1/2 left-1/2 w-14 h-14 -ml-7 -mt-7 rounded-full flex items-center justify-center bg-black/60 backdrop-blur-md border shadow-2xl transition-all"
              style={{
                transform: `rotateY(${angle}deg) translateZ(100px) rotateY(${-rotation - angle}deg)`,
                borderColor: sponsor.color,
                boxShadow: `0 0 20px ${sponsor.color}80, inset 0 0 10px ${sponsor.color}40`,
              }}
            >
              <span className="text-xl drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">{sponsor.logo}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};