import type {
  ArticlePageRef,
  IssueBuildInput,
  IssueBuildOutput,
} from './types';
import { getExpectedNextKind } from './SequenceController';
import { selectBalancedRandomPage } from './RandomPageSelector';

export function buildIssueSequence(input: IssueBuildInput): IssueBuildOutput {
  const artistQueue = [...input.artistPages];
  const articleQueue = [...input.articlePages];
  const randomPool = [...input.randomPages];
  const targetLength = input.length ?? Math.min(artistQueue.length * 3, 30);
  const randomHistory = [...(input.randomHistory ?? [])];
  const sequence = [];

  for (let index = 0; index < targetLength; index += 1) {
    const expectedKind = getExpectedNextKind(index);

    if (expectedKind === 'artist') {
      const artist = artistQueue.shift();
      if (!artist) break;
      sequence.push({ slot: { index, expectedKind }, page: artist });
      continue;
    }

    if (expectedKind === 'article') {
      const lastArtist = sequence[sequence.length - 1]?.page;
      const article = pickArticleForArtist(
        articleQueue,
        lastArtist?.kind === 'artist' ? lastArtist.artistId : undefined
      );
      if (!article) break;
      sequence.push({ slot: { index, expectedKind }, page: article });
      continue;
    }

    const randomPage = selectBalancedRandomPage(randomPool, randomHistory);
    if (!randomPage) break;
    sequence.push({ slot: { index, expectedKind }, page: randomPage });
    randomHistory.push(randomPage.randomKind);
  }

  return { sequence, randomHistory };
}

function pickArticleForArtist(
  articles: ArticlePageRef[],
  artistId?: string
): ArticlePageRef | undefined {
  if (!artistId) return articles.shift();

  const matchIndex = articles.findIndex((article) => article.artistId === artistId);
  if (matchIndex >= 0) {
    const [match] = articles.splice(matchIndex, 1);
    return match;
  }

  return articles.shift();
}
