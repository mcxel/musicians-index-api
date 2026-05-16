// TICKET BRANDING ENGINE — Venue-Custom Ticket Visuals
// Purpose: Apply venue branding (colors, logos, themes) to tickets
// Supports customized ticket appearance per venue

import { randomUUID } from 'crypto';

export interface VenueBranding {
  venueId: string;
  venueName: string;
  primaryColor: string; // hex
  secondaryColor: string; // hex
  accentColor: string; // hex
  logo?: string; // URL or base64
  backgroundPattern?: string;
  theme: 'modern' | 'classic' | 'neon' | 'minimal';
  fontFamily: string;
  ticketStyle: 'card' | 'strip' | 'certificate';
  customCSS?: string;
}

export interface BrandedTicket {
  ticketId: string;
  venueId: string;
  brandingApplied: boolean;
  htmlWithBranding: string;
  cssOverrides: string;
  appliedAt: string;
}

// Venue branding registry
const VENUE_BRANDS = new Map<string, VenueBranding>();

// Branded ticket cache
const BRANDED_TICKETS = new Map<string, BrandedTicket>();

// Default branding templates
const DEFAULT_BRANDS: Record<string, VenueBranding> = {
  'neon-palace': {
    venueId: 'neon-palace',
    venueName: 'Neon Palace',
    primaryColor: '#FF2DAA',
    secondaryColor: '#00FFFF',
    accentColor: '#FFD700',
    theme: 'neon',
    fontFamily: "'Arial Black', sans-serif",
    ticketStyle: 'card',
  },
  'beat-lab': {
    venueId: 'beat-lab',
    venueName: 'Beat Lab',
    primaryColor: '#AA2DFF',
    secondaryColor: '#00FF88',
    accentColor: '#FF8C00',
    theme: 'modern',
    fontFamily: "'Helvetica Neue', sans-serif",
    ticketStyle: 'strip',
  },
  'cypher-stage': {
    venueId: 'cypher-stage',
    venueName: 'Cypher Stage',
    primaryColor: '#00FFFF',
    secondaryColor: '#FF2DAA',
    accentColor: '#FFD700',
    theme: 'minimal',
    fontFamily: "'Courier New', monospace",
    ticketStyle: 'certificate',
  },
};

// Initialize defaults
Object.values(DEFAULT_BRANDS).forEach((brand) => {
  VENUE_BRANDS.set(brand.venueId, brand);
});

export class TicketBrandingEngine {
  /**
   * Get or create branding for venue
   */
  static async getBranding(venueId: string): Promise<VenueBranding> {
    return (
      VENUE_BRANDS.get(venueId) || {
        venueId,
        venueName: `Venue ${venueId}`,
        primaryColor: '#050510',
        secondaryColor: '#FFFFFF',
        accentColor: '#00FFFF',
        theme: 'modern',
        fontFamily: 'Arial, sans-serif',
        ticketStyle: 'card',
      }
    );
  }

  /**
   * Update venue branding
   */
  static async updateBranding(venueId: string, updates: Partial<VenueBranding>): Promise<VenueBranding> {
    let branding = VENUE_BRANDS.get(venueId);

    if (!branding) {
      branding = {
        venueId,
        venueName: updates.venueName || `Venue ${venueId}`,
        primaryColor: '#050510',
        secondaryColor: '#FFFFFF',
        accentColor: '#00FFFF',
        theme: 'modern',
        fontFamily: 'Arial, sans-serif',
        ticketStyle: 'card',
      };
      VENUE_BRANDS.set(venueId, branding);
    }

    if (updates.primaryColor) branding.primaryColor = updates.primaryColor;
    if (updates.secondaryColor) branding.secondaryColor = updates.secondaryColor;
    if (updates.accentColor) branding.accentColor = updates.accentColor;
    if (updates.logo) branding.logo = updates.logo;
    if (updates.backgroundPattern) branding.backgroundPattern = updates.backgroundPattern;
    if (updates.theme) branding.theme = updates.theme;
    if (updates.fontFamily) branding.fontFamily = updates.fontFamily;
    if (updates.ticketStyle) branding.ticketStyle = updates.ticketStyle;
    if (updates.customCSS) branding.customCSS = updates.customCSS;

    return branding;
  }

  /**
   * Apply branding to ticket HTML
   */
  static async applyBrandingToTicket(
    ticketId: string,
    ticketHtml: string,
    venueId: string
  ): Promise<BrandedTicket> {
    const branding = await this.getBranding(venueId);
    const cssOverrides = this.generateBrandingCSS(branding);
    const htmlWithBranding = this.injectBrandingCSS(ticketHtml, cssOverrides, branding);

    const brandedTicket: BrandedTicket = {
      ticketId,
      venueId,
      brandingApplied: true,
      htmlWithBranding,
      cssOverrides,
      appliedAt: new Date().toISOString(),
    };

    BRANDED_TICKETS.set(ticketId, brandedTicket);

    return brandedTicket;
  }

