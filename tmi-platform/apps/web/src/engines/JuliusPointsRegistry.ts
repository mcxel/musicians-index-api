/**
 * Julius Points Registry
 * Central weight table for participation, competition, economy, and retention actions.
 */

export type JuliusPointAction =
  | 'BATTLE_JOIN'
  | 'BATTLE_WIN'
  | 'BATTLE_LOSS'
  | 'CYPHER_JOIN'
  | 'CYPHER_WIN'
  | 'DIRTY_DOZENS'
  | 'MINI_BATTLE'
  | 'MINI_CYPHER'
  | 'DANCE_OFF'
  | 'JOKE_OFF'
  | 'QUIZ_WIN'
  | 'TRIVIA_WIN'
  | 'POLL_PARTICIPATION'
  | 'TIME_IN_ROOM_MINUTE'
  | 'WATCH_TIME_MINUTE'
  | 'ATTENDANCE_STREAK_DAY'
  | 'SHOW_ATTENDANCE'
  | 'VENUE_ATTENDANCE'
  | 'FAN_VOTE_CAST'
  | 'CORRECT_PREDICTION'
  | 'STORE_PURCHASE'
  | 'BEAT_PURCHASE'
  | 'NFT_PURCHASE'
  | 'TICKET_PURCHASE'
  | 'REFERRAL'
  | 'FRIEND_INVITE'
  | 'DAILY_LOGIN'
  | 'WEEKLY_STREAK'
  | 'MONTHLY_STREAK'
  | 'FAN_PREDICT_WINNER'
  | 'FAN_SHARE_ARTICLE'
  | 'FAN_READ_ARTICLE'
  | 'FAN_LIKE_ARTIST'
  | 'FAN_FOLLOW_ARTIST'
  | 'FAN_WATCH_AD'
  | 'ARTIST_HOST_EVENT'
  | 'ARTIST_SELL_BEAT'
  | 'ARTIST_SELL_MERCH'
  | 'ARTIST_SELL_NFT'
  | 'ARTIST_VENUE_PERFORMANCE'
  | 'ARTIST_BATTLE_RANK'
  | 'ARTIST_CYPHER_RANK'
  | 'ARTIST_FAN_ENGAGEMENT'
  | 'VENUE_HOST_EVENT'
  | 'VENUE_TICKET_SALE'
  | 'VENUE_ATTENDANCE_TARGET'
  | 'VENUE_ROOM_FILL'
  | 'VENUE_ENGAGEMENT'
  | 'SPONSOR_AD_PERFORMANCE'
  | 'SPONSOR_GIFT_REDEMPTION'
  | 'SPONSOR_CONVERSION';

export type JuliusActionClass = 'participation' | 'competition' | 'economy' | 'retention';

export interface JuliusPointsWeight {
  xp: number;
  rewardPoints: number;
  bonusPoints: number;
  seasonPoints: number;
}

export interface JuliusPointRule {
  action: JuliusPointAction;
  label: string;
  actionClass: JuliusActionClass;
  weight: JuliusPointsWeight;
}

