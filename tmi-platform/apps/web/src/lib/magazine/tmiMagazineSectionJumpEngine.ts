export type TmiMagazineSectionId =
  | "homepages"
  | "articles"
  | "artist-profiles"
  | "performer-profiles"
  | "sponsors"
  | "ads"
  | "games"
  | "venues"
  | "booking"
  | "cyphers"
  | "rankings"
  | "rewards";

export type TmiMagazineSectionTarget = {
  section: TmiMagazineSectionId;
  route: string;
  backRoute: string;
};

const SECTION_TARGETS: TmiMagazineSectionTarget[] = [
  { section: "homepages", route: "/home/1", backRoute: "/magazine" },
  { section: "articles", route: "/articles", backRoute: "/magazine" },
  { section: "artist-profiles", route: "/artists", backRoute: "/magazine" },
  { section: "performer-profiles", route: "/performers", backRoute: "/magazine" },
  { section: "sponsors", route: "/sponsors", backRoute: "/magazine" },
  { section: "ads", route: "/advertisers", backRoute: "/magazine" },
  { section: "games", route: "/games", backRoute: "/magazine" },
  { section: "venues", route: "/venues", backRoute: "/magazine" },
  { section: "booking", route: "/booking", backRoute: "/magazine" },
  { section: "cyphers", route: "/cypher", backRoute: "/magazine" },
  { section: "rankings", route: "/leaderboard", backRoute: "/magazine" },
  { section: "rewards", route: "/rewards", backRoute: "/magazine" },
];

export function resolveMagazineSectionJump(section: TmiMagazineSectionId): TmiMagazineSectionTarget {
  return SECTION_TARGETS.find((target) => target.section === section) ?? SECTION_TARGETS[0];
}
