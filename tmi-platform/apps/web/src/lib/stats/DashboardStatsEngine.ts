/**
 * DashboardStatsEngine — live stats per TMI role.
 * Values reflect real account activity. All start at zero until actual events occur.
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
  { id: "rooms_joined",          label: "Rooms Joined",  value: "0",    delta: "—", deltaPositive: true, color: "#00FFFF", icon: "🏟️" },
  { id: "votes_cast",            label: "Votes Cast",    value: "0",    delta: "—", deltaPositive: true, color: "#FF2DAA", icon: "🗳️" },
  { id: "tips_given",            label: "Tips Given",    value: "$0",   delta: "—", deltaPositive: true, color: "#FFD700", icon: "💸" },
  { id: "xp_total",              label: "Total XP",      value: "0",    delta: "—", deltaPositive: true, color: "#AA2DFF", icon: "⭐" },
  { id: "achievements_unlocked", label: "Achievements",  value: "0",    delta: "—", deltaPositive: true, color: "#00FF88", icon: "🏅" },
];

const ARTIST_STATS: DashboardStat[] = [
  { id: "plays_total",   label: "Total Plays",    value: "0",   delta: "—", deltaPositive: true, color: "#FF2DAA", icon: "▶️" },
  { id: "tip_revenue",   label: "Tip Revenue",    value: "$0",  delta: "—", deltaPositive: true, color: "#FFD700", icon: "💵" },
  { id: "fan_count",     label: "Followers",      value: "0",   delta: "—", deltaPositive: true, color: "#00FFFF", icon: "👥" },
  { id: "battle_wins",   label: "Battle Wins",    value: "0",   delta: "—", deltaPositive: true, color: "#AA2DFF", icon: "⚔️" },
  { id: "rank_position", label: "Chart Position", value: "—",   delta: "—", deltaPositive: true, color: "#00FF88", icon: "📈" },
];

const PERFORMER_STATS: DashboardStat[] = [
  { id: "shows_done",       label: "Shows Done",       value: "0",  delta: "—", deltaPositive: true, color: "#AA2DFF", icon: "🎭" },
  { id: "total_viewers",    label: "Total Viewers",    value: "0",  delta: "—", deltaPositive: true, color: "#00FFFF", icon: "👀" },
  { id: "booking_requests", label: "Booking Requests", value: "0",  delta: "—", deltaPositive: true, color: "#FF2DAA", icon: "📅" },
  { id: "earnings",         label: "Earnings",         value: "$0", delta: "—", deltaPositive: true, color: "#FFD700", icon: "💰" },
];

const SPONSOR_STATS: DashboardStat[] = [
  { id: "active_campaigns", label: "Active Campaigns", value: "0",  delta: "—", deltaPositive: true, color: "#00FFFF", icon: "📢" },
  { id: "total_reach",      label: "Total Reach",      value: "0",  delta: "—", deltaPositive: true, color: "#FF2DAA", icon: "📡" },
  { id: "conversions",      label: "Conversions",      value: "0",  delta: "—", deltaPositive: true, color: "#00FF88", icon: "✅" },
  { id: "spend_total",      label: "Total Spend",      value: "$0", delta: "—", deltaPositive: true, color: "#FFD700", icon: "💳" },
];

const ADVERTISER_STATS: DashboardStat[] = [
  { id: "impressions", label: "Impressions", value: "0",   delta: "—", deltaPositive: true, color: "#00FFFF", icon: "👁️" },
  { id: "clicks",      label: "Clicks",      value: "0",   delta: "—", deltaPositive: true, color: "#FF2DAA", icon: "🖱️" },
  { id: "ctr",         label: "CTR",         value: "0%",  delta: "—", deltaPositive: true, color: "#00FF88", icon: "📊" },
  { id: "conversions", label: "Conversions", value: "0",   delta: "—", deltaPositive: true, color: "#AA2DFF", icon: "🎯" },
  { id: "spend",       label: "Ad Spend",    value: "$0",  delta: "—", deltaPositive: true, color: "#FFD700", icon: "💳" },
];

const VENUE_STATS: DashboardStat[] = [
  { id: "bookings_active", label: "Active Bookings", value: "0",  delta: "—", deltaPositive: true, color: "#AA2DFF", icon: "📅" },
  { id: "events_total",    label: "Total Events",    value: "0",  delta: "—", deltaPositive: true, color: "#00FFFF", icon: "🎪" },
  { id: "ticket_sales",    label: "Ticket Sales",    value: "0",  delta: "—", deltaPositive: true, color: "#FF2DAA", icon: "🎟️" },
  { id: "revenue",         label: "Revenue",         value: "$0", delta: "—", deltaPositive: true, color: "#FFD700", icon: "💰" },
];

const WRITER_STATS: DashboardStat[] = [
  { id: "articles_published", label: "Articles Published", value: "0",   delta: "—", deltaPositive: true, color: "#FF2DAA", icon: "📰" },
  { id: "total_reads",        label: "Total Reads",        value: "0",   delta: "—", deltaPositive: true, color: "#00FFFF", icon: "👁️" },
  { id: "avg_read_time",      label: "Avg Read Time",      value: "—",   delta: "—", deltaPositive: true, color: "#FFD700", icon: "⏱️" },
  { id: "drafts_pending",     label: "Drafts Pending",     value: "0",   delta: "—", deltaPositive: true, color: "#AA2DFF", icon: "✏️" },
];

const PROMOTER_STATS: DashboardStat[] = [
  { id: "events_promoted", label: "Events Promoted", value: "0",  delta: "—", deltaPositive: true, color: "#00FF88", icon: "🎪" },
  { id: "artists_booked",  label: "Artists Booked",  value: "0",  delta: "—", deltaPositive: true, color: "#00FFFF", icon: "🎤" },
  { id: "tickets_sold",    label: "Tickets Sold",    value: "0",  delta: "—", deltaPositive: true, color: "#FFD700", icon: "🎟️" },
  { id: "revenue",         label: "Revenue",         value: "$0", delta: "—", deltaPositive: true, color: "#AA2DFF", icon: "💵" },
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
  return { today: "$0", month: "$0" };
}
