"use client";

// Ambient crown pulse rings — three concentric rings expanding outward from
// the medallion center with staggered delays to create a heartbeat effect.
// Rendered as a pointer-events-none overlay behind the medallion content.

export default function HeroCrownPulse() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width:  `${170 + i * 90}px`,
            height: `${170 + i * 90}px`,
            border: "1px solid rgba(0,255,255,0.18)",
            animation: `crown-pulse 3s ease-out ${i * 0.95}s infinite`,
          }}
        />
      ))}
      {/* Gold inner pulse ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: "165px",
          height: "165px",
          border: "1px solid rgba(255,215,0,0.14)",
          animation: "crown-pulse 4.5s ease-out 0.4s infinite",
        }}
      />
      <style>{`
        @keyframes crown-pulse {
          0%   { opacity: 0.55; transform: scale(0.82); }
          65%  { opacity: 0.12; transform: scale(1.12); }
          100% { opacity: 0;   transform: scale(1.28); }
        }
      `}</style>
    </div>
  );
}
