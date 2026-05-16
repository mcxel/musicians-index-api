"use client";

import { useState } from "react";
import { getLanguage, type SupportedLanguage } from "@/lib/global/LanguageAssistEngine";
import { getUserCaptionLanguage } from "@/lib/captions/CaptionLanguageSelector";

interface TranslationToggleProps {
  userId: string;
  onToggle?: (enabled: boolean) => void;
  label?: string;
}

export default function TranslationToggle({ userId, onToggle, label }: TranslationToggleProps) {
  const [enabled, setEnabled] = useState(false);
  const lang = getUserCaptionLanguage(userId);
  const profile = getLanguage(lang as SupportedLanguage);

  if (!profile?.translationSupported) return null;

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    onToggle?.(next);
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono transition-all"
      style={{
        background: enabled ? "rgba(0,255,255,0.15)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${enabled ? "rgba(0,255,255,0.4)" : "rgba(255,255,255,0.1)"}`,
        color: enabled ? "#00FFFF" : "rgba(255,255,255,0.5)",
      }}
    >
      <span>{enabled ? "🔤" : "🌐"}</span>
      <span>{label ?? (enabled ? "Translating" : "Translate")}</span>
    </button>
  );
}
