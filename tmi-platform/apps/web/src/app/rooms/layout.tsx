import type { ReactNode } from "react";

export default function RoomsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* ── 80s neon stage environment frame ── fixed overlay, pointer-events: none ── */}
      <div
        aria-hidden
        style={{ position: "fixed", inset: 0, zIndex: 50, pointerEvents: "none", overflow: "hidden" }}
      >
        {/* Marquee lights — top strip */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 11,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 13,
          background: "rgba(0,0,0,0.6)",
        }}>
          {Array.from({ length: 52 }).map((_, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: "50%",
              background: i % 3 === 0 ? "#FFD700" : i % 3 === 1 ? "#FF2DAA" : "#00FFFF",
              boxShadow: `0 0 6px ${i % 3 === 0 ? "#FFD700" : i % 3 === 1 ? "#FF2DAA" : "#00FFFF"}`,
              animation: "tmiDotBlink 1.4s ease-in-out infinite alternate",
              animationDelay: `${i * 0.06}s`,
            }} />
          ))}
        </div>

        {/* Marquee lights — bottom strip */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 11,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 13,
          background: "rgba(0,0,0,0.5)",
        }}>
          {Array.from({ length: 52 }).map((_, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: "50%",
              background: i % 4 === 0 ? "#AA2DFF" : i % 4 === 1 ? "#FFD700" : i % 4 === 2 ? "#FF2DAA" : "#00FFFF",
              boxShadow: `0 0 6px ${i % 4 === 0 ? "#AA2DFF" : "#FFD700"}`,
              animation: "tmiDotBlink 1.8s ease-in-out infinite alternate",
              animationDelay: `${i * 0.08}s`,
            }} />
          ))}
        </div>

        {/* Left neon edge bar */}
        <div style={{
          position: "absolute", top: 11, bottom: 11, left: 0, width: 4,
          background: "linear-gradient(to bottom, #FF2DAA, #AA2DFF, #00FFFF, #FFD700, #FF2DAA)",
          opacity: 0.7,
          animation: "tmiEdgePulse 4s ease-in-out infinite alternate",
        }} />

        {/* Right neon edge bar */}
        <div style={{
          position: "absolute", top: 11, bottom: 11, right: 0, width: 4,
          background: "linear-gradient(to bottom, #00FFFF, #FFD700, #FF2DAA, #AA2DFF, #00FFFF)",
          opacity: 0.7,
          animation: "tmiEdgePulse 4s ease-in-out infinite alternate",
          animationDelay: "2s",
        }} />

        {/* Spotlight rays — fan from bottom-center */}
        <svg
          style={{ position: "absolute", bottom: 11, left: 0, right: 0, width: "100%", height: "55%", opacity: 0.09 }}
          viewBox="0 0 1200 600"
          preserveAspectRatio="none"
        >
          {[
            { x: 600, color: "#FF2DAA", angle: 0   },
            { x: 600, color: "#AA2DFF", angle: -20  },
            { x: 600, color: "#00FFFF", angle: 20   },
            { x: 600, color: "#FFD700", angle: -40  },
            { x: 600, color: "#FF2DAA", angle: 40   },
            { x: 600, color: "#AA2DFF", angle: -65  },
            { x: 600, color: "#00FFFF", angle: 65   },
          ].map((ray, i) => {
            const rad = (ray.angle * Math.PI) / 180;
            const endX = 600 + Math.sin(rad) * 1200;
            const endY = -Math.cos(rad) * 800;
            return (
              <line
                key={i}
                x1={600} y1={600}
                x2={endX} y2={endY}
                stroke={ray.color}
                strokeWidth={120}
                strokeLinecap="round"
                opacity={0.8}
              />
            );
          })}
        </svg>

        {/* Audience silhouettes row — above bottom strip */}
        <div style={{
          position: "absolute", bottom: 11, left: 0, right: 0, height: 72,
          overflow: "hidden", opacity: 0.45,
        }}>
          <svg width="100%" height="72" viewBox="0 0 1400 72" preserveAspectRatio="xMidYMax meet" aria-hidden>
            {Array.from({ length: 64 }).map((_, i) => {
              const h = 50 + Math.round(Math.sin(i * 1.37) * 14);
              const x = (i / 64) * 1400;
              const w = 16;
              return (
                <g key={i} transform={`translate(${x}, ${72 - h})`}>
                  <ellipse cx={w / 2} cy={0} rx={w * 0.45} ry={h * 0.2} fill={i % 9 === 0 ? "#FF2DAA66" : "#110828"} />
                  <rect x={w * 0.15} y={0} width={w * 0.7} height={h * 0.85} rx={2} fill="#080618" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Confetti burst — top corners */}
        {["-30px", "calc(100% - 30px)"].map((left, li) => (
          <div key={li} style={{ position: "absolute", top: 20, left, pointerEvents: "none" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{
                position: "absolute",
                width: 5, height: 5,
                background: ["#FF2DAA","#FFD700","#00FFFF","#AA2DFF","#FF6600","#4ade80"][i]!,
                borderRadius: i % 2 === 0 ? "50%" : 1,
                left: `${i * 6 - 18}px`,
                top: `${(i % 3) * 8}px`,
                animation: `tmiCornerConfetti ${1.5 + i * 0.4}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.2}s`,
              }} />
            ))}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes tmiDotBlink { from { opacity: 0.25; } to { opacity: 1; } }
        @keyframes tmiEdgePulse { from { opacity: 0.4; } to { opacity: 0.9; } }
        @keyframes tmiCornerConfetti { from { transform: translateY(0) rotate(0deg); opacity: 0.8; } to { transform: translateY(14px) rotate(180deg); opacity: 0.3; } }
      `}</style>

      {/* ── Room content ── */}
      <div style={{ position: "relative", zIndex: 1, paddingTop: 11, paddingBottom: 11, paddingLeft: 4, paddingRight: 4 }}>
        {children}
      </div>
    </>
  );
}
