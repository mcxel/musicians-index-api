"use client";
import { motion } from 'framer-motion';

interface CrowdPulseLightsProps {
  active?: boolean;
  baseColor?: string;
  pulseColor?: string;
  count?: number;     // number of crowd light orbs
  bpm?: number;       // beats per minute — drives pulse speed
}

export default function CrowdPulseLights({
  active = true,
  baseColor = '#AA2DFF',
  pulseColor = '#FF2DAA',
  count = 16,
  bpm = 120,
}: CrowdPulseLightsProps) {
  if (!active) return null;

  const beatDuration = 60 / bpm;

  return (
    <div style={{
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      height: '30%',
      pointerEvents: 'none',
      overflow: 'hidden',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around',
      padding: '0 2%',
    }}>
      {Array.from({ length: count }, (_, i) => (
        <motion.div
          key={i}
          style={{
            width: `${70 / count}%`,
            aspectRatio: '1',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${pulseColor}CC, ${baseColor}44)`,
            filter: `blur(4px)`,
          }}
          animate={{
            opacity: [0.3, 0.9, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            repeat: Infinity,
            duration: beatDuration,
            ease: 'easeInOut',
            delay: (i / count) * beatDuration * 0.5,
          }}
        />
      ))}
    </div>
  );
}
