export interface BotIdentityProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  profileImage: string;
  coverFrame?: string;
  motionClip?: string;
  liveClip?: string;
  rankScore: number;
  heatScore: number;
  engagementScore: number;
  battleWins: number;
  newsMentions: number;
  sponsorWeight: number;
  voice: string;
  permissions: string[];
  assignment: string;
  taskStatus: "active" | "standby" | "maintenance";
  roleBadge: string;
}

const BOT_IDENTITIES: BotIdentityProfile[] = [
  {
    id: "editorial-bot",
    name: "Editorial Bot",
    role: "Editorial Director",
    department: "Magazine",
    profileImage: "/artists/artist-01.png",
    coverFrame: "/artists/artist-01.png",
    rankScore: 98,
    heatScore: 91,
    engagementScore: 95,
    battleWins: 12,
    newsMentions: 48,
    sponsorWeight: 84,
    voice: "measured",
    permissions: ["curate-headlines", "approve-cover", "route-features"],
    assignment: "Issue sequencing and cover review",
    taskStatus: "active",
    roleBadge: "EDITORIAL",
  },
  {
    id: "scout-bot",
    name: "Scout Bot",
    role: "Discovery Scout",
    department: "Discovery",
    profileImage: "/artists/artist-02.png",
    coverFrame: "/artists/artist-02.png",
    rankScore: 93,
    heatScore: 96,
    engagementScore: 89,
    battleWins: 10,
    newsMentions: 31,
    sponsorWeight: 72,
    voice: "fast",
    permissions: ["rank-candidates", "surface-risers", "cooldown-check"],
    assignment: "Find new artists with floor due exposure",
    taskStatus: "active",
    roleBadge: "SCOUT",
  },
  {
    id: "news-bot",
    name: "News Bot",
    role: "Regional Desk",
    department: "News",
    profileImage: "/artists/artist-03.png",
    coverFrame: "/artists/artist-03.png",
    rankScore: 90,
    heatScore: 88,
    engagementScore: 94,
    battleWins: 6,
    newsMentions: 57,
    sponsorWeight: 68,
    voice: "briefing",
    permissions: ["source-ingest", "regional-balance", "trend-scan"],
    assignment: "Global and regional story intake",
    taskStatus: "active",
    roleBadge: "NEWS",
  },
  {
    id: "venue-bot",
    name: "Venue Bot",
    role: "Venue Signals",
    department: "Live",
    profileImage: "/artists/artist-04.png",
    coverFrame: "/artists/artist-04.png",
    rankScore: 86,
    heatScore: 90,
    engagementScore: 84,
    battleWins: 8,
    newsMentions: 22,
    sponsorWeight: 79,
    voice: "broadcast",
    permissions: ["venue-promo", "ticket-sync", "room-routing"],
    assignment: "Venue promo and ticket lane checks",
    taskStatus: "standby",
    roleBadge: "VENUE",
  },
  {
    id: "safety-bot",
    name: "Safety Bot",
    role: "Moderation Guard",
    department: "Safety",
    profileImage: "/artists/artist-05.jpg",
    coverFrame: "/artists/artist-05.jpg",
    rankScore: 89,
    heatScore: 75,
    engagementScore: 82,
    battleWins: 4,
    newsMentions: 19,
    sponsorWeight: 61,
    voice: "strict",
    permissions: ["quarantine", "review-safety", "block-source"],
    assignment: "Pre-publish safety review",
    taskStatus: "active",
    roleBadge: "SAFETY",
  },
  {
    id: "interview-bot",
    name: "Interview Bot",
    role: "Interview Producer",
    department: "Magazine",
    profileImage: "/artists/artist-06.jpg",
    coverFrame: "/artists/artist-06.jpg",
    rankScore: 91,
    heatScore: 87,
    engagementScore: 93,
    battleWins: 7,
    newsMentions: 41,
    sponsorWeight: 74,
    voice: "host",
    permissions: ["prepare-prompts", "route-live-room", "attach-media"],
    assignment: "Interview layouts and live room joins",
    taskStatus: "active",
    roleBadge: "INTERVIEW",
  },
  {
    id: "sponsor-bot",
    name: "Sponsor Bot",
    role: "Sponsor Routing",
    department: "Revenue",
    profileImage: "/artists/artist-07.jpg",
    coverFrame: "/artists/artist-07.jpg",
    rankScore: 87,
    heatScore: 92,
    engagementScore: 85,
    battleWins: 5,
    newsMentions: 27,
    sponsorWeight: 98,
    voice: "sales",
    permissions: ["sponsor-slots", "ad-guard", "revenue-protect"],
    assignment: "Sponsor slot and promo sequencing",
    taskStatus: "active",
    roleBadge: "SPONSOR",
  },
  {
    id: "discovery-bot",
    name: "Discovery Bot",
    role: "Exposure Orchestrator",
    department: "Discovery",
    profileImage: "/artists/artist-08.jpg",
    coverFrame: "/artists/artist-08.jpg",
    rankScore: 95,
    heatScore: 94,
    engagementScore: 90,
    battleWins: 9,
    newsMentions: 36,
    sponsorWeight: 77,
    voice: "curator",
    permissions: ["genre-balance", "regional-balance", "top10-priority"],
    assignment: "Discovery lane and orbit rotation",
    taskStatus: "active",
    roleBadge: "DISCOVERY",
  },
];

export function getBotIdentityProfiles(): BotIdentityProfile[] {
  return BOT_IDENTITIES;
}

export function resolveBotIdentity(id: string): BotIdentityProfile | null {
  return BOT_IDENTITIES.find((entry) => entry.id === id) ?? null;
}