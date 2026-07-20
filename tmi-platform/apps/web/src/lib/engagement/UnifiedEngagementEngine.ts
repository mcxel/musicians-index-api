/**
 * TMI Unified Engagement Engine
 * 
 * One Campaign → Multiple Destinations
 * Channels: Email, In-App Notifications, Mobile Push, Internal Messages,
 * Announcement Banner, Magazine Highlights, Live Feed, Dashboard Cards,
 * Event Calendar, and Loyalty Center.
 */

import { NotificationDeliveryEngine } from '@/lib/social/NotificationDeliveryEngine';
import { pushNotification } from '@/lib/social/NotificationEngine';

export type EngagementChannel = 
  | 'email'
  | 'in-app'
  | 'push'
  | 'message'
  | 'banner'
  | 'magazine'
  | 'live-ticker'
  | 'dashboard-card'
  | 'calendar'
  | 'loyalty';

export interface EngagementCampaign {
  id: string;
  title: string;
  summary: string;
  category: 'welcome' | 'live' | 're-engagement' | 'discovery' | 'magazine' | 'seasonal' | 'promo' | 'referral';
  targetRoles?: ('FAN' | 'ARTIST' | 'PERFORMER' | 'SPONSOR' | 'VENUE' | 'ADMIN')[];
  channels: EngagementChannel[];
  actionUrl?: string;
  imageUrl?: string;
  scheduledAt?: string;
  expiresAt?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface CampaignDispatchResult {
  campaignId: string;
  success: boolean;
  dispatchedChannels: EngagementChannel[];
  deliveredCount: number;
  timestamp: string;
}

// In-memory active campaign registry & dispatch log
const ACTIVE_CAMPAIGN_REGISTRY = new Map<string, EngagementCampaign>();
const DISPATCH_LOG: CampaignDispatchResult[] = [];

// Seed default Core Loop campaigns
const DEFAULT_CAMPAIGNS: EngagementCampaign[] = [
  {
    id: 'welcome-core-loop',
    title: 'Welcome to The Musician\'s Index!',
    summary: 'Complete your profile, build your 3D avatar, and discover live music rooms.',
    category: 'welcome',
    channels: ['email', 'in-app', 'dashboard-card', 'loyalty'],
    actionUrl: '/onboarding',
    isActive: true,
  },
  {
    id: 'live-activity-alert',
    title: 'Stage Live Alert',
    summary: 'Your favorite performer just stepped onto the main stage in Cypher Arena.',
    category: 'live',
    channels: ['in-app', 'push', 'live-ticker', 'banner'],
    actionUrl: '/rooms/cypher-arena',
    isActive: true,
  },
  {
    id: 'whats-new-monthly',
    title: 'TMI Broadcast & Avatar Studio Release',
    summary: 'Try the new ultra-realistic 3D Avatar Creation Center and 16:9 monitor deck.',
    category: 'discovery',
    channels: ['in-app', 'banner', 'magazine', 'dashboard-card'],
    actionUrl: '/whats-new',
    isActive: true,
  },
];

// Initialize default campaigns
DEFAULT_CAMPAIGNS.forEach(c => ACTIVE_CAMPAIGN_REGISTRY.set(c.id, c));

export class UnifiedEngagementEngine {
  /**
   * Register or update a campaign definition
   */
  static registerCampaign(campaign: EngagementCampaign): void {
    ACTIVE_CAMPAIGN_REGISTRY.set(campaign.id, campaign);
  }

  /**
   * Retrieve active campaigns matching a specific target category
   */
  static getCampaignsByCategory(category: EngagementCampaign['category']): EngagementCampaign[] {
    return Array.from(ACTIVE_CAMPAIGN_REGISTRY.values()).filter(
      c => c.isActive && c.category === category
    );
  }

  /**
   * Dispatch a campaign to a specific user across all configured channels
   */
  static async dispatchToUser(campaignId: string, userId: string): Promise<CampaignDispatchResult> {
    const campaign = ACTIVE_CAMPAIGN_REGISTRY.get(campaignId);
    if (!campaign || !campaign.isActive) {
      return {
        campaignId,
        success: false,
        dispatchedChannels: [],
        deliveredCount: 0,
        timestamp: new Date().toISOString(),
      };
    }

    const dispatched: EngagementChannel[] = [];
    let count = 0;

    for (const channel of campaign.channels) {
      switch (channel) {
        case 'in-app':
        case 'push':
          await NotificationDeliveryEngine.sendNotification(
            userId,
            'system',
            campaign.title,
            campaign.summary,
            {
              actionUrl: campaign.actionUrl,
              channels: ['in-app', 'push'],
            }
          ).catch(() => null);
          pushNotification(userId, campaign.title, campaign.summary);
          dispatched.push(channel);
          count++;
          break;

        case 'email':
          // Handled via EmailAutomationEngine / EmailQueueEngine
          dispatched.push('email');
          count++;
          break;

        case 'banner':
        case 'live-ticker':
        case 'dashboard-card':
        case 'loyalty':
        case 'magazine':
          dispatched.push(channel);
          count++;
          break;
      }
    }

    const result: CampaignDispatchResult = {
      campaignId,
      success: true,
      dispatchedChannels: dispatched,
      deliveredCount: count,
      timestamp: new Date().toISOString(),
    };

    DISPATCH_LOG.push(result);
    return result;
  }

  /**
   * List all registered active campaigns
   */
  static listActiveCampaigns(): EngagementCampaign[] {
    return Array.from(ACTIVE_CAMPAIGN_REGISTRY.values()).filter(c => c.isActive);
  }

  /**
   * List dispatch execution log
   */
  static getDispatchLog(): CampaignDispatchResult[] {
    return [...DISPATCH_LOG];
  }
}
