// Robots Authority Engine - Crawler permission management for clean indexing
export interface RobotsRule {
  userAgent: string;
  allows: string[];
  disallows: string[];
  crawlDelay?: number;
  requestRate?: string;
}

export class RobotsAuthorityEngine {
  static BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://tmiplatform.com';

  /**
   * Generate robots.txt content for crawler permissions
   * Allows public pages, blocks admin and private routes
   */
  static generateRobotsTxt(): string {
    let content = '# TMI Platform Robots.txt\n';
    content += `# Generated: ${new Date().toISOString()}\n`;
    content += `# Base URL: ${this.BASE_URL}\n\n`;

    // Google Bot - Full access to public content
    content += 'User-agent: Googlebot\n';
    content += 'Allow: /\n';
    content += 'Allow: /global/\n';
    content += 'Allow: /cities/\n';
    content += 'Allow: /genres/\n';
    content += 'Allow: /artists/\n';
    content += 'Allow: /performers/\n';
    content += 'Allow: /venues/\n';
    content += 'Allow: /events/\n';
    content += 'Allow: /articles/\n';
    content += 'Allow: /magazine/\n';
    content += 'Allow: /billboards/\n';
    content += 'Allow: /tickets/\n';
    content += 'Allow: /trending/\n';
    content += 'Allow: /winners/\n';
    content += 'Allow: /sitemap.xml\n';
    content += 'Disallow: /admin/\n';
    content += 'Disallow: /api/admin/\n';
    content += 'Disallow: /account/\n';
    content += 'Disallow: /settings/\n';
    content += 'Disallow: /private/\n';
    content += 'Disallow: /*.json$\n';
    content += 'Crawl-delay: 1\n';
    content += 'Request-rate: 100/1m\n\n';

    // Bingbot - Full access
    content += 'User-agent: Bingbot\n';
    content += 'Allow: /\n';
    content += 'Disallow: /admin/\n';
    content += 'Disallow: /account/\n';
    content += 'Disallow: /settings/\n';
    content += 'Crawl-delay: 2\n\n';

    // Yandexbot - Full access
    content += 'User-agent: Yandexbot\n';
    content += 'Allow: /\n';
    content += 'Disallow: /admin/\n';
    content += 'Crawl-delay: 1\n\n';

    // DuckDuckGo - Full access
    content += 'User-agent: DuckDuckBot\n';
    content += 'Allow: /\n';
    content += 'Disallow: /admin/\n\n';

    // Block bad bots
    content += 'User-agent: MJ12bot\n';
    content += 'Disallow: /\n\n';

    content += 'User-agent: AhrefsBot\n';
    content += 'Disallow: /\n\n';

    content += 'User-agent: SemrushBot\n';
    content += 'Disallow: /\n\n';

    // Default rule - allow everything for unrecognized bots
    content += 'User-agent: *\n';
    content += 'Allow: /\n';
    content += 'Disallow: /admin/\n';
    content += 'Disallow: /account/\n';
    content += 'Disallow: /settings/\n';
    content += 'Disallow: /private/\n';
    content += 'Crawl-delay: 5\n\n';

    // Sitemap locations
    content += `Sitemap: ${this.BASE_URL}/sitemap.xml\n`;

    return content;
  }

  /**
   * Get rules by user agent
   */
  static getRulesForAgent(userAgent: string): RobotsRule | null {
    const rules: RobotsRule[] = [
      {
        userAgent: 'Googlebot',
        allows: ['/', '/global/', '/cities/', '/genres/', '/artists/', '/performers/', '/venues/', '/events/', '/articles/', '/magazine/', '/billboards/'],
        disallows: ['/admin/', '/api/admin/', '/account/', '/settings/', '/private/', '/*.json$'],
        crawlDelay: 1,
        requestRate: '100/1m',
      },
      {
        userAgent: 'Bingbot',
        allows: ['/', '/global/', '/cities/', '/genres/', '/artists/', '/performers/', '/venues/', '/events/'],
        disallows: ['/admin/', '/account/', '/settings/'],
        crawlDelay: 2,
      },
      {
        userAgent: '*',
        allows: ['/'],
        disallows: ['/admin/', '/account/', '/settings/', '/private/'],
        crawlDelay: 5,
      },
    ];

    return rules.find((rule) => userAgent.includes(rule.userAgent)) || rules.find((rule) => rule.userAgent === '*') || null;
  }

  /**
   * Check if a route is allowed for a user agent
   */
  static isRouteAllowed(route: string, userAgent: string): boolean {
    const rules = this.getRulesForAgent(userAgent);
    if (!rules) return true; // Default allow

    // Check disallows first
    for (const disallow of rules.disallows) {
      if (disallow === '/') return false;
      if (route.startsWith(disallow.replace('$', ''))) return false;
    }

    // Check allows
    if (rules.allows.includes('/')) return true;
    return rules.allows.some((allow) => route.startsWith(allow));
  }

  /**
   * Get summary of crawler rules
   */
  static getRulesSummary() {
    return {
      allowed: ['/global/', '/cities/', '/genres/', '/artists/', '/performers/', '/venues/', '/events/', '/articles/', '/magazine/', '/billboards/', '/tickets/'],
      blocked: ['/admin/', '/api/admin/', '/account/', '/settings/', '/private/'],
      googleCrawlDelay: 1,
      defaultCrawlDelay: 5,
      lastGenerated: new Date().toISOString(),
    };
  }

  /**
   * Get blocked routes list
   */
  static getBlockedRoutes(): string[] {
    return ['/admin/', '/api/admin/', '/account/', '/settings/', '/private/', '/dashboard/', '/console/'];
  }

  /**
   * Get allowed routes list
   */
  static getAllowedRoutes(): string[] {
    return [
      '/',
      '/global/',
      '/cities/',
      '/genres/',
      '/artists/',
      '/performers/',
      '/venues/',
      '/events/',
      '/articles/',
      '/magazine/',
      '/billboards/',
      '/tickets/',
      '/trending/',
      '/winners/',
      '/song-battle/',
      '/dance-party/',
      '/cypher/',
    ];
  }
}
