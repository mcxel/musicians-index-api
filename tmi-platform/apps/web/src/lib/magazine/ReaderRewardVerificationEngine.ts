// READER REWARD VERIFICATION ENGINE — Anti-Cheat Reward Issuance
// Purpose: Verify reward eligibility before points transfer
// Prevents abuse: bot reads, instant completion, multi-device farming, etc.

import { randomUUID } from 'crypto';

export type FraudFlag = 'BOT_BEHAVIOR' | 'INSTANT_COMPLETE' | 'RAPID_READS' | 'DEVICE_FARM' | 'CONTENT_SKIP' | 'NORMAL';

export interface RewardVerification {
  id: string;
  userId: string;
  articleSlug: string;
  readTimeSeconds: number;
  scrollPercentage: number;
  deviceId: string;
  ipAddress: string;
  fraudScore: number; // 0-100
  flags: FraudFlag[];
  isApproved: boolean;
  approvedAt?: string;
  pointsAwarded: number;
}

export interface UserRewardHistory {
  userId: string;
  totalArticlesRead: number;
  totalPointsEarned: number;
  fraudFlagsReceived: number;
  suspensionStatus: 'active' | 'flagged' | 'suspended';
}

// Reward verification log
const VERIFICATION_LOG = new Map<string, RewardVerification>();

// User reward history
const USER_REWARD_HISTORY = new Map<string, UserRewardHistory>();

// Fraud thresholds
const FRAUD_THRESHOLDS = {
  maxFraudScore: 40, // 0-100, score > 40 = reject
  minReadTimePercent: 60, // Must read at least 60% of estimated time
  minScrollPercent: 60, // Must scroll 60%
  maxReadsPerHourPerDevice: 3, // Anti-bot
  maxReadsPerHourPerIP: 10, // Anti-farm
};

// Device/IP read tracking (for rate limiting)
const DEVICE_READ_TRACKER = new Map<string, { count: number; resetAt: number }>();
const IP_READ_TRACKER = new Map<string, { count: number; resetAt: number }>();

export class ReaderRewardVerificationEngine {
  /**
   * Verify reward eligibility before points transfer
   */
  static async verifyReward(
    userId: string,
    articleSlug: string,
    readTimeSeconds: number,
    scrollPercentage: number,
    minReadTimeSeconds: number,
    deviceId: string,
    ipAddress: string
  ): Promise<RewardVerification> {
    const verification: RewardVerification = {
      id: randomUUID(),
      userId,
      articleSlug,
      readTimeSeconds,
      scrollPercentage,
      deviceId,
      ipAddress,
      fraudScore: 0,
      flags: [],
      isApproved: false,
      pointsAwarded: 0,
    };

    // Run fraud checks
    const { score, flags } = this.runFraudChecks(
      userId,
      readTimeSeconds,
      scrollPercentage,
      minReadTimeSeconds,
      deviceId,
      ipAddress
    );

    verification.fraudScore = score;
    verification.flags = flags;

    // Approve if score is below threshold
    if (score <= FRAUD_THRESHOLDS.maxFraudScore) {
      verification.isApproved = true;
      verification.approvedAt = new Date().toISOString();
      verification.pointsAwarded = 50; // Default reward (customize per article)
    }

    // Log verification
    VERIFICATION_LOG.set(verification.id, verification);

    // Update user history
    this.updateUserHistory(userId, verification);

    return verification;
  }

  /**
   * Run fraud detection checks
   */
  private static runFraudChecks(
    userId: string,
    readTimeSeconds: number,
    scrollPercentage: number,
    minReadTimeSeconds: number,
    deviceId: string,
    ipAddress: string
  ): { score: number; flags: FraudFlag[] } {
    let score = 0;
    const flags: FraudFlag[] = [];

    // Check 1: Instant completion (< 30 seconds)
    if (readTimeSeconds < 30) {
      flags.push('INSTANT_COMPLETE');
      score += 35; // High fraud indicator
    }

    // Check 2: Read time vs estimated
    const readTimePercentage = (readTimeSeconds / Math.max(minReadTimeSeconds, 1)) * 100;
    if (readTimePercentage < FRAUD_THRESHOLDS.minReadTimePercent) {
      flags.push('CONTENT_SKIP');
      score += 30;
    }

    // Check 3: Scroll engagement
    if (scrollPercentage < FRAUD_THRESHOLDS.minScrollPercent) {
      flags.push('CONTENT_SKIP');
      score += 25;
    }

    // Check 4: Device rate limiting
    const deviceTracker = DEVICE_READ_TRACKER.get(deviceId);
    if (deviceTracker) {
      if (Date.now() < deviceTracker.resetAt && deviceTracker.count >= FRAUD_THRESHOLDS.maxReadsPerHourPerDevice) {
        flags.push('RAPID_READS');
        score += 40; // Multiple rapid reads from same device
      }
    }

    // Check 5: IP rate limiting
    const ipTracker = IP_READ_TRACKER.get(ipAddress);
    if (ipTracker) {
      if (Date.now() < ipTracker.resetAt && ipTracker.count >= FRAUD_THRESHOLDS.maxReadsPerHourPerIP) {
        flags.push('DEVICE_FARM');
        score += 45; // Farm-like activity
      }
    }

    // Check 6: User history anomalies
    const userHistory = USER_REWARD_HISTORY.get(userId);
    if (userHistory) {
      if (userHistory.fraudFlagsReceived > 2) {
        flags.push('BOT_BEHAVIOR');
        score += 50; // Multiple fraud flags = suspicious
      }

      if (userHistory.suspensionStatus === 'suspended') {
        score = 100; // Auto-reject suspended users
      }
    }

    // If no flags, mark as normal
    if (flags.length === 0) {
      flags.push('NORMAL');
    }

    return { score: Math.min(100, score), flags };
  }

