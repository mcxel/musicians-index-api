/**
 * MondayNightStageEngine.ts
 * Manages Monday Night Stage: rotation, featured contestants, sponsor placement, countdown.
 * Permanent promotion block on Home 5.
 */

export interface FeaturedContestant {
  id: string;
  name: string;
  genre: string;
  image?: string;
  bio: string;
  previousWins: number;
}

export interface MondayNightShow {
  id: string;
  date: Date;
  featured: FeaturedContestant;
  sponsorId: string;
  sponsorName: string;
  sponsorLogo?: string;
  prizePool: number;
  hostName: string;
  theme: string;
  status: "upcoming" | "live" | "completed";
  viewCount: number;
  participantCount: number;
}

export interface MondayNightReward {
  points: number;
  storeRewards: string[];
  xp: number;
}

export class MondayNightStageEngine {
  private currentShow: MondayNightShow | null = null;
  private upcomingShows: MondayNightShow[] = [];
  private pastShows: MondayNightShow[] = [];
  private standardReward: MondayNightReward = {
    points: 5000,
    storeRewards: ["monday-night-exclusive", "seasonal-item"],
    xp: 600,
  };

  /**
   * Creates a new Monday Night Show.
   */
  createShow(
    featured: FeaturedContestant,
    sponsorId: string,
    sponsorName: string,
    prizePool: number,
    hostName: string,
    theme: string = "Monday Night Battle"
  ): MondayNightShow {
    const show: MondayNightShow = {
      id: `monday-${Date.now()}`,
      date: this.getNextMonday(),
      featured,
      sponsorId,
      sponsorName,
      prizePool,
      hostName,
      theme,
      status: "upcoming",
      viewCount: 0,
      participantCount: 0,
    };

    this.upcomingShows.push(show);
    return show;
  }

  /**
   * Gets the next Monday date (or current Monday if today is Monday).
   */
  private getNextMonday(): Date {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilMonday = dayOfWeek === 1 ? 0 : (8 - dayOfWeek) % 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    nextMonday.setHours(20, 0, 0, 0); // 8 PM show time
    return nextMonday;
  }

  /**
   * Advances to the next upcoming show.
   */
  goLive(showId: string): boolean {
    const showIndex = this.upcomingShows.findIndex((s) => s.id === showId);

    if (showIndex === -1) {
      return false;
    }

    if (this.currentShow) {
      this.currentShow.status = "completed";
      this.pastShows.push(this.currentShow);
    }

    this.currentShow = this.upcomingShows[showIndex];
    this.currentShow.status = "live";
    this.upcomingShows.splice(showIndex, 1);

    return true;
  }

  /**
   * Ends the current show and archives it.
   */
  endShow(): boolean {
    if (!this.currentShow) {
      return false;
    }

    this.currentShow.status = "completed";
    this.pastShows.push(this.currentShow);
    this.currentShow = null;

    return true;
  }

  /**
   * Gets the current live Monday Night Show.
   */
  getCurrentShow(): MondayNightShow | null {
    return this.currentShow;
  }

  /**
   * Gets the next upcoming Monday Night Show.
   */
  getNextUpcomingShow(): MondayNightShow | null {
    if (this.upcomingShows.length === 0) {
      return null;
    }

    return this.upcomingShows.sort((a, b) => a.date.getTime() - b.date.getTime())[0];
  }

  /**
   * Gets countdown to the next show in seconds.
   */
  getCountdownToNextShow(): number {
    const nextShow = this.getNextUpcomingShow();
    if (!nextShow) {
      return 0;
    }

    const now = new Date();
    const diffMs = nextShow.date.getTime() - now.getTime();
    return Math.max(0, Math.floor(diffMs / 1000));
  }

  /**
   * Updates featured contestant for a show.
   */
  updateFeaturedContestant(
    showId: string,
    contestant: FeaturedContestant
  ): boolean {
    const show = this.findShow(showId);

    if (!show) {
      return false;
    }

    show.featured = contestant;
    return true;
  }