export const JULIUS_POINTS_REGISTRY: Record<JuliusPointAction, JuliusPointRule> = {
  BATTLE_JOIN: {
    action: 'BATTLE_JOIN',
    label: 'Battle Join',
    actionClass: 'participation',
    weight: { xp: 35, rewardPoints: 18, bonusPoints: 6, seasonPoints: 10 },
  },
  BATTLE_WIN: {
    action: 'BATTLE_WIN',
    label: 'Battle Win',
    actionClass: 'competition',
    weight: { xp: 120, rewardPoints: 65, bonusPoints: 24, seasonPoints: 34 },
  },
  BATTLE_LOSS: {
    action: 'BATTLE_LOSS',
    label: 'Battle Loss',
    actionClass: 'participation',
    weight: { xp: 24, rewardPoints: 12, bonusPoints: 4, seasonPoints: 8 },
  },
  CYPHER_JOIN: {
    action: 'CYPHER_JOIN',
    label: 'Cypher Join',
    actionClass: 'participation',
    weight: { xp: 32, rewardPoints: 16, bonusPoints: 6, seasonPoints: 10 },
  },
  CYPHER_WIN: {
    action: 'CYPHER_WIN',
    label: 'Cypher Win',
    actionClass: 'competition',
    weight: { xp: 105, rewardPoints: 58, bonusPoints: 20, seasonPoints: 30 },
  },
  DIRTY_DOZENS: {
    action: 'DIRTY_DOZENS',
    label: 'Dirty Dozens',
    actionClass: 'competition',
    weight: { xp: 80, rewardPoints: 42, bonusPoints: 16, seasonPoints: 26 },
  },
  MINI_BATTLE: {
    action: 'MINI_BATTLE',
    label: 'Mini Battle',
    actionClass: 'participation',
    weight: { xp: 40, rewardPoints: 22, bonusPoints: 8, seasonPoints: 12 },
  },
  MINI_CYPHER: {
    action: 'MINI_CYPHER',
    label: 'Mini Cypher',
    actionClass: 'participation',
    weight: { xp: 38, rewardPoints: 20, bonusPoints: 8, seasonPoints: 12 },
  },
  DANCE_OFF: {
    action: 'DANCE_OFF',
    label: 'Dance Off',
    actionClass: 'competition',
    weight: { xp: 70, rewardPoints: 36, bonusPoints: 14, seasonPoints: 22 },
  },
  JOKE_OFF: {
    action: 'JOKE_OFF',
    label: 'Joke Off',
    actionClass: 'competition',
    weight: { xp: 64, rewardPoints: 34, bonusPoints: 12, seasonPoints: 20 },
  },
  QUIZ_WIN: {
    action: 'QUIZ_WIN',
    label: 'Quiz Win',
    actionClass: 'competition',
    weight: { xp: 66, rewardPoints: 34, bonusPoints: 12, seasonPoints: 22 },
  },
  TRIVIA_WIN: {
    action: 'TRIVIA_WIN',
    label: 'Trivia Win',
    actionClass: 'competition',
    weight: { xp: 66, rewardPoints: 34, bonusPoints: 12, seasonPoints: 22 },
  },
  POLL_PARTICIPATION: {
    action: 'POLL_PARTICIPATION',
    label: 'Poll Participation',
    actionClass: 'participation',
    weight: { xp: 18, rewardPoints: 10, bonusPoints: 3, seasonPoints: 6 },
  },
  TIME_IN_ROOM_MINUTE: {
    action: 'TIME_IN_ROOM_MINUTE',
    label: 'Time In Room Minute',
    actionClass: 'participation',
    weight: { xp: 2, rewardPoints: 1, bonusPoints: 0, seasonPoints: 1 },
  },
  WATCH_TIME_MINUTE: {
    action: 'WATCH_TIME_MINUTE',
    label: 'Watch Time Minute',
    actionClass: 'participation',
    weight: { xp: 3, rewardPoints: 1, bonusPoints: 0, seasonPoints: 1 },
  },
  ATTENDANCE_STREAK_DAY: {
    action: 'ATTENDANCE_STREAK_DAY',
    label: 'Attendance Streak Day',
    actionClass: 'retention',
    weight: { xp: 15, rewardPoints: 9, bonusPoints: 5, seasonPoints: 8 },
  },
  SHOW_ATTENDANCE: {
    action: 'SHOW_ATTENDANCE',
    label: 'Show Attendance',
    actionClass: 'retention',
    weight: { xp: 28, rewardPoints: 16, bonusPoints: 4, seasonPoints: 12 },
  },
  VENUE_ATTENDANCE: {
    action: 'VENUE_ATTENDANCE',
    label: 'Venue Attendance',
    actionClass: 'retention',
    weight: { xp: 24, rewardPoints: 14, bonusPoints: 4, seasonPoints: 10 },
  },
  FAN_VOTE_CAST: {
    action: 'FAN_VOTE_CAST',
    label: 'Fan Vote Cast',
    actionClass: 'participation',
    weight: { xp: 12, rewardPoints: 8, bonusPoints: 2, seasonPoints: 5 },
  },
  CORRECT_PREDICTION: {
    action: 'CORRECT_PREDICTION',
    label: 'Correct Prediction',
    actionClass: 'competition',
    weight: { xp: 40, rewardPoints: 24, bonusPoints: 8, seasonPoints: 14 },
  },
  STORE_PURCHASE: {
    action: 'STORE_PURCHASE',
    label: 'Store Purchase',
    actionClass: 'economy',
    weight: { xp: 30, rewardPoints: 14, bonusPoints: 10, seasonPoints: 16 },
  },
  BEAT_PURCHASE: {
    action: 'BEAT_PURCHASE',
    label: 'Beat Purchase',
    actionClass: 'economy',
    weight: { xp: 38, rewardPoints: 18, bonusPoints: 12, seasonPoints: 20 },
  },
  NFT_PURCHASE: {
    action: 'NFT_PURCHASE',
    label: 'NFT Purchase',
    actionClass: 'economy',
    weight: { xp: 52, rewardPoints: 24, bonusPoints: 16, seasonPoints: 30 },
  },
  TICKET_PURCHASE: {
    action: 'TICKET_PURCHASE',
    label: 'Ticket Purchase',
    actionClass: 'economy',
    weight: { xp: 44, rewardPoints: 20, bonusPoints: 12, seasonPoints: 22 },
  },
  REFERRAL: {
    action: 'REFERRAL',
    label: 'Referral',
    actionClass: 'retention',
    weight: { xp: 140, rewardPoints: 90, bonusPoints: 30, seasonPoints: 42 },
  },
  FRIEND_INVITE: {
    action: 'FRIEND_INVITE',
    label: 'Friend Invite',
    actionClass: 'retention',
    weight: { xp: 40, rewardPoints: 22, bonusPoints: 10, seasonPoints: 14 },
  },
  DAILY_LOGIN: {
    action: 'DAILY_LOGIN',
    label: 'Daily Login',
    actionClass: 'retention',
    weight: { xp: 18, rewardPoints: 12, bonusPoints: 4, seasonPoints: 8 },
  },
  WEEKLY_STREAK: {
    action: 'WEEKLY_STREAK',
    label: 'Weekly Streak',
    actionClass: 'retention',
    weight: { xp: 70, rewardPoints: 40, bonusPoints: 18, seasonPoints: 24 },
  },
  MONTHLY_STREAK: {
    action: 'MONTHLY_STREAK',
    label: 'Monthly Streak',
    actionClass: 'retention',
    weight: { xp: 240, rewardPoints: 130, bonusPoints: 55, seasonPoints: 90 },
  },
  FAN_PREDICT_WINNER: {
    action: 'FAN_PREDICT_WINNER',
    label: 'Fan Predict Winner',
    actionClass: 'competition',
    weight: { xp: 45, rewardPoints: 25, bonusPoints: 10, seasonPoints: 15 },
  },
  FAN_SHARE_ARTICLE: {
    action: 'FAN_SHARE_ARTICLE',
    label: 'Fan Share Article',
    actionClass: 'participation',
    weight: { xp: 15, rewardPoints: 8, bonusPoints: 2, seasonPoints: 5 },
  },
  FAN_READ_ARTICLE: {
    action: 'FAN_READ_ARTICLE',
    label: 'Fan Read Article',
    actionClass: 'participation',
    weight: { xp: 10, rewardPoints: 5, bonusPoints: 1, seasonPoints: 3 },
  },
  FAN_LIKE_ARTIST: {
    action: 'FAN_LIKE_ARTIST',
    label: 'Fan Like Artist',
    actionClass: 'participation',
    weight: { xp: 5, rewardPoints: 2, bonusPoints: 0, seasonPoints: 2 },
  },
  FAN_FOLLOW_ARTIST: {
    action: 'FAN_FOLLOW_ARTIST',
    label: 'Fan Follow Artist',
    actionClass: 'retention',
    weight: { xp: 12, rewardPoints: 6, bonusPoints: 2, seasonPoints: 4 },
  },
  FAN_WATCH_AD: {
    action: 'FAN_WATCH_AD',
    label: 'Fan Watch Ad',
    actionClass: 'economy',
    weight: { xp: 20, rewardPoints: 15, bonusPoints: 5, seasonPoints: 8 },
  },
  ARTIST_HOST_EVENT: {
    action: 'ARTIST_HOST_EVENT',
    label: 'Artist Host Event',
    actionClass: 'participation',
    weight: { xp: 150, rewardPoints: 80, bonusPoints: 30, seasonPoints: 50 },
  },
  ARTIST_SELL_BEAT: {
    action: 'ARTIST_SELL_BEAT',
    label: 'Artist Sell Beat',
    actionClass: 'economy',
    weight: { xp: 85, rewardPoints: 45, bonusPoints: 20, seasonPoints: 35 },
  },
  ARTIST_SELL_MERCH: {
    action: 'ARTIST_SELL_MERCH',
    label: 'Artist Sell Merch',
    actionClass: 'economy',
    weight: { xp: 60, rewardPoints: 30, bonusPoints: 15, seasonPoints: 25 },
  },
  ARTIST_SELL_NFT: {
    action: 'ARTIST_SELL_NFT',
    label: 'Artist Sell NFT',
    actionClass: 'economy',
    weight: { xp: 100, rewardPoints: 50, bonusPoints: 25, seasonPoints: 40 },
  },
  ARTIST_VENUE_PERFORMANCE: {
    action: 'ARTIST_VENUE_PERFORMANCE',
    label: 'Artist Venue Performance',
    actionClass: 'participation',
    weight: { xp: 120, rewardPoints: 60, bonusPoints: 25, seasonPoints: 40 },
  },
  ARTIST_BATTLE_RANK: {
    action: 'ARTIST_BATTLE_RANK',
    label: 'Artist Battle Rank',
    actionClass: 'competition',
    weight: { xp: 200, rewardPoints: 100, bonusPoints: 50, seasonPoints: 75 },
  },
  ARTIST_CYPHER_RANK: {
    action: 'ARTIST_CYPHER_RANK',
    label: 'Artist Cypher Rank',
    actionClass: 'competition',
    weight: { xp: 180, rewardPoints: 90, bonusPoints: 45, seasonPoints: 65 },
  },
  ARTIST_FAN_ENGAGEMENT: {
    action: 'ARTIST_FAN_ENGAGEMENT',
    label: 'Artist Fan Engagement',
    actionClass: 'retention',
    weight: { xp: 50, rewardPoints: 25, bonusPoints: 10, seasonPoints: 20 },
  },
  VENUE_HOST_EVENT: {
    action: 'VENUE_HOST_EVENT',
    label: 'Venue Host Event',
    actionClass: 'participation',
    weight: { xp: 250, rewardPoints: 120, bonusPoints: 50, seasonPoints: 80 },
  },
  VENUE_TICKET_SALE: {
    action: 'VENUE_TICKET_SALE',
    label: 'Venue Ticket Sale',
    actionClass: 'economy',
    weight: { xp: 15, rewardPoints: 8, bonusPoints: 3, seasonPoints: 5 },
  },
  VENUE_ATTENDANCE_TARGET: {
    action: 'VENUE_ATTENDANCE_TARGET',
    label: 'Venue Attendance Target',
    actionClass: 'retention',
    weight: { xp: 300, rewardPoints: 150, bonusPoints: 60, seasonPoints: 100 },
  },
  VENUE_ROOM_FILL: {
    action: 'VENUE_ROOM_FILL',
    label: 'Venue Room Fill',
    actionClass: 'retention',
    weight: { xp: 200, rewardPoints: 100, bonusPoints: 40, seasonPoints: 70 },
  },
  VENUE_ENGAGEMENT: {
    action: 'VENUE_ENGAGEMENT',
    label: 'Venue Engagement',
    actionClass: 'participation',
    weight: { xp: 100, rewardPoints: 50, bonusPoints: 20, seasonPoints: 35 },
  },
  SPONSOR_AD_PERFORMANCE: {
    action: 'SPONSOR_AD_PERFORMANCE',
    label: 'Sponsor Ad Performance',
    actionClass: 'economy',
    weight: { xp: 150, rewardPoints: 75, bonusPoints: 30, seasonPoints: 50 },
  },
  SPONSOR_GIFT_REDEMPTION: {
    action: 'SPONSOR_GIFT_REDEMPTION',
    label: 'Sponsor Gift Redemption',
    actionClass: 'economy',
    weight: { xp: 80, rewardPoints: 40, bonusPoints: 15, seasonPoints: 25 },
  },
  SPONSOR_CONVERSION: {
    action: 'SPONSOR_CONVERSION',
    label: 'Sponsor Conversion',
    actionClass: 'retention',
    weight: { xp: 250, rewardPoints: 125, bonusPoints: 50, seasonPoints: 80 },
  },
};

export function getJuliusPointRule(action: JuliusPointAction): JuliusPointRule {
  return JULIUS_POINTS_REGISTRY[action];
}

export function listJuliusPointActions(): JuliusPointAction[] {
  return Object.keys(JULIUS_POINTS_REGISTRY) as JuliusPointAction[];
}
