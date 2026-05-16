/**
 * FanProfileEngine
 * Fan XP, following, show history, fan club membership, stats.
 */

export type FanFollowType = "performer" | "venue" | "host" | "show_series";

export type FanFollow = {
  targetId: string;
  targetType: FanFollowType;
  targetName: string;
  followedAtMs: number;
  notificationsEnabled: boolean;
};

export type FanShowAttendance = {
  showId: string;
  showTitle: string;
  attendedAtMs: number;
  durationMinutes: number;
  xpEarned: number;
  tipsSent: number;
};

export type FanClubMembership = {
  performerId: string;
  performerName: string;
  joinedAtMs: number;
  tier: "basic" | "supporter" | "vip";
  renewsAtMs: number;
};

export type FanProfile = {
  userId: string;
  displayName: string;
  totalXP: number;
  level: number;
  joinedAtMs: number;
  following: FanFollow[];
  showHistory: FanShowAttendance[];
  fanClubs: FanClubMembership[];
  totalTipsSent: number;
  totalVotesCast: number;
  showsAttended: number;
  lastActiveMs: number;
};

function xpToLevel(xp: number): number {
  if (xp < 1000) return 1;
  if (xp < 3000) return 2;
  if (xp < 6000) return 3;
  if (xp < 10000) return 4;
  if (xp < 15000) return 5;
  if (xp < 25000) return 6;
  if (xp < 40000) return 7;
  if (xp < 60000) return 8;
  if (xp < 100000) return 9;
  return 10;
}

export class FanProfileEngine {
  private readonly profiles: Map<string, FanProfile> = new Map();

  getOrCreate(userId: string, displayName: string): FanProfile {
    if (!this.profiles.has(userId)) {
      this.profiles.set(userId, {
        userId,
        displayName,
        totalXP: 0,
        level: 1,
        joinedAtMs: Date.now(),
        following: [],
        showHistory: [],
        fanClubs: [],
        totalTipsSent: 0,
        totalVotesCast: 0,
        showsAttended: 0,
        lastActiveMs: Date.now(),
      });
    }
    return this.profiles.get(userId)!;
  }

  addXP(userId: string, xp: number, displayName: string = ""): void {
    const profile = this.getOrCreate(userId, displayName);
    profile.totalXP += xp;
    profile.level = xpToLevel(profile.totalXP);
    profile.lastActiveMs = Date.now();
  }

  follow(userId: string, targetId: string, targetType: FanFollowType, targetName: string): void {
    const profile = this.profiles.get(userId);
    if (!profile) return;
    if (!profile.following.find((f) => f.targetId === targetId)) {
      profile.following.push({
        targetId,
        targetType,
        targetName,
        followedAtMs: Date.now(),
        notificationsEnabled: true,
      });
    }
  }

  unfollow(userId: string, targetId: string): void {
    const profile = this.profiles.get(userId);
    if (!profile) return;
    profile.following = profile.following.filter((f) => f.targetId !== targetId);
  }

  recordAttendance(userId: string, attendance: Omit<FanShowAttendance, "attendedAtMs">): void {
    const profile = this.profiles.get(userId);
    if (!profile) return;
    profile.showHistory.unshift({ ...attendance, attendedAtMs: Date.now() });
    if (profile.showHistory.length > 200) profile.showHistory.splice(200);
    profile.showsAttended += 1;
    profile.totalXP += attendance.xpEarned;
    profile.level = xpToLevel(profile.totalXP);
    profile.lastActiveMs = Date.now();
  }

  recordTip(userId: string, amount: number): void {
    const profile = this.profiles.get(userId);
    if (profile) {
      profile.totalTipsSent += amount;
      profile.lastActiveMs = Date.now();
    }
  }

  recordVote(userId: string): void {
    const profile = this.profiles.get(userId);
    if (profile) {
      profile.totalVotesCast += 1;
      profile.lastActiveMs = Date.now();
    }
  }

  joinFanClub(userId: string, membership: FanClubMembership): void {
    const profile = this.profiles.get(userId);
    if (!profile) return;
    const existing = profile.fanClubs.findIndex((c) => c.performerId === membership.performerId);
    if (existing !== -1) {
      profile.fanClubs[existing] = membership;
    } else {
      profile.fanClubs.push(membership);
    }
  }

  getProfile(userId: string): FanProfile | null {
    return this.profiles.get(userId) ?? null;
  }

  isFollowing(userId: string, targetId: string): boolean {
    return !!this.profiles.get(userId)?.following.find((f) => f.targetId === targetId);
  }

  getFollowing(userId: string, type?: FanFollowType): FanFollow[] {
    const profile = this.profiles.get(userId);
    if (!profile) return [];
    return type ? profile.following.filter((f) => f.targetType === type) : [...profile.following];
  }
}

export const fanProfileEngine = new FanProfileEngine();