  /**
   * Updates sponsor for a show.
   */
  updateSponsor(
    showId: string,
    sponsorId: string,
    sponsorName: string,
    sponsorLogo?: string
  ): boolean {
    const show = this.findShow(showId);

    if (!show) {
      return false;
    }

    show.sponsorId = sponsorId;
    show.sponsorName = sponsorName;
    if (sponsorLogo) {
      show.sponsorLogo = sponsorLogo;
    }

    return true;
  }

  /**
   * Records a view for the current show.
   */
  recordView(): boolean {
    if (!this.currentShow) {
      return false;
    }

    this.currentShow.viewCount += 1;
    return true;
  }

  /**
   * Records a participant for the current show.
   */
  recordParticipant(): boolean {
    if (!this.currentShow) {
      return false;
    }

    this.currentShow.participantCount += 1;
    return true;
  }

  /**
   * Gets the standard Monday Night Stage reward.
   */
  getStandardReward(): MondayNightReward {
    return this.standardReward;
  }

  /**
   * Updates the standard Monday Night Stage reward.
   */
  setStandardReward(reward: MondayNightReward): void {
    this.standardReward = reward;
  }

  /**
   * Gets all upcoming shows.
   */
  getUpcomingShows(count: number = 5): MondayNightShow[] {
    return this.upcomingShows
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, count);
  }

  /**
   * Gets past shows (completed).
   */
  getPastShows(count: number = 10): MondayNightShow[] {
    return this.pastShows
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, count);
  }

  /**
   * Gets engagement stats for a show.
   */
  getShowStats(showId: string): {
    viewCount: number;
    participantCount: number;
    engagementRatio: number;
    prizePool: number;
  } | null {
    const show = this.findShow(showId);

    if (!show) {
      return null;
    }

    const engagementRatio =
      show.viewCount > 0 ? show.participantCount / show.viewCount : 0;

    return {
      viewCount: show.viewCount,
      participantCount: show.participantCount,
      engagementRatio,
      prizePool: show.prizePool,
    };
  }

  /**
   * Finds a show by ID across all collections.
   */
  private findShow(showId: string): MondayNightShow | null {
    if (this.currentShow?.id === showId) {
      return this.currentShow;
    }

    const upcomingMatch = this.upcomingShows.find((s) => s.id === showId);
    if (upcomingMatch) {
      return upcomingMatch;
    }

    const pastMatch = this.pastShows.find((s) => s.id === showId);
    return pastMatch || null;
  }

  /**
   * Gets rotation schedule for next N weeks.
   */
  getRotationSchedule(weeks: number = 4): MondayNightShow[] {
    const schedule: MondayNightShow[] = [];

    if (this.currentShow) {
      schedule.push(this.currentShow);
    }

    schedule.push(
      ...this.upcomingShows
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, weeks)
    );

    return schedule;
  }

  /**
   * Gets total views and participants across all shows.
   */
  getTotalStats(): {
    totalShows: number;
    totalViews: number;
    totalParticipants: number;
    averageViewsPerShow: number;
    totalPrizePools: number;
  } {
    const allShows = [
      ...(this.currentShow ? [this.currentShow] : []),
      ...this.upcomingShows,
      ...this.pastShows,
    ];

    const totalViews = allShows.reduce((sum, s) => sum + s.viewCount, 0);
    const totalParticipants = allShows.reduce(
      (sum, s) => sum + s.participantCount,
      0
    );
    const totalPrizePools = allShows.reduce((sum, s) => sum + s.prizePool, 0);
    const avgViews = allShows.length > 0 ? totalViews / allShows.length : 0;

    return {
      totalShows: allShows.length,
      totalViews,
      totalParticipants,
      averageViewsPerShow: Math.floor(avgViews),
      totalPrizePools,
    };
  }
}

// Singleton instance
export const mondayNightStageEngine = new MondayNightStageEngine();
