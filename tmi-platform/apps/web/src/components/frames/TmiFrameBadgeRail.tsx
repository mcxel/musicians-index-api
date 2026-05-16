import React from "react";

export function TmiFrameBadgeRail({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-10 pointer-events-none">
      {children}
    </div>
  );
}