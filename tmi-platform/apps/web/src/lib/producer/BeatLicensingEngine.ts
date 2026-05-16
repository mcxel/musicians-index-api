// BEAT LICENSING ENGINE — License Type Management & Restrictions
// Purpose: Enforce licensing terms (exclusive, non-exclusive, lease)
// Tracks usage rights and expiration

import { randomUUID } from 'crypto';

export type LicenseType = 'exclusive' | 'non-exclusive' | 'lease' | 'royalty-free';
export type UsageRights = 'personal' | 'commercial' | 'distribution' | 'streaming' | 'sync';

export interface BeatLicense {
  id: string;
  beatId: string;
  buyerId: string;
  licenseType: LicenseType;
  usageRights: UsageRights[];
  purchasedAt: string;
  expiresAt?: string;
  isActive: boolean;
  termsAccepted: boolean;
  downloadedAt?: string;
  downloadCount: number;
}

export interface LicenseTerms {
  licenseType: LicenseType;
  description: string;
  usageRights: UsageRights[];
  priceUSD: number;
  renewalCost?: number;
  exclusivityPeriodDays?: number;
  maxDownloads?: number;
  allowModification: boolean;
  allowResale: boolean;
}

// License registry (licenseId → license)
const LICENSES = new Map<string, BeatLicense>();

// User licenses by beat (userId:beatId → license)
const USER_BEAT_LICENSES = new Map<string, BeatLicense>();

// License terms templates
const LICENSE_TEMPLATES: Record<LicenseType, LicenseTerms> = {
  exclusive: {
    licenseType: 'exclusive',
    description: 'Exclusive ownership of the beat for a period',
    usageRights: ['personal', 'commercial', 'distribution', 'streaming', 'sync'],
    priceUSD: 500,
    renewalCost: 250,
    exclusivityPeriodDays: 365,
    maxDownloads: 1,
    allowModification: true,
    allowResale: false,
  },
  'non-exclusive': {
    licenseType: 'non-exclusive',
    description: 'Non-exclusive license for commercial use',
    usageRights: ['commercial', 'distribution', 'streaming'],
    priceUSD: 49,
    maxDownloads: undefined,
    allowModification: false,
    allowResale: false,
  },
  lease: {
    licenseType: 'lease',
    description: 'Temporary lease with usage restrictions',
    usageRights: ['personal', 'commercial'],
    priceUSD: 24,
    exclusivityPeriodDays: 30,
    maxDownloads: 5,
    allowModification: false,
    allowResale: false,
  },
  'royalty-free': {
    licenseType: 'royalty-free',
    description: 'Royalty-free usage without restrictions',
    usageRights: ['personal', 'commercial', 'distribution', 'streaming', 'sync'],
    priceUSD: 9,
    maxDownloads: undefined,
    allowModification: true,
    allowResale: true,
  },
};

export class BeatLicensingEngine {
  /**
   * Get license terms for type
   */
  static async getLicenseTerms(licenseType: LicenseType): Promise<LicenseTerms> {
    return LICENSE_TEMPLATES[licenseType];
  }

  /**
   * Create license
   */
  static async createLicense(
    beatId: string,
    buyerId: string,
    licenseType: LicenseType
  ): Promise<BeatLicense> {
    const licenseId = randomUUID();
    const terms = await this.getLicenseTerms(licenseType);

    const license: BeatLicense = {
      id: licenseId,
      beatId,
      buyerId,
      licenseType,
      usageRights: terms.usageRights,
      purchasedAt: new Date().toISOString(),
      expiresAt: terms.exclusivityPeriodDays
        ? new Date(Date.now() + terms.exclusivityPeriodDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
      isActive: true,
      termsAccepted: true,
      downloadCount: 0,
    };

    LICENSES.set(licenseId, license);

    // Index by user+beat for quick lookup
    const key = `${buyerId}:${beatId}`;
    USER_BEAT_LICENSES.set(key, license);

    return license;
  }

  /**
   * Check if user has valid license for beat
   */
  static async hasValidLicense(beatId: string, userId: string): Promise<boolean> {
    const key = `${userId}:${beatId}`;
    const license = USER_BEAT_LICENSES.get(key);

    if (!license || !license.isActive) return false;

    // Check expiration
    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      license.isActive = false;
      return false;
    }

    return true;
  }