  /**
   * Update user reward history
   */
  private static updateUserHistory(userId: string, verification: RewardVerification): void {
    let history = USER_REWARD_HISTORY.get(userId);

    if (!history) {
      history = {
        userId,
        totalArticlesRead: 0,
        totalPointsEarned: 0,
        fraudFlagsReceived: 0,
        suspensionStatus: 'active',
      };
      USER_REWARD_HISTORY.set(userId, history);
    }

    history.totalArticlesRead += 1;

    if (verification.isApproved) {
      history.totalPointsEarned += verification.pointsAwarded;
    } else {
      history.fraudFlagsReceived += 1;

      // Auto-suspend after 5 fraud flags
      if (history.fraudFlagsReceived >= 5) {
        history.suspensionStatus = 'suspended';
      } else if (history.fraudFlagsReceived >= 3) {
        history.suspensionStatus = 'flagged';
      }
    }
  }

  /**
   * Track device/IP reads for rate limiting
   */
  static async recordDeviceRead(deviceId: string, ipAddress: string): Promise<void> {
    const now = Date.now();
    const oneHourFromNow = now + 60 * 60 * 1000;

    // Device tracker
    let deviceTracker = DEVICE_READ_TRACKER.get(deviceId);
    if (!deviceTracker || now >= deviceTracker.resetAt) {
      DEVICE_READ_TRACKER.set(deviceId, { count: 1, resetAt: oneHourFromNow });
    } else {
      deviceTracker.count += 1;
    }

    // IP tracker
    let ipTracker = IP_READ_TRACKER.get(ipAddress);
    if (!ipTracker || now >= ipTracker.resetAt) {
      IP_READ_TRACKER.set(ipAddress, { count: 1, resetAt: oneHourFromNow });
    } else {
      ipTracker.count += 1;
    }
  }

  /**
   * Get user reward history
   */
  static async getUserHistory(userId: string): Promise<UserRewardHistory | null> {
    return USER_REWARD_HISTORY.get(userId) || null;
  }

  /**
   * Get verification record
   */
  static async getVerification(verificationId: string): Promise<RewardVerification | null> {
    return VERIFICATION_LOG.get(verificationId) || null;
  }

  /**
   * Flag user for review (admin action)
   */
  static async flagUser(userId: string, reason: string): Promise<void> {
    const history = USER_REWARD_HISTORY.get(userId);
    if (history) {
      history.suspensionStatus = 'flagged';
      history.fraudFlagsReceived += 1;
    }
  }

  /**
   * Suspend user (admin action)
   */
  static async suspendUser(userId: string, reason: string): Promise<void> {
    const history = USER_REWARD_HISTORY.get(userId);
    if (history) {
      history.suspensionStatus = 'suspended';
    }
  }

  /**
   * Reinstate user (admin action)
   */
  static async reinstateUser(userId: string): Promise<void> {
    const history = USER_REWARD_HISTORY.get(userId);
    if (history) {
      history.suspensionStatus = 'active';
      history.fraudFlagsReceived = 0;
    }
  }

  /**
   * Get fraud statistics (admin)
   */
  static async getFraudStats(): Promise<{
    totalVerifications: number;
    approvedCount: number;
    rejectedCount: number;
    suspendedUsers: number;
    avgFraudScore: number;
  }> {
    const verifications = Array.from(VERIFICATION_LOG.values());
    const approvedCount = verifications.filter((v) => v.isApproved).length;
    const rejectedCount = verifications.length - approvedCount;
    const suspendedUsers = Array.from(USER_REWARD_HISTORY.values()).filter(
      (h) => h.suspensionStatus === 'suspended'
    ).length;
    const avgFraudScore =
      verifications.length > 0
        ? Math.round(verifications.reduce((sum, v) => sum + v.fraudScore, 0) / verifications.length)
        : 0;

    return {
      totalVerifications: verifications.length,
      approvedCount,
      rejectedCount,
      suspendedUsers,
      avgFraudScore,
    };
  }
}

export default ReaderRewardVerificationEngine;
