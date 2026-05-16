"use client";

import React from "react";

interface TmiMagazineControlsProps {
  canGoBack: boolean;
  canGoForward: boolean;
  soundEnabled: boolean;
  isOpen: boolean;
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  onOpen: () => void;
  onClose: () => void;
  onToggleMute: () => void;
  onJumpToFirst: () => void;
  onJumpToLast: () => void;
  onJumpToPage: (page: number) => void;
}

export default function TmiMagazineControls({
  canGoBack,
  canGoForward,
  soundEnabled,
  isOpen,
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  onOpen,
  onClose,
  onToggleMute,
  onJumpToFirst,
  onJumpToLast,
  onJumpToPage,
}: TmiMagazineControlsProps) {
  const [showPicker, setShowPicker] = React.useState(false);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.12em]">
      <button aria-label="Previous page" type="button" onClick={onPrevious} disabled={!canGoBack} className="rounded border border-zinc-500/60 px-2 py-1 disabled:opacity-35">
        ◀ Prev
      </button>
      <button aria-label="Next page" type="button" onClick={onNext} disabled={!canGoForward} className="rounded border border-zinc-500/60 px-2 py-1 disabled:opacity-35">
        Next ▶
      </button>
      <button aria-label={isOpen ? "Close magazine" : "Open magazine"} type="button" onClick={isOpen ? onClose : onOpen} className="rounded border border-fuchsia-400/60 px-2 py-1">
        {isOpen ? "Close Magazine" : "Open Magazine"}
      </button>
      <button aria-label={soundEnabled ? "Mute sound" : "Unmute sound"} type="button" onClick={onToggleMute} className="rounded border border-cyan-400/60 px-2 py-1">
        {soundEnabled ? "Mute Sound" : "Unmute Sound"}
      </button>
      <button aria-label="Jump to first page" type="button" onClick={onJumpToFirst} className="rounded border border-zinc-500/60 px-2 py-1">
        First
      </button>
      <button aria-label="Jump to last page" type="button" onClick={onJumpToLast} className="rounded border border-zinc-500/60 px-2 py-1">
        Last
      </button>
      <button
        aria-label="Open page picker"
        type="button"
        onClick={() => setShowPicker((v) => !v)}
        className="rounded border border-emerald-400/60 px-2 py-1"
      >
        Page {currentPage + 1}/{totalPages}
      </button>
      {showPicker ? (
        <div className="flex max-h-28 gap-1 overflow-auto rounded border border-zinc-600/60 bg-black/70 p-1">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={`picker-${i}`}
              type="button"
              aria-label={`Jump to page ${i + 1}`}
              onClick={() => {
                onJumpToPage(i);
                setShowPicker(false);
              }}
              className={[
                "min-w-8 rounded border px-2 py-1",
                i === currentPage ? "border-cyan-300/80 text-cyan-100" : "border-zinc-600/60 text-zinc-300",
              ].join(" ")}
            >
              {i + 1}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
