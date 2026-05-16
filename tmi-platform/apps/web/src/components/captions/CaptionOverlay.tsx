"use client";

import { useEffect, useState } from "react";
import { getCurrentCaption, type CaptionEntry } from "@/lib/captions/ClosedCaptionEngine";

interface CaptionOverlayProps {
  trackId: string;
  visible?: boolean;
  position?: "bottom" | "top";
}

export default function CaptionOverlay({ trackId, visible = true, position = "bottom" }: CaptionOverlayProps) {
  const [caption, setCaption] = useState<CaptionEntry | null>(null);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      const current = getCurrentCaption(trackId, Date.now() % 60000);
      setCaption(current);
    }, 500);
    return () => clearInterval(interval);
  }, [trackId, visible]);

  if (!visible || !caption) return null;

  return (
    <div
      className={`absolute left-0 right-0 flex justify-center px-4 pointer-events-none ${position === "top" ? "top-4" : "bottom-4"}`}
      style={{ zIndex: 50 }}
    >
      <div
        className="max-w-lg text-center text-sm font-medium px-4 py-2 rounded-lg"
        style={{
          background: "rgba(0,0,0,0.75)",
          color: "#ffffff",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(255,255,255,0.1)",
          lineHeight: 1.5,
        }}
      >
        {caption.text}
      </div>
    </div>
  );
}
