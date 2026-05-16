import React from "react";

export default function AwkwardShapeCanvas({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-zinc-950 flex items-center justify-center">
      {/* Dynamic Background Layer */}
      <div className="absolute inset-0 z-0 opacity-80 mix-blend-screen pointer-events-none">
        {/* Burgundy/Maroon Angular Band */}
        <div className="absolute -left-20 top-0 w-full h-96 bg-rose-900/40 blur-[80px] -skew-y-12 transform origin-top-left animate-pulse" />
        
        {/* Golden-Yellow Intersecting Shape */}
        <div className="absolute right-0 bottom-10 w-3/4 h-[50vh] bg-yellow-600/30 blur-[100px] skew-x-12 transform origin-bottom-right" />
        
        {/* Deep Purple Geometric Core */}
        <div className="absolute left-1/4 top-1/4 w-1/2 h-1/2 bg-purple-900/50 blur-[120px] rounded-full mix-blend-overlay" />
      </div>

      {/* Foreground Content Layer */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}