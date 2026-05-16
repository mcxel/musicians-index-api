import { buildCrownCenterMotion } from "./CrownCenterMotionEngine";
import { getTopCrownRuntime } from "./CrownRankRuntime";
import { resolveHomepageRankingMotion } from "./HomepageRankingMotionEngine";
import { resolveArtistReelLink } from "./ArtistReelLinkEngine";

export type HomepageHeroCrownRuntime = {
  artistId: string;
  name: string;
  genre: string;
  rank: number;
  score: number;
  flagEmoji: string;
  articleRoute: string;
  profileRoute: string;
  voteRoute: string;
  posterFrameUrl: string;
  mediaStatus: string;
  motionSource: string;
  durationSeconds: 6 | 7;
  articleLink: ReturnType<typeof resolveArtistReelLink>;
  motionPlan: ReturnType<typeof buildCrownCenterMotion>;
};

export function getHomepageHeroCrownRuntime(heroImageRef?: string | null): HomepageHeroCrownRuntime | null {
  const winner = getTopCrownRuntime();
  if (!winner) return null;

  const motion = resolveHomepageRankingMotion(winner);
  const articleLink = resolveArtistReelLink({
    artistId: winner.artistId,
    articleRoute: winner.articleRoute,
    fallbackRoute: winner.route,
  });

  return {
    artistId: winner.artistId,
    name: winner.name,
    genre: winner.genre,
    rank: winner.rank,
    score: winner.score,
    flagEmoji: winner.flagEmoji,
    articleRoute: articleLink.targetRoute,
    profileRoute: winner.route,
    voteRoute: winner.voteRoute,
    posterFrameUrl: heroImageRef ?? motion.posterFrameUrl,
    mediaStatus: winner.media.status,
    motionSource: motion.motionSource,
    durationSeconds: motion.durationSeconds as 6 | 7,
    articleLink,
    motionPlan: buildCrownCenterMotion(winner.artistId),
  };
}