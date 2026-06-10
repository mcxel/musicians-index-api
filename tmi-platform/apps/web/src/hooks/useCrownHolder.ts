'use client';
import { useEffect, useState } from 'react';
import { fetchTop10 } from '@/lib/api/homepage';
import { buildCrownCandidates } from '@/lib/crown/candidates';
import { resolveCrownState } from '@/lib/crown/governance';

export interface CrownHolder {
  id: string;
  name: string;
  genre: string;
  score: number;
  image: string | null;
  slug: string | null;
}

export function useCrownHolder(genre?: string): { crown: CrownHolder | null; loading: boolean } {
  const [crown, setCrown] = useState<CrownHolder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTop10(10).then((rows) => {
      if (!rows) { setLoading(false); return; }
      const candidates = buildCrownCandidates({ top10Rows: rows as unknown as Array<Record<string, unknown>> });
      const result = resolveCrownState({}, candidates);
      const resolution = genre
        ? (result.resolutions.find(r => r.genre.toLowerCase() === genre.toLowerCase()) ?? result.resolutions[0])
        : result.resolutions[0];
      const winner = resolution?.winner;
      if (winner) {
        setCrown({
          id: winner.id,
          name: (winner.raw?.stageName as string) ?? winner.id,
          genre: winner.genre,
          score: winner.score,
          image: (winner.raw?.image as string) ?? null,
          slug: (winner.raw?.slug as string) ?? null,
        });
      }
      setLoading(false);
    });
  }, [genre]);

  return { crown, loading };
}
