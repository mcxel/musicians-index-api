"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { ArtistCardData } from "@/engines/ArtistRotationEngine";

export interface ArtistOrbitCardProps {
  artist: ArtistCardData;
  index: number;
  total: number;
  isActive: boolean;
  isHovered: boolean;
  crown: number;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

/**
 * ArtistOrbitCard
 * Individual artist card in the orbit. Renders at a position in the circle.
 */
export default function ArtistOrbitCard({
  artist,
  index,
  total,
  isActive,
  isHovered,
  crown,
  onHoverStart,
  onHoverEnd,
}: ArtistOrbitCardProps) {
  const [imageError, setImageError] = useState(false);

  // Calculate position in orbit (angle from center)
  const angle = (index / total) * (Math.PI * 2);
  const radius = 120; // px from center
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  // Scale based on active/hovered state
  const scale = isActive ? 1.15 : isHovered ? 1.05 : 1;
  const opacity = isActive ? 1 : 0.65;
  const zIndex = isActive ? 30 : isHovered ? 20 : 10 + index;

  return (
    <Link href={artist.route}>
      <div
        className="absolute transition-all duration-300 cursor-pointer"
        style={{
          transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`,
          opacity,
          zIndex,
        }}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
      >
        {/* Card container */}
        <div
          className={`relative w-24 h-24 rounded-full border-2 overflow-hidden transition-all duration-300 ${
            isActive
              ? "border-cyan-300 shadow-lg shadow-cyan-500/50"
              : isHovered
              ? "border-cyan-200 shadow-md shadow-cyan-400/30"
              : "border-cyan-500/40 shadow-sm shadow-black/20"
          }`}
        >
          {/* Artist avatar image */}
          <div className="w-full h-full relative bg-black">
            {!imageError && artist.avatarUrl ? (
              <Image
                src={artist.avatarUrl}
                alt={artist.name}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                priority={isActive}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500/30 to-blue-500/20">
                <span className="text-[10px] text-cyan-300 font-bold text-center px-1">
                  {artist.name.split(" ")[0]}
                </span>
              </div>
            )}
          </div>

          {/* Crown pulse overlay (when active) */}
          {crown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-yellow-500/40 via-transparent to-transparent animate-pulse">
              <div className="text-yellow-300 font-black text-sm">👑</div>
            </div>
          )}

          {/* Hover effect overlay */}
          {isHovered && (
            <div className="absolute inset-0 bg-cyan-400/20 backdrop-blur-sm flex items-center justify-center">
              <div className="text-white text-[10px] font-bold uppercase tracking-widest bg-black/70 px-2 py-1 rounded">
                View
              </div>
            </div>
          )}
        </div>

        {/* Artist name label below card */}
        <div className="mt-2 text-center">
          <p className="text-xs font-bold text-cyan-100 truncate max-w-[100px]">
            {artist.name}
          </p>
          {artist.crownRank && (
            <p className="text-[10px] text-yellow-300 font-semibold">
              #{artist.crownRank}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