  /**
   * Generate branding CSS
   */
  private static generateBrandingCSS(branding: VenueBranding): string {
    let css = `
      :root {
        --primary-color: ${branding.primaryColor};
        --secondary-color: ${branding.secondaryColor};
        --accent-color: ${branding.accentColor};
      }

      body {
        font-family: ${branding.fontFamily};
      }

      .ticket {
        background: linear-gradient(135deg, ${branding.primaryColor}15 0%, ${branding.secondaryColor}10 100%);
        border-color: ${branding.primaryColor};
        color: ${branding.secondaryColor};
      }

      .header {
        color: ${branding.primaryColor};
        font-size: 28px;
        text-shadow: 0 0 10px ${branding.accentColor}55;
      }

      .venue {
        color: ${branding.secondaryColor};
        border-left: 4px solid ${branding.accentColor};
        padding-left: 12px;
      }

      .details {
        color: ${branding.secondaryColor};
        background: ${branding.primaryColor}20;
        border-radius: 8px;
        padding: 10px;
      }

      .owner {
        color: ${branding.accentColor};
        background: ${branding.primaryColor}30;
        padding: 8px;
        border-radius: 4px;
      }

      .barcode {
        color: ${branding.primaryColor};
        border: 2px solid ${branding.accentColor};
        padding: 8px;
        background: ${branding.secondaryColor}20;
      }
    `;

    // Theme-specific CSS
    if (branding.theme === 'neon') {
      css += `
        .ticket {
          box-shadow: 0 0 20px ${branding.primaryColor}88, inset 0 0 20px ${branding.primaryColor}22;
        }
        .header {
          text-shadow: 0 0 10px ${branding.primaryColor}, 0 0 20px ${branding.accentColor};
        }
      `;
    }

    if (branding.theme === 'minimal') {
      css += `
        .ticket {
          background: #fff;
          border: 1px solid #ddd;
        }
      `;
    }

    if (branding.customCSS) {
      css += branding.customCSS;
    }

    return css;
  }

  /**
   * Inject branding CSS into ticket HTML
   */
  private static injectBrandingCSS(
    ticketHtml: string,
    css: string,
    branding: VenueBranding
  ): string {
    const brandingStyle = `
      <style>
        ${css}
      </style>
    `;

    // Insert branding style before closing head tag
    const headClosing = ticketHtml.indexOf('</head>');
    if (headClosing !== -1) {
      return (
        ticketHtml.substring(0, headClosing) +
        brandingStyle +
        ticketHtml.substring(headClosing)
      );
    }

    // Fallback: insert at beginning of body
    return brandingStyle + ticketHtml;
  }

  /**
   * Get branded ticket preview
   */
  static async getPreview(ticketId: string): Promise<BrandedTicket | null> {
    return BRANDED_TICKETS.get(ticketId) || null;
  }

  /**
   * Apply theme template
   */
  static async applyTheme(venueId: string, theme: 'modern' | 'classic' | 'neon' | 'minimal'): Promise<VenueBranding> {
    const themeDefaults: Record<string, Partial<VenueBranding>> = {
      modern: {
        primaryColor: '#0066CC',
        secondaryColor: '#FFFFFF',
        accentColor: '#FF9900',
        fontFamily: "'Segoe UI', sans-serif",
      },
      classic: {
        primaryColor: '#333333',
        secondaryColor: '#EEEEEE',
        accentColor: '#D4AF37',
        fontFamily: "'Georgia', serif",
      },
      neon: {
        primaryColor: '#FF00FF',
        secondaryColor: '#00FFFF',
        accentColor: '#FFFF00',
        fontFamily: "'Arial Black', sans-serif",
      },
      minimal: {
        primaryColor: '#000000',
        secondaryColor: '#FFFFFF',
        accentColor: '#888888',
        fontFamily: "'Helvetica', sans-serif",
      },
    };

    const defaults = themeDefaults[theme] || themeDefaults.modern;

    return this.updateBranding(venueId, {
      theme,
      ...defaults,
    });
  }

  /**
   * Get all brandings (admin)
   */
  static async getAllBrandings(): Promise<VenueBranding[]> {
    return Array.from(VENUE_BRANDS.values());
  }

  /**
   * Delete custom branding (revert to default)
   */
  static async revertToDefault(venueId: string): Promise<void> {
    VENUE_BRANDS.delete(venueId);
  }
}

export default TicketBrandingEngine;
