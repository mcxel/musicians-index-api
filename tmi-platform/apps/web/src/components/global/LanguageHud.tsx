"use client";

import { useState } from "react";
import { getAvailableCaptionLanguages, setUserCaptionLanguage, getUserCaptionLanguage } from "@/lib/captions/CaptionLanguageSelector";

interface LanguageHudProps {
  userId: string;
  compact?: boolean;
}

export default function LanguageHud({ userId, compact = false }: LanguageHudProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(getUserCaptionLanguage(userId));
  const languages = getAvailableCaptionLanguages();

  function select(code: string) {
    setUserCaptionLanguage(userId, code);
    setSelected(code);
    setOpen(false);
  }

  const current = languages.find(l => l.code === selected);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono transition-all"
        style={{ background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.2)", color: "#00FFFF" }}
      >
        🌐 {compact ? current?.code.toUpperCase() : current?.label ?? selected}
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-50 w-44 rounded-lg overflow-hidden shadow-xl"
          style={{ background: "#0a0a14", border: "1px solid rgba(0,255,255,0.2)" }}
        >
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => select(lang.code)}
              className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 flex items-center justify-between"
              style={{ color: lang.code === selected ? "#00FFFF" : "rgba(255,255,255,0.7)" }}
            >
              <span>{lang.label}</span>
              <span className="opacity-50">{lang.nativeLabel}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
