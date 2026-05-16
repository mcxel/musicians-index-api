/**
 * twelvemonthSimulation.ts
 *
 * 12-month fast simulation engine for TMI platform.
 * Simulates artist rankings, voting cycles, revenue flows,
 * season passes, cypher events, and platform health over 12 months.
 */

export type SimulatedArtist = {
  id: string;
  name: string;
  genre: string;
  monthlyVotes: number[];
  peakRank: number;
  currentRank: number;
  seasonPassHolders: number;
  totalRevenue: number;
  cyphersWon: number;
  concerts: number;
  fans: number;
};

export type MonthSimulation = {
  month: number;
  monthName: string;
  year: number;
  totalVotes: number;
  top10: string[];
  seasonPassesSold: number;
  cyphersRun: number;
  concertsHosted: number;
  revenueGenerated: number;
  newUsers: number;
  activeUsers: number;
  platformHealth: number; // 0-100
  topArtistId: string;
  events: string[];
};

export type TwelveMonthReport = {
  startDate: string;
  endDate: string;
  months: MonthSimulation[];
  artists: SimulatedArtist[];
  totalRevenue: number;
  peakMonthlyUsers: number;
  totalCyphers: number;
  totalConcerts: number;
  totalVotes: number;
  totalSeasonPasses: number;
  overallHealth: number;
  summary: string[];
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const GENRES = ["Hip-Hop", "R&B", "Afrobeats", "Trap", "Neo-Soul", "Drill", "Gospel", "Pop-Rap", "Reggaeton", "Jazz-Hop"];

const ARTIST_TEMPLATES = [
  { name: "MC Blaze", genre: "Hip-Hop" },
  { name: "Soulful Jay", genre: "R&B" },
  { name: "Afro King Dee", genre: "Afrobeats" },
  { name: "TrapStar Vee", genre: "Trap" },
  { name: "Nova Soul", genre: "Neo-Soul" },
  { name: "Drill Master K", genre: "Drill" },
  { name: "GospelFire Min", genre: "Gospel" },
  { name: "Popstar Rae", genre: "Pop-Rap" },
  { name: "Reggae Monarch", genre: "Reggaeton" },
  { name: "Jazz Viper", genre: "Jazz-Hop" },
  { name: "Crown Holder B", genre: "Hip-Hop" },
  { name: "Velvet Voice Tash", genre: "R&B" },
  { name: "Beats Lord Naz", genre: "Trap" },
  { name: "Afrowave Zuri", genre: "Afrobeats" },
  { name: "Neo Prophet Q", genre: "Neo-Soul" },
];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function seedArtists(): SimulatedArtist[] {
  return ARTIST_TEMPLATES.map((t, i) => ({
    id: `artist-${i + 1}`,
    name: t.name,
    genre: t.genre,
    monthlyVotes: [],
    peakRank: 0,
    currentRank: 0,
    seasonPassHolders: randInt(10, 200),
    totalRevenue: 0,
    cyphersWon: 0,
    concerts: 0,
    fans: randInt(50, 2000),
  }));
}

function simulateMonth(
  month: number,
  year: number,
  artists: SimulatedArtist[],
  platformGrowthFactor: number
): MonthSimulation {
  const monthName = MONTH_NAMES[month - 1];

  // Simulate votes for each artist
  const votesMap: Record<string, number> = {};
  let totalVotes = 0;
  for (const artist of artists) {
    const base = randInt(100, 5000);
    const votes = Math.round(base * platformGrowthFactor);
    votesMap[artist.id] = votes;
    artist.monthlyVotes.push(votes);
    totalVotes += votes;
  }

  // Rank artists by votes this month
  const ranked = [...artists].sort((a, b) => (votesMap[b.id] ?? 0) - (votesMap[a.id] ?? 0));
  for (let i = 0; i < ranked.length; i++) {
    const artist = artists.find((a) => a.id === ranked[i].id)!;
    artist.currentRank = i + 1;
    if (artist.peakRank === 0 || i + 1 < artist.peakRank) {
      artist.peakRank = i + 1;
    }
  }

  const top10 = ranked.slice(0, 10).map((a) => a.id);
  const topArtistId = ranked[0]?.id ?? "artist-1";

  // Season passes — grow over time
  const seasonPassesSold = Math.round(randInt(50, 500) * platformGrowthFactor);
  for (const artist of top10.slice(0, 5).map((id) => artists.find((a) => a.id === id)!)) {
    if (artist) artist.seasonPassHolders += randInt(5, 50);
  }

  // Cyphers and concerts
  const cyphersRun = randInt(4, 20);
  const concertsHosted = randInt(1, 8);

  // Assign wins
  for (let i = 0; i < cyphersRun; i++) {
    const winner = artists[randInt(0, artists.length - 1)];
    winner.cyphersWon++;
  }
  for (let i = 0; i < concertsHosted; i++) {
    const host = artists[randInt(0, artists.length - 1)];
    host.concerts++;
  }

  // Revenue
  const revenueGenerated = Math.round(
    (seasonPassesSold * randFloat(9.99, 29.99)) +
    (cyphersRun * randInt(100, 500)) +
    (concertsHosted * randInt(500, 5000))
  );

  // Fan growth
  for (const artist of artists) {
    artist.fans += randInt(0, 200);
    artist.totalRevenue += Math.round(revenueGenerated / artists.length * randFloat(0.5, 2.0));
  }

  const newUsers = Math.round(randInt(100, 1000) * platformGrowthFactor);
  const activeUsers = Math.round(randInt(500, 5000) * platformGrowthFactor);
  const platformHealth = Math.min(100, Math.round(70 + platformGrowthFactor * 10 + randFloat(-5, 10)));

  const events: string[] = [];
  if (month === 1) events.push("New Year Cypher Kickoff");
  if (month === 3) events.push("Spring Showcase Season");
  if (month === 6) events.push("Summer Cypher Championship");
  if (month === 9) events.push("Fall Battle Tournament");
  if (month === 12) events.push("Year-End Crown Award Ceremony");
  if (cyphersRun > 15) events.push(`Mega Cypher Month — ${cyphersRun} cyphers`);
  if (seasonPassesSold > 400) events.push("Season Pass Surge");

  return {
    month,
    monthName,
    year,
    totalVotes,
    top10,
    seasonPassesSold,
    cyphersRun,
    concertsHosted,
    revenueGenerated,
    newUsers,
    activeUsers,
    platformHealth,
    topArtistId,
    events,
  };
}

/**
 * Run a full 12-month simulation starting from a given year.
 */
export function runTwelveMonthSimulation(startYear = 2025): TwelveMonthReport {
  const artists = seedArtists();
  const months: MonthSimulation[] = [];

  let platformGrowthFactor = 1.0;

  for (let m = 1; m <= 12; m++) {
    // Platform grows each month
    platformGrowthFactor *= randFloat(1.02, 1.12);
    const monthData = simulateMonth(m, startYear, artists, platformGrowthFactor);
    months.push(monthData);
  }

  const totalRevenue = months.reduce((s, m) => s + m.revenueGenerated, 0);
  const peakMonthlyUsers = Math.max(...months.map((m) => m.activeUsers));
  const totalCyphers = months.reduce((s, m) => s + m.cyphersRun, 0);
  const totalConcerts = months.reduce((s, m) => s + m.concertsHosted, 0);
  const totalVotes = months.reduce((s, m) => s + m.totalVotes, 0);
  const totalSeasonPasses = months.reduce((s, m) => s + m.seasonPassesSold, 0);
  const overallHealth = Math.round(months.reduce((s, m) => s + m.platformHealth, 0) / 12);

  const crownHolder = artists.find((a) => a.currentRank === 1);
  const topEarner = [...artists].sort((a, b) => b.totalRevenue - a.totalRevenue)[0];
  const topCypher = [...artists].sort((a, b) => b.cyphersWon - a.cyphersWon)[0];

  const summary = [
    `12-Month Simulation Complete for ${startYear}`,
    `Total Revenue Generated: $${totalRevenue.toLocaleString()}`,
    `Total Votes Cast: ${totalVotes.toLocaleString()}`,
    `Total Season Passes Sold: ${totalSeasonPasses.toLocaleString()}`,
    `Total Cyphers Run: ${totalCyphers} | Concerts Hosted: ${totalConcerts}`,
    `Peak Monthly Active Users: ${peakMonthlyUsers.toLocaleString()}`,
    `Overall Platform Health: ${overallHealth}/100`,
    `Year-End #1 Artist: ${crownHolder?.name ?? "Unknown"} (${crownHolder?.genre ?? ""})`,
    `Top Earner: ${topEarner?.name ?? "Unknown"} — $${topEarner?.totalRevenue.toLocaleString() ?? 0}`,
    `Cypher Champion: ${topCypher?.name ?? "Unknown"} — ${topCypher?.cyphersWon ?? 0} wins`,
  ];

  return {
    startDate: `${MONTH_NAMES[0]} ${startYear}`,
    endDate: `${MONTH_NAMES[11]} ${startYear}`,
    months,
    artists,
    totalRevenue,
    peakMonthlyUsers,
    totalCyphers,
    totalConcerts,
    totalVotes,
    totalSeasonPasses,
    overallHealth,
    summary,
  };
}
