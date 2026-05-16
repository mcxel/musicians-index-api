export type SeedUserRole =
  | "artist"
  | "performer"
  | "fan"
  | "venue"
  | "sponsor"
  | "advertiser"
  | "admin"
  | "moderator"
  | "bot";

export type SeedAccount = {
  id: string;
  displayName: string;
  email: string;
  role: SeedUserRole;
  tags: string[];
};

function makeAccounts(role: SeedUserRole, count: number, prefix: string): SeedAccount[] {
  return new Array(count).fill(0).map((_, index) => {
    const num = String(index + 1).padStart(2, "0");
    return {
      id: `${role}-${num}`,
      displayName: `${prefix} ${num}`,
      email: `${role}${num}@seed.tmi.local`,
      role,
      tags: ["soft-launch", role],
    };
  });
}

export const SOFT_LAUNCH_SEED_DATA = {
  artists: makeAccounts("artist", 20, "Artist"),
  performers: makeAccounts("performer", 20, "Performer"),
  fans: makeAccounts("fan", 20, "Fan"),
  venues: makeAccounts("venue", 20, "Venue"),
  sponsors: makeAccounts("sponsor", 20, "Sponsor"),
  advertisers: makeAccounts("advertiser", 20, "Advertiser"),
  adminsAndModerators: [
    ...makeAccounts("admin", 5, "Admin"),
    ...makeAccounts("moderator", 5, "Moderator"),
  ],
  testBots: makeAccounts("bot", 10, "Bot"),
};

export function listAllSeedAccounts(): SeedAccount[] {
  return [
    ...SOFT_LAUNCH_SEED_DATA.artists,
    ...SOFT_LAUNCH_SEED_DATA.performers,
    ...SOFT_LAUNCH_SEED_DATA.fans,
    ...SOFT_LAUNCH_SEED_DATA.venues,
    ...SOFT_LAUNCH_SEED_DATA.sponsors,
    ...SOFT_LAUNCH_SEED_DATA.advertisers,
    ...SOFT_LAUNCH_SEED_DATA.adminsAndModerators,
    ...SOFT_LAUNCH_SEED_DATA.testBots,
  ];
}
