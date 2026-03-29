import {
  createMagazineBrain,
  type ArticlePageRef,
  type ArtistPageRef,
  type IssueBuildInput,
  type PageRef,
  type RandomPageKind,
  type RandomPageRef,
} from '@/systems/magazine';

type ArtistSource = {
  id: string;
  name: string;
  route?: string;
  prestigeRank?: number | null;
};

type ArticleSource = {
  id: string;
  artistId: string;
  title: string;
  slug: string;
  route?: string;
};

type RandomSource = {
  id: string;
  title: string;
  randomKind: RandomPageKind;
  route?: string;
};

export interface MagazineBrainAdapterInput {
  artists: ArtistSource[];
  articles: ArticleSource[];
  randomPages: RandomSource[];
  randomHistory?: RandomPageKind[];
  length?: number;
}

export function toIssueBuildInput(input: MagazineBrainAdapterInput): IssueBuildInput {
  const artistPages: ArtistPageRef[] = input.artists.map((artist) => ({
    id: `artist-${artist.id}`,
    kind: 'artist',
    artistId: artist.id,
    title: artist.name,
    route: artist.route ?? `/artists/${artist.id}`,
    prestigeRank: artist.prestigeRank ?? null,
  }));

  const articlePages: ArticlePageRef[] = input.articles.map((article) => ({
    id: `article-${article.id}`,
    kind: 'article',
    artistId: article.artistId,
    title: article.title,
    slug: article.slug,
    route: article.route ?? `/articles/${article.slug}`,
  }));

  const randomPages: RandomPageRef[] = input.randomPages.map((page) => ({
    id: `random-${page.id}`,
    kind: 'random',
    randomKind: page.randomKind,
    title: page.title,
    route: page.route ?? `/${page.randomKind}`,
  }));

  return {
    artistPages,
    articlePages,
    randomPages,
    randomHistory: input.randomHistory,
    length: input.length,
  };
}

export function createMagazineBrainFromAdapterInput(input: MagazineBrainAdapterInput) {
  return createMagazineBrain(toIssueBuildInput(input));
}

export function buildMockIssueInput(): IssueBuildInput {
  return toIssueBuildInput({
    artists: [
      { id: 'nova-rain', name: 'Nova Rain', route: '/artists/nova-rain', prestigeRank: 12 },
      { id: 'echo-saint', name: 'Echo Saint', route: '/artists/echo-saint', prestigeRank: 9 },
    ],
    articles: [
      {
        id: 'spotlight-nova',
        artistId: 'nova-rain',
        title: 'Nova Rain: Live Signal Takes Off',
        slug: 'nova-rain-live-signal',
        route: '/articles/nova-rain-live-signal',
      },
      {
        id: 'echo-studio',
        artistId: 'echo-saint',
        title: 'Echo Saint Builds a New Studio Ritual',
        slug: 'echo-saint-studio-ritual',
        route: '/articles/echo-saint-studio-ritual',
      },
    ],
    randomPages: [
      { id: 'poll-weekly', title: 'Weekly Fan Poll', randomKind: 'poll', route: '/poll' },
      { id: 'billboard-flash', title: 'Billboard Flash', randomKind: 'billboard', route: '/billboard' },
      { id: 'contest-promo', title: 'Contest Promo', randomKind: 'contest', route: '/contests' },
    ],
    length: 6,
  });
}

export function getHomepageSequenceProof(): string {
  const brain = createMagazineBrain(buildMockIssueInput());
  const pages: PageRef[] = [];

  for (let index = 0; index < 3; index += 1) {
    const page = brain.nextPage();
    if (!page) break;
    pages.push(page);
  }

  return pages.map((page) => page.kind).join(' → ');
}