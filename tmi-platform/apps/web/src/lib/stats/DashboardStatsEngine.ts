/**
 * DashboardStatsEngine — returns realistic demo stats for each TMI role.
 * Each stat has: value, delta (vs last week), label, color, icon.
 */

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  color: string;
  icon: string;
}

const FAN_STATS: DashboardStat[] = [
  { id: "rooms_joined",          label: "Rooms Joined",         value: "24",      delta: "+6 this week",  deltaPositive: true,  color: "#00FFFF", icon: "🏟️" },
  { id: "votes_cast",            label: "Votes Cast",           value: "183",     delta: "+47 this week", deltaPositive: true,  color: "#FF2DAA", icon: "🗳️" },
  { id: "tips_given",            label: "Tips Given",           value: "$42.50",  delta: "+$12 this week",deltaPositive: true,  color: "#FFD700", icon: "💸" },
  { id: "xp_total",              label: "Total XP",             value: "3,820",   delta: "+280 this week",deltaPositive: true,  color: "#AA2DFF", icon: "⭐" },
  { id: "achievements_unlocked", label: "Achievements",         value: "7",       delta: "+2 this week",  deltaPositive: true,  color: "#00FF88", icon: "🏅" },
];

const ARTIST_STATS: DashboardStat[] = [
  { id: "plays_total",    label: "Total Plays",       value: "14,280",  delta: "+1,204 this week", deltaPositive: true,  color: "#FF2DAA", icon: "▶️" },
  { id: "tip_revenue",    label: "Tip Revenue",       value: "$312.00", delta: "+$88 this week",   deltaPositive: true,  color: "#FFD700", icon: "💵" },
  { id: "fan_count",      label: "Followers",         value: "2,041",   delta: "+189 this week",   deltaPositive: true,  color: "#00FFFF", icon: "👥" },
  { id: "battle_wins",    label: "Battle Wins",       value: "19",      delta: "+3 this week",     deltaPositive: true,  color: "#AA2DFF", icon: "⚔️" },
  { id: "rank_position",  label: "Chart Position",    value: "#14",     delta: "↑2 this week",     deltaPositive: true,  color: "#00FF88", icon: "📈" },
];

const PERFORMER_STATS: DashboardStat[] = [
  { id: "shows_done",        label: "Shows Done",          value: "38",      delta: "+5 this month",    deltaPositive: true,  color: "#AA2DFF", icon: "🎭" },
  { id: "total_viewers",     label: "Total Viewers",       value: "7,420",   delta: "+890 this month",  deltaPositive: true,  color: "#00FFFF", icon: "👀" },
  { id: "booking_requests",  label: "Booking Requests",    value: "12",      delta: "+4 this week",     deltaPositive: true,  color: "#FF2DAA", icon: "📅" },
  { id: "earnings",          label: "Earnings",            value: "$1,840",  delta: "+$340 this month", deltaPositive: true,  color: "#FFD700", icon: "💰" },
];

const SPONSOR_STATS: DashboardStat[] = [
  { id: "active_campaigns", label: "Active Campaigns",    value: "4",         delta: "+1 this month",   deltaPositive: true,  color: "#00FFFF", icon: "📢" },
  { id: "total_reach",      label: "Total Reach",         value: "142,000",   delta: "+18k this month", deltaPositive: true,  color: "#FF2DAA", icon: "📡" },
  { id: "conversions",      label: "Conversions",         value: "1,284",     delta: "+204 this month", deltaPositive: true,  color: "#00FF88", icon: "✅" },
  { id: "spend_total",      label: "Total Spend",         value: "$8,400",    delta: "+$1,200 this mo", deltaPositive: false, color: "#FFD700", icon: "💳" },
];

