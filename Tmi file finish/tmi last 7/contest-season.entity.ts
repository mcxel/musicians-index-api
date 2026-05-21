/**
 * contest-season.entity.ts
 * Repo: apps/api/src/modules/contest/entities/contest-season.entity.ts
 * Action: CREATE | Wave: W5
 *
 * HARD RULE: Contest registration must open August 8 every year.
 * This is Marcel's birthday and is enforced here, in contest.env.contract.ts,
 * in the API guard, and in the admin UI date picker minimum.
 */
export class ContestSeasonEntity {
  id: string;
  name: string;
  status: 'upcoming' | 'active' | 'completed' | 'archived';

  registrationStartDate: Date;
  registrationEndDate: Date;
  sponsorCollectionEndDate: Date;
  regionalsStartDate: Date;
  regionalsEndDate: Date;
  semiFinalsStartDate: Date;
  semiFinalsEndDate: Date;
  finalsDate: Date;

  prizePool?: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;

  /**
   * August 8 enforcement.
   * month is 0-indexed in JavaScript (7 = August).
   * Returns true if the date is August 8, false otherwise.
   */
  static validateRegistrationDate(date: Date): boolean {
    return date.getMonth() === 7 && date.getDate() === 8;
  }

  get isRegistrationOpen(): boolean {
    const now = new Date();
    return now >= this.registrationStartDate && now <= this.registrationEndDate;
  }

  get isActive(): boolean {
    return this.status === 'active';
  }
}
