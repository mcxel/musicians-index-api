"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getDistricts, sortDistrictsByIntent } from "@/lib/arena/BillboardArenaEngine";
import { getIntent, recordEngagement } from "@/lib/arena/IntentEngine";
import { useFreeRoamNavigation } from "@/hooks/useFreeRoamNavigation";
import BillboardDistrictCard from "@/components/arena/BillboardDistrictCard";
import { FirstRoomHUDBanner } from "@/components/arena/FirstRoomHUDBanner";
import { LiveActivityDrip } from "@/components/arena/LiveActivityDrip";
import type { ArenaDistrict } from "@/lib/arena/BillboardArenaEngine";

// Module-level keyframes
let cssInjected = false;
const CSS = `
@keyframes arenaFadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes titleGlow {
  0%,100% { text-shadow: 0 0 20px rgba(0,255,255,0.5); }
  50%      { text-shadow: 0 0 40px rgba(0,255,255,0.9), 0 0 80px rgba(255,45,170,0.4); }
}
@keyframes particleDrift {
  0%   { transform: translate(0,0) scale(1); opacity: 0.6; }
  100% { transform: translate(var(--px), var(--py)) scale(0.4); opacity: 0; }
}
`;

interface Particle { id: number; x: number; y: number; dx: number; dy: number; size: number; color: string }
const PARTICLE_COLORS = ["#00FFFF", "#FF2DAA", "#FFD700", "#AA2DFF", "#00FF88"];

function buildParticles(): Particle[] {
  return Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: (i * 37) % 100,
    y: (i * 23) % 100,
    dx: ((i * 13) % 40) - 20,
    dy: -((i * 7) % 60) - 20,
    size: 1 + (i % 3),
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length] ?? "#00FFFF",
  }));
}

export default function BillboardArena() {
  const { jumpTo, isWarping } = useFreeRoamNavigation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const particles = useMemo(buildParticles, []);

  const districts = useMemo(() => {
    const all    = getDistricts();
    const intent = typeof window !== "undefined" ? getIntent() : null;
    return sortDistrictsByIntent(all, intent);
  }, []);

  useEffect(() => {
    if (cssInjected || typeof document === "undefined") return;
    cssInjected = true;
    const s = document.createElement("style");
    s.textContent = CSS;
    document.head.appendChild(s);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width  - 0.5) * 2,
      y: ((e.clientY - rect.top)  / rect.height - 0.5) * 2,
    });
  }, []);

  const handleDistrictClick = useCallback((district: ArenaDistrict) => {
    recordEngagement(district.theme, 3);
    jumpTo(district.destination);
  }, [jumpTo]);

  const perspX = mousePos.x * 8;
  const perspY = mousePos.y * 5;

  return (
    <>
    <FirstRoomHUDBanner />
    <LiveActivityDrip />
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% 30%, #0a0520 0%, #050510 55%, #000 100%)",
        color: "#fff",
        overflowX: "hidden",
        paddingBottom: 80,
        fontFamily: "'Inter', sans-serif",
        position: "relative",
      }}
    >
      {/* Ambient particle field */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} aria-hidden>
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size,
              borderRadius: "50%",
              background: p.color,
              opacity: 0.3,
              // @ts-expect-error custom properties
              "--px": `${p.dx}px`,
              "--py": `${p.dy}px`,
              animation: `particleDrift ${12 + (p.id % 8)}s linear infinite`,
            }}
          />
        ))}
      </div>

      {/* Warp overlay */}
      {isWarping && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9990,
          background: "radial-gradient(ellipse at center, #0a0520, #000)",
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
        }}>
          <div style={{
            fontSize: 12, fontWeight: 900, letterSpacing: "0.4em",
            color: "#00FFFF",
            animation: "titleGlow 0.8s ease-in-out infinite",
          }}>
            WARPING...
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{
          textAlign: "center",
          padding: "72px 0 52px",
          animation: "arenaFadeIn 0.7s ease-out",
        }}>
          <div style={{
            fontSize: 9, fontWeight: 900, letterSpacing: "0.55em",
            color: "#00FFFF", marginBottom: 14,
          }}>
            THE MUSICIAN'S INDEX
          </div>
          <h1 style={{
            fontSize: "clamp(2rem, 5.5vw, 4rem)",
            fontWeight: 900, margin: "0 0 12px",
            animation: "titleGlow 3s ease-in-out infinite",
          }}>
            Choose Your District
          </h1>
          <p style={{
            fontSize: "clamp(13px, 1.8vw, 16px)",
            color: "rgba(255,255,255,0.4)",
            maxWidth: 480, margin: "0 auto",
            lineHeight: 1.6,
          }}>
            Every door is live. Every room is alive. Where do you want to go?
          </p>
        </div>

        {/* 3D camera rail — grid with perspective parallax */}
        <div style={{
          perspective: "1200px",
          perspectiveOrigin: "50% 50%",
        }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
              transform: `rotateX(${perspY * 1.2}deg) rotateY(${perspX * 0.8}deg)`,
              transition: "transform 0.15s ease-out",
              transformStyle: "preserve-3d",
            }}
          >
            {districts.map((district, i) => (
              <div
                key={district.id}
                style={{
                  animation: `arenaFadeIn 0.5s ${i * 0.07}s ease-out both`,
                }}
              >
                <BillboardDistrictCard
                  district={district}
                  isHovered={hoveredId === district.id}
                  onHover={setHoveredId}
                  onClick={handleDistrictClick}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom nav strip */}
        <div style={{
          marginTop: 52,
          display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap",
        }}>
          {[
            { label: "→ My Hub",       href: "/hub"           },
            { label: "→ Go Live",      href: "/go-live"       },
            { label: "→ Magazine",     href: "/magazine"      },
            { label: "→ My Profile",   href: "/profile"       },
          ].map((l) => (
            <button
              key={l.href}
              onClick={() => jumpTo(l.href)}
              style={{
                padding: "10px 18px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8, color: "rgba(255,255,255,0.5)",
                fontWeight: 700, fontSize: 11, cursor: "pointer",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#00FFFF"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,255,255,0.3)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}
