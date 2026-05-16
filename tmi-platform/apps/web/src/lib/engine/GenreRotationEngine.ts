"use client";

import { useEffect, useMemo, useState } from "react";
import type { GenreKey } from "@/packages/home/experience/top10FaceData";

export const GENRE_ROTATION_ORDER: GenreKey[] = [
  "rnb",
  "hiphop",
  "rock",
  "pop",
  "afrobeat",
  "local",
  "worldwide",
  "global",
];

export const GENRE_LABELS: Record<GenreKey, string> = {
  rnb: "R&B",
  hiphop: "Hip-Hop",
  rock: "Rock",
  pop: "Pop",
  afrobeat: "Afrobeat",
  local: "Local",
  worldwide: "Worldwide",
  global: "Global",
};

export function useGenreRotation(holdMs = 5000) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % GENRE_ROTATION_ORDER.length);
    }, holdMs);

    return () => window.clearInterval(id);
  }, [holdMs]);

  const genre = GENRE_ROTATION_ORDER[index];

  return useMemo(
    () => ({
      index,
      genre,
      label: GENRE_LABELS[genre],
      nextGenre: GENRE_ROTATION_ORDER[(index + 1) % GENRE_ROTATION_ORDER.length],
    }),
    [genre, index],
  );
}
