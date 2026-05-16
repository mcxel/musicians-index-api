"use client";

/**
 * ArtistSpinRing
 * Visual background ring and orbital guides for the artist wheel.
 * Renders: concentric circles, rotation guides, glow effects.
 */
export default function ArtistSpinRing() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Outer glow circle */}
      <div className="absolute w-80 h-80 rounded-full border border-cyan-500/20 animate-pulse" />
      <div className="absolute w-80 h-80 rounded-full border border-cyan-400/10" style={{ animationDelay: "1s" }} />

      {/* Middle orbit track */}
      <div className="absolute w-72 h-72 rounded-full border border-dashed border-cyan-500/30" />

      {/* Inner anchor circle */}
      <div className="absolute w-16 h-16 rounded-full border border-cyan-300 bg-black/50 flex items-center justify-center shadow-lg shadow-cyan-500/30">
        <div className="w-8 h-8 rounded-full border border-cyan-400 bg-gradient-to-br from-cyan-500/20 to-black animate-spin" style={{ animationDuration: "8s" }} />
      </div>

      {/* Radial guide lines */}
      <div className="absolute w-full h-full">
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * 360;
          return (
            <div
              key={`guide-${i}`}
              className="absolute w-1 h-48 bg-gradient-to-t from-cyan-500/30 to-transparent left-1/2 top-1/2 origin-top"
              style={{
                transform: `translateX(-50%) rotate(${angle}deg)`,
              }}
            />
          );
        })}
      </div>

      {/* Rotation indicator */}
      <div className="absolute top-0 left-1/2 w-1 h-8 bg-gradient-to-b from-yellow-400/60 to-transparent -translate-x-1/2 animate-pulse" />
    </div>
  );
}
