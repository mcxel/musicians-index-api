'use client';
import { createContext, useContext } from 'react';
import { useGenreRotation, GENRE_LABELS, GENRE_ROTATION_ORDER } from '@/lib/engine/GenreRotationEngine';
import type { GenreKey } from '@/packages/home/experience/top10FaceData';

interface ActiveGenreValue {
  genre: GenreKey;
  label: string;
  index: number;
  nextGenre: GenreKey;
}

const DEFAULTS: ActiveGenreValue = {
  genre: GENRE_ROTATION_ORDER[0],
  label: GENRE_LABELS[GENRE_ROTATION_ORDER[0]],
  index: 0,
  nextGenre: GENRE_ROTATION_ORDER[1],
};

const ActiveGenreContext = createContext<ActiveGenreValue>(DEFAULTS);

export function ActiveGenreProvider({ children }: { children: React.ReactNode }) {
  const rotation = useGenreRotation(8000);
  return (
    <ActiveGenreContext.Provider value={rotation}>
      {children}
    </ActiveGenreContext.Provider>
  );
}

export const useActiveGenre = () => useContext(ActiveGenreContext);
