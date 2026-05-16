"use client";

import { useState } from "react";
import { isCaptionLanguageAvailable, getUserCaptionLanguage } from "@/lib/captions/CaptionLanguageSelector";

interface CaptionToggleProps {
  userId: string;
  onToggle?: (enabled: boolean) => void;
}

export default function CaptionToggle({ userId, onToggle }: CaptionToggleProps) {
  const [enabled, setEnabled] = useState(false);
  const lang = getUserCaptionLanguage(userId);
  const available = isCaptionLanguageAvailable(lang);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    onToggle?.(next);
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono transition-all"
      style={{
        background: enabled ? "rgba(170,45,255,0.15)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${enabled ? "rgba(170,45,255,0.4)" : "rgba(255,255,255,0.1)"}`,
        color: enabled ? "#AA2DFF" : "rgba(255,255,255,0.4)",
      }}
      title={!available ? `Captions not yet available in ${lang.toUpperCase()}` : undefined}
    >
      <span>CC</span>
      {!available && <span className="opacity-40 ml-1">soon</span>}
    </button>
  );
}
