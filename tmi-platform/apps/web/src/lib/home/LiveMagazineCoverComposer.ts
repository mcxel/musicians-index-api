import { getNewsAlerts, getSponsors } from "@/packages/magazine-engine/dataAdapters";
import { buildIssueSnapshot } from "@/lib/issues/IssueIntelligenceEngine";
import { getOrbitArtistRotation } from "./OrbitArtistRotationEngine";
import { getWinnerEntityRuntime } from "./WinnerEntityRuntime";

export interface LiveMagazineCoverPayload {
  issueLabel: string;
  weekLabel: string;
  headlines: string[];
  winner: NonNullable<ReturnType<typeof getWinnerEntityRuntime>> | null;
  orbitArtists: ReturnType<typeof getOrbitArtistRotation>;
  sponsorBlock: {
    name: string;
    tagline: string;
    href: string;
  } | null;
}

export function composeLiveMagazineCover(): LiveMagazineCoverPayload {
  const issue = buildIssueSnapshot();
  const sponsor = getSponsors()[0];

  return {
    issueLabel: issue.issueLabel,
    weekLabel: `WEEK ${String(issue.weekInSeason).padStart(2, "0")}`,
    headlines: getNewsAlerts().slice(0, 3).map((entry) => entry.headline),
    winner: getWinnerEntityRuntime(),
    orbitArtists: getOrbitArtistRotation(),
    sponsorBlock: sponsor
      ? {
          name: sponsor.name,
          tagline: sponsor.tagline,
          href: sponsor.ctaHref,
        }
      : null,
  };
}