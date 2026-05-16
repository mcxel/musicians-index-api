export type ProfileRecommendation = {
  slug: string;
  rooms: string[];
  artists: string[];
  articles: string[];
  sponsors: string[];
  battles: string[];
  generatedAt: number;
};

const roomPool = ["/lobbies", "/lobbies/live-world", "/live/stages"];
const artistPool = ["/artists/nova-cipher", "/artists/flowstate-j", "/artists/test"];
const articlePool = ["/magazine/articles/test", "/magazine", "/home/2"];
const sponsorPool = ["/sponsors", "/hub/sponsor", "/subscriptions"];
const battlePool = ["/battle", "/cypher", "/home/5"];

function hash(seed: string): number {
  return seed.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

function pick(pool: string[], seed: string, count = 2): string[] {
  if (pool.length <= count) return [...pool];
  const start = hash(seed) % pool.length;
  return Array.from({ length: count }, (_, i) => pool[(start + i) % pool.length]);
}

export function getProfileRecommendations(slug: string): ProfileRecommendation {
  const s = slug.trim().toLowerCase();
  return {
    slug: s,
    rooms: pick(roomPool, `${s}:rooms`, 2),
    artists: pick(artistPool, `${s}:artists`, 2),
    articles: pick(articlePool, `${s}:articles`, 2),
    sponsors: pick(sponsorPool, `${s}:sponsors`, 2),
    battles: pick(battlePool, `${s}:battles`, 2),
    generatedAt: Date.now(),
  };
}
