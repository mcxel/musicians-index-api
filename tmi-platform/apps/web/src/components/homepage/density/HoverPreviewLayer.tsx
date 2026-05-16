"use client";

import type { ReactNode } from "react";

interface HoverPreviewLayerProps {
  children: ReactNode;
  className?: string;
}

export default function HoverPreviewLayer({ children, className = "" }: HoverPreviewLayerProps) {
  return (
    <div
      className={`pointer-events-none absolute left-0 right-0 top-full z-30 mt-2 hidden group-hover:block group-focus-within:block ${className}`}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}