  /**
   * Check if usage right is allowed
   */
  static async canUseForPurpose(
    beatId: string,
    userId: string,
    purpose: UsageRights
  ): Promise<boolean> {
    const key = `${userId}:${beatId}`;
    const license = USER_BEAT_LICENSES.get(key);

    if (!license) return false;

    return license.usageRights.includes(purpose);
  }

  /**
   * Record download (enforce max downloads limit)
   */
  static async recordDownload(licenseId: string): Promise<boolean> {
    const license = LICENSES.get(licenseId);
    if (!license) return false;

    const terms = await this.getLicenseTerms(license.licenseType);

    // Check download limit
    if (terms.maxDownloads && license.downloadCount >= terms.maxDownloads) {
      return false; // Download limit exceeded
    }

    license.downloadCount += 1;
    if (!license.downloadedAt) {
      license.downloadedAt = new Date().toISOString();
    }

    return true;
  }

  /**
   * Renew expiring license
   */
  static async renewLicense(licenseId: string): Promise<BeatLicense | null> {
    const license = LICENSES.get(licenseId);
    if (!license) return null;

    const terms = await this.getLicenseTerms(license.licenseType);

    if (!terms.exclusivityPeriodDays) {
      return null; // Cannot renew non-expiring license
    }

    // Extend expiration
    license.expiresAt = new Date(
      Date.now() + terms.exclusivityPeriodDays * 24 * 60 * 60 * 1000
    ).toISOString();

    return license;
  }

  /**
   * Revoke license
   */
  static async revokeLicense(licenseId: string, reason?: string): Promise<void> {
    const license = LICENSES.get(licenseId);
    if (license) {
      license.isActive = false;
    }
  }

  /**
   * Get user's licenses
   */
  static async getUserLicenses(userId: string): Promise<BeatLicense[]> {
    return Array.from(LICENSES.values()).filter(
      (l) => l.buyerId === userId && l.isActive
    );
  }

  /**
   * Get beat licenses (admin)
   */
  static async getBeatLicenses(beatId: string): Promise<BeatLicense[]> {
    return Array.from(LICENSES.values()).filter((l) => l.beatId === beatId);
  }

  /**
   * Get license details
   */
  static async getLicense(licenseId: string): Promise<BeatLicense | null> {
    return LICENSES.get(licenseId) || null;
  }

  /**
   * Export license certificate (legal document)
   */
  static async generateCertificate(licenseId: string): Promise<string> {
    const license = LICENSES.get(licenseId);
    if (!license) return '';

    const terms = await this.getLicenseTerms(license.licenseType);

    return `
      LICENSE AGREEMENT
      ================
      
      License ID: ${licenseId}
      Beat ID: ${license.beatId}
      Licensee: ${license.buyerId}
      License Type: ${license.licenseType.toUpperCase()}
      
      TERMS:
      ${terms.description}
      
      USAGE RIGHTS:
      ${terms.usageRights.map((r) => `- ${r.toUpperCase()}`).join('\n')}
      
      Purchased: ${new Date(license.purchasedAt).toLocaleDateString()}
      ${license.expiresAt ? `Expires: ${new Date(license.expiresAt).toLocaleDateString()}` : 'Non-expiring'}
      
      RESTRICTIONS:
      - Modification: ${terms.allowModification ? 'ALLOWED' : 'NOT ALLOWED'}
      - Resale: ${terms.allowResale ? 'ALLOWED' : 'NOT ALLOWED'}
      ${terms.maxDownloads ? `- Max Downloads: ${terms.maxDownloads}` : ''}
      
      This license is non-transferable unless explicitly allowed.
    `;
  }

  /**
   * Get compliance report (admin)
   */
  static async getComplianceReport(): Promise<{
    totalLicenses: number;
    activeLicenses: number;
    expiredLicenses: number;
    violatingUsage: number;
  }> {
    const licenses = Array.from(LICENSES.values());
    const activeLicenses = licenses.filter((l) => l.isActive).length;
    const expiredLicenses = licenses.filter(
      (l) => l.expiresAt && new Date(l.expiresAt) < new Date()
    ).length;

    // Check for license violations (exceeded downloads, etc.)
    let violatingUsage = 0;
    licenses.forEach((license) => {
      const terms = LICENSE_TEMPLATES[license.licenseType];
      if (terms.maxDownloads && license.downloadCount > terms.maxDownloads) {
        violatingUsage += 1;
      }
    });

    return {
      totalLicenses: licenses.length,
      activeLicenses,
      expiredLicenses,
      violatingUsage,
    };
  }
}

export default BeatLicensingEngine;
