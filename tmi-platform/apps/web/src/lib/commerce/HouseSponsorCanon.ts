/**
 * TMI house sponsors — platform self-promotion only (Rule 20).
 * Not third-party brand deals. Paid sponsors come from ACTIVE_SPONSOR_ZONES.
 */

export interface HouseSponsor {
  id: string;
  name: string;
  tagline: string;
  href?: string;
  accent: string;
}

export const HOUSE_SPONSORS: HouseSponsor[] = [
  { id: "tmi", name: "TMI", tagline: "The Musician's Index", accent: "#00FFFF" },
  {
    id: "the-musicians-index",
    name: "The Musician's Index",
    tagline: "Magazine · Live · Rankings",
    accent: "#FF2DAA",
  },
  {
    id: "themusiciansindex-com",
    name: "TheMusiciansIndex.com",
    tagline: "Join the platform",
    href: "https://themusiciansindex.com",
    accent: "#FFD700",
  },
];
