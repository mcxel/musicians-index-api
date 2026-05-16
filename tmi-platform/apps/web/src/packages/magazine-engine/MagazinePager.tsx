"use client";

import { useMagazinePager } from "./useMagazinePager";

export default function MagazinePager() {
  const { currentIndex, currentPage, pages, canPrev, canNext, prev, next, goToIndex } = useMagazinePager();

  return (
    <div className="absolute bottom-5 left-1/2 z-40 -translate-x-1/2 flex items-center gap-3 rounded-full border border-white/10 bg-black/55 px-4 py-2 backdrop-blur-md">
      <button
        onClick={prev}
        disabled={!canPrev}
        className="rounded px-3 py-1 text-sm disabled:opacity-30"
      >
        Prev
      </button>

      <div className="flex flex-col items-center gap-1">
        <p className="text-[10px] uppercase tracking-[0.16em] text-white/70">{currentPage.title}</p>
        <div className="flex items-center gap-2">
          {pages.map((page, index) => (
            <button
              key={page.id}
              onClick={() => goToIndex(index)}
              aria-label={page.title}
              className={`h-2.5 w-2.5 rounded-full transition ${
                index === currentIndex ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      <button
        onClick={next}
        disabled={!canNext}
        className="rounded px-3 py-1 text-sm disabled:opacity-30"
      >
        Next
      </button>
    </div>
  );
}
