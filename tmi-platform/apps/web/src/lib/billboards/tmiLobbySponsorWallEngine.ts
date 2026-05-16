export type SponsorWallEntry = {
  id: string;
  campaignTitle: string;
  sponsorName: string;
  adSlot: string;
  activeUntil: string;
  ctaRoute: string;
  backRoute: string;
  status: "ACTIVE" | "LOCKED" | "NEEDS_SETUP";
  reason?: string;
};

const SPONSOR_WALL: SponsorWallEntry[] = [
  {
    id: "sw1",
    campaignTitle: "Neon Summer Drop",
    sponsorName: "Pulse Audio",
    adSlot: "A-01",
    activeUntil: "2026-09-30T23:59:59Z",
    ctaRoute: "/sponsors",
    backRoute: "/billboards",
    status: "ACTIVE",
  },
  {
    id: "sw2",
    campaignTitle: "Battle Energy Night",
    sponsorName: "Volt X",
    adSlot: "A-02",
    activeUntil: "2026-10-15T23:59:59Z",
    ctaRoute: "/advertisers",
    backRoute: "/billboards",
    status: "ACTIVE",
  },
  {
    id: "sw3",
    campaignTitle: "Arena Seat Booster",
    sponsorName: "Skyline Bank",
    adSlot: "A-03",
    activeUntil: "2026-12-01T23:59:59Z",
    ctaRoute: "/sponsor",
    backRoute: "/billboards",
    status: "LOCKED",
    reason: "Sponsor slot approval pending",
  },
];

export function listLobbySponsorWall(): SponsorWallEntry[] {
  return SPONSOR_WALL;
}
