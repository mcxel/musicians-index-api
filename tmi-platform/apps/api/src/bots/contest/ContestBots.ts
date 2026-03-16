/**
 * ContestBots.ts
 * TMI Grand Platform Contest — Bot Helpers
 * BerntoutGlobal XXL
 *
 * Repo path: apps/api/src/bots/contest/ContestBots.ts
 * Contains: ContestQualificationBot, SponsorVerificationBot, SponsorMatchBot,
 *           HostScriptBot, PrizeFulfillmentBot, ContestAnalyticsBot, RuleEnforcementBot
 *
 * Wiring: Register each bot as a NestJS Injectable service
 *         Wire to event bus via EventEmitter2 listeners
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONTEST QUALIFICATION BOT
// Guides artists step-by-step through the qualification process
// ═══════════════════════════════════════════════════════════════════════════

export class ContestQualificationBot {
  readonly name = 'ContestQualificationBot';
  readonly role = 'Guide artists through contest qualification steps';

  /**
   * Determines next action for an artist based on their entry state
   */
  getNextStep(entry: {
    localSponsors: number;
    majorSponsors: number;
    status: string;
  }): { step: string; message: string; action: string; priority: 'high' | 'medium' | 'low' } {
    const localNeeded = Math.max(0, 10 - entry.localSponsors);
    const majorNeeded = Math.max(0, 10 - entry.majorSponsors);

    if (entry.status === 'qualified') {
      return {
        step: 'qualified',
        message: '🎉 You\'re fully qualified! Get ready to compete.',
        action: 'VIEW_SCHEDULE',
        priority: 'low',
      };
    }

    if (localNeeded > 0 && majorNeeded > 0) {
      return {
        step: 'sponsor_both',
        message: `You need ${localNeeded} more local sponsors and ${majorNeeded} more major sponsors to qualify.`,
        action: 'FIND_SPONSORS',
        priority: 'high',
      };
    }

    if (localNeeded > 0) {
      return {
        step: 'sponsor_local',
        message: `Almost there! You need ${localNeeded} more local sponsors.`,
        action: 'FIND_LOCAL_SPONSORS',
        priority: 'high',
      };
    }

    if (majorNeeded > 0) {
      return {
        step: 'sponsor_major',
        message: `Great progress! Secure ${majorNeeded} more major sponsors to qualify.`,
        action: 'FIND_MAJOR_SPONSORS',
        priority: 'high',
      };
    }

    return {
      step: 'pending_verification',
      message: 'All sponsors secured! Awaiting verification.',
      action: 'WAIT',
      priority: 'medium',
    };
  }

  /**
   * Generates personalized sponsor outreach tips
   */
  getSponsorTips(artistCategory: string, location?: string): string[] {
    const tips = [
      `As a ${artistCategory}, local music venues and equipment stores are great local sponsor targets.`,
      'Message sponsors with a personal video pitch — it converts 3x better than text alone.',
      'Offer sponsors a shoutout on your social media when you send the request.',
      'Local restaurants, barber shops, and clothing boutiques love supporting local talent.',
      `Major sponsors to target: audio brands, streaming services, energy drink companies.`,
    ];

    if (location) {
      tips.unshift(`Search for ${artistCategory} brands and businesses near ${location} on the platform.`);
    }

    return tips;
  }

  /**
   * Failure mode: returns generic guidance if entry data unavailable
   */
  getFallbackMessage(): { message: string; action: string } {
    return {
      message: 'Head to your Contest Entry page to check your sponsor progress and find available sponsors.',
      action: 'VIEW_ENTRY',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SPONSOR VERIFICATION BOT
// Verifies sponsor legitimacy and payment status
// ═══════════════════════════════════════════════════════════════════════════

export class SponsorVerificationBot {
  readonly name = 'SponsorVerificationBot';
  readonly role = 'Verify sponsor payments and legitimacy';

  /**
   * Runs automated checks on a sponsor contribution
   * Returns verification result and any flags
   */
  async verifySponsorContribution(contribution: {
    sponsorId: string;
    entryId: string;
    amount: number;
    packageType: 'local' | 'major';
    paymentReference?: string;
  }): Promise<{
    verified: boolean;
    flags: string[];
    action: 'auto_approve' | 'needs_review' | 'reject';
    reason?: string;
  }> {
    const flags: string[] = [];

    // Check payment reference exists
    if (!contribution.paymentReference) {
      flags.push('NO_PAYMENT_REFERENCE');
    }

    // Check amount meets minimum for package type
    const minAmount = contribution.packageType === 'local' ? 50 : 1000;
    if (contribution.amount < minAmount) {
      flags.push(`AMOUNT_BELOW_MINIMUM_${minAmount}`);
    }

    // Check for suspicious patterns (placeholder logic)
    // TODO: connect to real payment verification via Stripe/payment provider

    if (flags.length === 0) {
      return { verified: true, flags, action: 'auto_approve' };
    }

    if (flags.includes('NO_PAYMENT_REFERENCE')) {
      return { verified: false, flags, action: 'needs_review', reason: 'Payment reference missing' };
    }

    return { verified: false, flags, action: 'reject', reason: `Amount below minimum: $${minAmount}` };
  }

  /**
   * Failure mode: flag for admin review
   */
  getFailureFallback(reason: string): { action: 'admin_review'; message: string } {
    return {
      action: 'admin_review',
      message: `Sponsor contribution flagged for admin review: ${reason}`,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SPONSOR MATCH BOT
// Suggests relevant sponsors to artists based on their profile
// ═══════════════════════════════════════════════════════════════════════════

export class SponsorMatchBot {
  readonly name = 'SponsorMatchBot';
  readonly role = 'Suggest relevant sponsors to artists';

  /**
   * Ranks available sponsors by relevance to artist
   */
  rankSponsors(
    artist: { category: string; genre?: string; location?: string; followersCount: number },
    availableSponsors: Array<{ id: string; name: string; industry: string; type: string; location?: string }>,
  ): Array<{ sponsor: typeof availableSponsors[0]; score: number; reason: string }> {
    return availableSponsors
      .map((sponsor) => {
        let score = 0;
        let reason = '';

        // Location match
        if (artist.location && sponsor.location === artist.location) {
          score += 30;
          reason += 'Local match. ';
        }

        // Industry relevance to category
        const relevantIndustries = this.getRelevantIndustries(artist.category);
        if (relevantIndustries.includes(sponsor.industry)) {
          score += 25;
          reason += `Industry match for ${artist.category}. `;
        }

        // Base score for availability
        score += 10;

        return { sponsor, score, reason: reason.trim() || 'Available on platform' };
      })
      .sort((a, b) => b.score - a.score);
  }

  private getRelevantIndustries(category: string): string[] {
    const map: Record<string, string[]> = {
      singers: ['music', 'audio', 'entertainment', 'fashion'],
      rappers: ['music', 'fashion', 'streetwear', 'audio'],
      comedians: ['entertainment', 'media', 'hospitality'],
      dancers: ['fashion', 'fitness', 'entertainment', 'audio'],
      djs: ['audio', 'nightlife', 'music', 'tech'],
      bands: ['music', 'audio', 'entertainment', 'instruments'],
      beatmakers: ['music', 'tech', 'audio', 'software'],
    };
    return map[category] || ['entertainment', 'media'];
  }

  /**
   * Failure mode: return generic top sponsors
   */
  getFallbackSuggestions(): { message: string } {
    return { message: 'Browse all available sponsors on the platform to find your best match.' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HOST SCRIPT BOT
// Generates personalized Ray Journey script cues
// ═══════════════════════════════════════════════════════════════════════════

export class HostScriptBot {
  readonly name = 'HostScriptBot';
  readonly role = 'Generate Ray Journey script cues for contest events';

  generateContestantIntro(data: {
    artistName: string;
    category: string;
    hometown?: string;
    sponsors?: string[];
  }): string {
    const sponsorLine = data.sponsors?.length
      ? `brought to you by ${data.sponsors.slice(0, 2).join(' and ')}${data.sponsors.length > 2 ? ' and more' : ''}`
      : '';

    const hometownLine = data.hometown ? ` all the way from ${data.hometown}` : '';

    return `Ladies and gentlemen, give it up for ${data.artistName}${hometownLine}! This ${data.category} is here to show you what they've got! ${sponsorLine ? `This performance is ${sponsorLine}!` : ''} Let's GO!`;
  }

  generateSponsorShoutout(sponsors: Array<{ name: string; tier: string }>): string {
    if (!sponsors.length) return "Tonight's show is made possible by all our incredible platform sponsors!";

    const titleSponsors = sponsors.filter((s) => s.tier === 'title');
    const majorSponsors = sponsors.filter((s) => s.tier !== 'title' && s.tier !== 'bronze');

    if (titleSponsors.length) {
      return `Tonight's Grand Platform Contest is presented by our title sponsor — ${titleSponsors[0].name}! And a massive thank you to all our sponsors making this possible!`;
    }

    const names = majorSponsors.slice(0, 3).map((s) => s.name).join(', ');
    return `Huge shoutout to tonight's sponsors — ${names} — thank you for making this show happen!`;
  }

  generateWinnerAnnouncement(artistName: string, category: string): string {
    return `The votes are in. The crowd has spoken. And the winner of the BerntoutGlobal Grand Platform Contest — ${category} category — is… ${artistName}! CONGRATULATIONS!`;
  }

  /**
   * Failure mode: return template fallback
   */
  getTemplateFallback(type: string): string {
    const fallbacks: Record<string, string> = {
      contestant_intro: 'Please welcome our next contestant to the stage!',
      sponsor_shoutout: 'Thank you to all of our incredible sponsors!',
      winner_announce: 'And your winner is… congratulations!',
      crowd_hype: 'Make some noise!',
    };
    return fallbacks[type] || 'Welcome to the BerntoutGlobal Grand Platform Contest!';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PRIZE FULFILLMENT BOT
// Tracks and manages prize delivery to winners
// ═══════════════════════════════════════════════════════════════════════════

export class PrizeFulfillmentBot {
  readonly name = 'PrizeFulfillmentBot';
  readonly role = 'Track and manage prize delivery to contest winners';

  checkFulfillmentStatus(fulfillment: {
    status: string;
    deliveredAt?: Date;
    prizeType: string;
  }): { status: string; nextAction: string; alertAdmin: boolean } {
    if (fulfillment.status === 'delivered') {
      return { status: 'delivered', nextAction: 'REQUEST_WINNER_VERIFICATION', alertAdmin: false };
    }

    if (fulfillment.status === 'processing') {
      const daysSinceCreated = 0; // TODO: calculate from createdAt
      if (daysSinceCreated > 7) {
        return { status: 'processing', nextAction: 'ESCALATE', alertAdmin: true };
      }
      return { status: 'processing', nextAction: 'FOLLOW_UP', alertAdmin: false };
    }

    if (fulfillment.status === 'pending') {
      return { status: 'pending', nextAction: 'INITIATE_DELIVERY', alertAdmin: true };
    }

    return { status: fulfillment.status, nextAction: 'ADMIN_REVIEW', alertAdmin: true };
  }

  /**
   * Failure mode: alert admin immediately
   */
  getFailureAlert(fulfillmentId: string): { message: string; adminRequired: boolean } {
    return {
      message: `Prize fulfillment ${fulfillmentId} requires immediate admin attention.`,
      adminRequired: true,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTEST ANALYTICS BOT
// Aggregates contest engagement analytics
// ═══════════════════════════════════════════════════════════════════════════

export class ContestAnalyticsBot {
  readonly name = 'ContestAnalyticsBot';
  readonly role = 'Aggregate and surface contest engagement analytics';

  computeQualificationFunnelRate(data: {
    totalEntries: number;
    qualifiedEntries: number;
  }): number {
    if (!data.totalEntries) return 0;
    return Math.round((data.qualifiedEntries / data.totalEntries) * 100);
  }

  computeSponsorConversionRate(data: {
    totalInvites: number;
    confirmedSponsors: number;
  }): number {
    if (!data.totalInvites) return 0;
    return Math.round((data.confirmedSponsors / data.totalInvites) * 100);
  }

  computeSponsorROI(data: {
    totalInvested: number;
    estimatedImpressions: number;
    profileViews: number;
    stageMentions: number;
  }): { estimatedCPM: number; engagementScore: number } {
    const estimatedCPM = data.estimatedImpressions > 0
      ? (data.totalInvested / data.estimatedImpressions) * 1000
      : 0;
    const engagementScore = data.profileViews + data.stageMentions * 5;
    return { estimatedCPM: Math.round(estimatedCPM * 100) / 100, engagementScore };
  }

  /**
   * Failure mode: return empty analytics state
   */
  getEmptyState(): Record<string, number> {
    return {
      totalEntries: 0,
      qualifiedEntries: 0,
      totalVotes: 0,
      sponsorRevenue: 0,
      qualificationRate: 0,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// RULE ENFORCEMENT BOT
// Anti-abuse, fraud detection, and contest compliance
// ═══════════════════════════════════════════════════════════════════════════

export class RuleEnforcementBot {
  readonly name = 'RuleEnforcementBot';
  readonly role = 'Detect and flag contest fraud and rule violations';

  /**
   * Checks an entry for rule violations
   */
  async checkEntry(entry: {
    artistId: string;
    category: string;
    sponsorContributions: Array<{ sponsorId: string; amount: number; status: string }>;
  }): Promise<{ passed: boolean; violations: string[]; action: 'allow' | 'flag' | 'block' }> {
    const violations: string[] = [];

    // Check for self-sponsorship (artist sponsoring themselves)
    const selfSponsor = entry.sponsorContributions.find((c) => c.sponsorId === entry.artistId);
    if (selfSponsor) violations.push('SELF_SPONSORSHIP_DETECTED');

    // Check for duplicate sponsors
    const sponsorIds = entry.sponsorContributions.map((c) => c.sponsorId);
    const uniqueSponsorIds = new Set(sponsorIds);
    if (sponsorIds.length !== uniqueSponsorIds.size) {
      violations.push('DUPLICATE_SPONSOR_DETECTED');
    }

    // Check for amounts below minimum
    const belowMin = entry.sponsorContributions.filter((c) => c.amount < 50);
    if (belowMin.length > 0) violations.push('SPONSOR_AMOUNT_BELOW_MINIMUM');

    if (violations.length === 0) return { passed: true, violations, action: 'allow' };
    if (violations.includes('SELF_SPONSORSHIP_DETECTED')) return { passed: false, violations, action: 'block' };
    return { passed: false, violations, action: 'flag' };
  }

  /**
   * Determines disqualification criteria
   */
  shouldDisqualify(violations: string[]): boolean {
    const disqualifyingViolations = ['SELF_SPONSORSHIP_DETECTED', 'PAYMENT_FRAUD_DETECTED', 'IDENTITY_FRAUD_DETECTED'];
    return violations.some((v) => disqualifyingViolations.includes(v));
  }

  /**
   * Failure mode: flag for human review
   */
  getFailureFallback(entryId: string): { action: 'human_review'; message: string } {
    return {
      action: 'human_review',
      message: `Entry ${entryId} could not be automatically verified. Admin review required.`,
    };
  }
}

// Export all bots
export const ContestBots = {
  qualificationBot: new ContestQualificationBot(),
  verificationBot: new SponsorVerificationBot(),
  matchBot: new SponsorMatchBot(),
  scriptBot: new HostScriptBot(),
  fulfillmentBot: new PrizeFulfillmentBot(),
  analyticsBot: new ContestAnalyticsBot(),
  enforcementBot: new RuleEnforcementBot(),
};
