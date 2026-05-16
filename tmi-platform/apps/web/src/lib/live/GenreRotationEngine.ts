export type GenreActivityMap = Partial<Record<string, number>>;

export function pickNextGenre(args: {
  genrePool: string[];
  history: string[];
  currentGenre?: string;
  activity?: GenreActivityMap;
}): string {
  const { genrePool, history, currentGenre, activity } = args;
  if (!genrePool.length) return "Hip-Hop";

  const lastGenre = currentGenre ?? history[history.length - 1];
  const recent = history.slice(-4);

  let bestGenre = genrePool[0];
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const genre of genrePool) {
    if (genre === lastGenre && genrePool.length > 1) continue;

    const activityWeight = activity?.[genre] ?? 1;
    const recencyPenalty = recent.includes(genre) ? 0.6 : 0;
    const score = activityWeight - recencyPenalty;

    if (score > bestScore) {
      bestGenre = genre;
      bestScore = score;
    }
  }

  return bestGenre;
}

export function buildGenreRotationPlan(args: {
  genrePool: string[];
  history: string[];
  currentGenre?: string;
  activity?: GenreActivityMap;
}): { currentGenre: string; nextGenre: string; afterGenre: string } {
  const currentGenre = args.currentGenre ?? pickNextGenre(args);
  const nextGenre = pickNextGenre({
    genrePool: args.genrePool,
    history: [...args.history, currentGenre],
    currentGenre,
    activity: args.activity,
  });
  const afterGenre = pickNextGenre({
    genrePool: args.genrePool,
    history: [...args.history, currentGenre, nextGenre],
    currentGenre: nextGenre,
    activity: args.activity,
  });

  return { currentGenre, nextGenre, afterGenre };
}