const ADVERTISER_STATS: DashboardStat[] = [
  { id: "impressions",  label: "Impressions",      value: "284,000",  delta: "+42k this week",  deltaPositive: true,  color: "#00FFFF", icon: "👁️" },
  { id: "clicks",       label: "Clicks",           value: "12,840",   delta: "+1,920 this week",deltaPositive: true,  color: "#FF2DAA", icon: "🖱️" },
  { id: "ctr",          label: "CTR",              value: "4.52%",    delta: "+0.3% this week", deltaPositive: true,  color: "#00FF88", icon: "📊" },
  { id: "conversions",  label: "Conversions",      value: "892",      delta: "+140 this week",  deltaPositive: true,  color: "#AA2DFF", icon: "🎯" },
  { id: "spend",        label: "Ad Spend",         value: "$3,280",   delta: "+$480 this week", deltaPositive: false, color: "#FFD700", icon: "💳" },
];

const VENUE_STATS: DashboardStat[] = [
  { id: "bookings_active", label: "Active Bookings",    value: "7",       delta: "+2 this week",    deltaPositive: true,  color: "#AA2DFF", icon: "📅" },
  { id: "events_total",    label: "Total Events",       value: "124",     delta: "+8 this month",   deltaPositive: true,  color: "#00FFFF", icon: "🎪" },
  { id: "ticket_sales",    label: "Ticket Sales",       value: "4,820",   delta: "+640 this month", deltaPositive: true,  color: "#FF2DAA", icon: "🎟️" },
  { id: "revenue",         label: "Revenue",            value: "$28,400", delta: "+$4,200 this mo", deltaPositive: true,  color: "#FFD700", icon: "💰" },
];

const WRITER_STATS: DashboardStat[] = [
  { id: "articles_published", label: "Articles Published", value: "17",    delta: "+3 this month",   deltaPositive: true,  color: "#FF2DAA", icon: "📰" },
  { id: "total_reads",        label: "Total Reads",        value: "24,300", delta: "+4,200 this mo",  deltaPositive: true,  color: "#00FFFF", icon: "👁️" },
  { id: "avg_read_time",      label: "Avg Read Time",      value: "4.2m",   delta: "+0.3m this mo",   deltaPositive: true,  color: "#FFD700", icon: "⏱️" },
  { id: "drafts_pending",     label: "Drafts Pending",     value: "3",      delta: "0 change",        deltaPositive: true,  color: "#AA2DFF", icon: "✏️" },
];

const PROMOTER_STATS: DashboardStat[] = [
  { id: "events_promoted",  label: "Events Promoted",  value: "6",       delta: "+2 this month",   deltaPositive: true,  color: "#00FF88", icon: "🎪" },
  { id: "artists_booked",   label: "Artists Booked",   value: "14",      delta: "+3 this month",   deltaPositive: true,  color: "#00FFFF", icon: "🎤" },
  { id: "tickets_sold",     label: "Tickets Sold",     value: "1,840",   delta: "+420 this month", deltaPositive: true,  color: "#FFD700", icon: "🎟️" },
  { id: "revenue",          label: "Revenue",          value: "$9,200",  delta: "+$2,100 this mo", deltaPositive: true,  color: "#AA2DFF", icon: "💵" },
];

const ROLE_STATS_MAP: Record<string, DashboardStat[]> = {
  fan:        FAN_STATS,
  artist:     ARTIST_STATS,
  performer:  PERFORMER_STATS,
  sponsor:    SPONSOR_STATS,
  advertiser: ADVERTISER_STATS,
  venue:      VENUE_STATS,
  writer:     WRITER_STATS,
  promoter:   PROMOTER_STATS,
  // uppercase variants
  FAN:        FAN_STATS,
  ARTIST:     ARTIST_STATS,
  PERFORMER:  PERFORMER_STATS,
  SPONSOR:    SPONSOR_STATS,
  ADVERTISER: ADVERTISER_STATS,
  VENUE:      VENUE_STATS,
  WRITER:     WRITER_STATS,
  PROMOTER:   PROMOTER_STATS,
};

export function getRoleStats(role: string): DashboardStat[] {
  return ROLE_STATS_MAP[role] ?? FAN_STATS;
}

export function getTotalRevenueStat(): { today: string; month: string } {
  return { today: "$1,284", month: "$38,420" };
}
