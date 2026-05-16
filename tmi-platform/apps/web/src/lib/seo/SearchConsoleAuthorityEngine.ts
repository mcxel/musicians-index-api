// Search Console Authority Engine - Monitor and manage search performance, indexing, and crawl health
export interface IndexingStatus {
  totalIndexed: number;
  lastCrawl: string;
  coverageStatus: 'Valid' | 'Excluded' | 'Error' | 'Pending';
  coverageDetails: {
    valid: number;
    excluded: number;
    errors: number;
    pending: number;
  };
}

export interface CrawlError {
  url: string;
  errorType: 'NotFound' | 'ServerError' | 'Soft404' | 'Redirect' | 'Other';
  firstCrawled: string;
  lastCrawled: string;
  detectedBy: string;
}

export interface SearchPerformance {
  queries: number;
  impressions: number;
  clicks: number;
  averagePosition: number;
  ctr: number;
  period: string;
}

export interface SchemaHealth {
  schemaTypes: Record<string, number>;
  validationErrors: number;
  lastValidation: string;
  errorTypes: string[];
}

export class SearchConsoleAuthorityEngine {
  private static indexingStatus: IndexingStatus = {
    totalIndexed: 0,
    lastCrawl: new Date().toISOString(),
    coverageStatus: 'Valid',
    coverageDetails: {
      valid: 0,
      excluded: 0,
      errors: 0,
      pending: 0,
    },
  };

  private static crawlErrors: CrawlError[] = [];
  private static searchPerformance: SearchPerformance[] = [];
  private static schemaHealth: SchemaHealth = {
    schemaTypes: {},
    validationErrors: 0,
    lastValidation: new Date().toISOString(),
    errorTypes: [],
  };

  static getIndexingStatus(): IndexingStatus {
    return this.indexingStatus;
  }

  static updateIndexingCoverage(valid: number, excluded: number, errors: number, pending: number = 0): void {
    this.indexingStatus.coverageDetails = {
      valid,
      excluded,
      errors,
      pending,
    };
    this.indexingStatus.totalIndexed = valid + excluded;
    this.indexingStatus.lastCrawl = new Date().toISOString();

    if (errors > 0) {
      this.indexingStatus.coverageStatus = 'Error';
    } else if (pending > 0) {
      this.indexingStatus.coverageStatus = 'Pending';
    } else if (excluded > valid * 0.5) {
      this.indexingStatus.coverageStatus = 'Excluded';
    } else {
      this.indexingStatus.coverageStatus = 'Valid';
    }
  }

  static reportCrawlError(error: CrawlError): void {
    const existing = this.crawlErrors.find(e => e.url === error.url);
    if (existing) {
      existing.lastCrawled = error.lastCrawled;
    } else {
      this.crawlErrors.push(error);
    }

    if (this.crawlErrors.length > 100) {
      this.crawlErrors = this.crawlErrors.slice(-100);
    }
  }

  static getCrawlErrors(limit: number = 20): CrawlError[] {
    return this.crawlErrors.slice(-limit);
  }

  static getCrawlErrorStats() {
    const stats = {
      total: this.crawlErrors.length,
      byType: {} as Record<string, number>,
      oldestError: this.crawlErrors[0]?.firstCrawled || null,
      newestError: this.crawlErrors[this.crawlErrors.length - 1]?.lastCrawled || null,
    };

    this.crawlErrors.forEach(error => {
      stats.byType[error.errorType] = (stats.byType[error.errorType] || 0) + 1;
    });

    return stats;
  }

  static recordSearchPerformance(
    queries: number,
    impressions: number,
    clicks: number,
    averagePosition: number,
    period: string = 'last-28-days'
  ): void {
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

    this.searchPerformance.push({
      queries,
      impressions,
      clicks,
      averagePosition,
      ctr,
      period,
    });

    if (this.searchPerformance.length > 12) {
      this.searchPerformance.shift();
    }
  }

  static getSearchPerformanceTrends(): SearchPerformance[] {
    return this.searchPerformance;
  }

  static getCurrentPerformanceSummary(): SearchPerformance | null {
    return this.searchPerformance.length > 0 ? this.searchPerformance[this.searchPerformance.length - 1] : null;
  }

  static registerSchemaType(schemaType: string, count: number = 1): void {
    if (!this.schemaHealth.schemaTypes[schemaType]) {
      this.schemaHealth.schemaTypes[schemaType] = 0;
    }
    this.schemaHealth.schemaTypes[schemaType] += count;
  }

  static reportSchemaError(errorType: string): void {
    this.schemaHealth.validationErrors += 1;

    if (!this.schemaHealth.errorTypes.includes(errorType)) {
      this.schemaHealth.errorTypes.push(errorType);
    }

    this.schemaHealth.lastValidation = new Date().toISOString();
  }

  static getSchemaHealth(): SchemaHealth {
    return this.schemaHealth;
  }

  static getSchemaCoverage(): Record<string, number> {
    return this.schemaHealth.schemaTypes;
  }

  static getCompleteHealthReport() {
    return {
      indexing: this.indexingStatus,
      crawlErrors: {
        total: this.crawlErrors.length,
        stats: this.getCrawlErrorStats(),
        recentErrors: this.getCrawlErrors(5),
      },
      searchPerformance: {
        current: this.getCurrentPerformanceSummary(),
        trend: this.searchPerformance.length,
      },
      schema: this.schemaHealth,
      healthScore: this.calculateHealthScore(),
      timestamp: new Date().toISOString(),
    };
  }

  private static calculateHealthScore(): number {
    let score = 100;

    score -= Math.min(this.crawlErrors.length * 0.5, 20);

    const denom = this.indexingStatus.coverageDetails.valid + this.indexingStatus.coverageDetails.errors;
    const coverageRatio = denom > 0 ? this.indexingStatus.coverageDetails.valid / denom : 1;
    score -= (1 - coverageRatio) * 20;

    score -= Math.min(this.schemaHealth.validationErrors * 0.1, 15);

    const performance = this.getCurrentPerformanceSummary();
    if (performance && performance.ctr < 1) {
      score -= 5;
    }

    return Math.max(0, Math.round(score));
  }

  static getIndexingHealth(): number {
    const total = this.indexingStatus.coverageDetails.valid + this.indexingStatus.coverageDetails.errors;
    if (total === 0) return 100;
    return Math.round((this.indexingStatus.coverageDetails.valid / total) * 100);
  }

  static getSchemaHealthPercentage(): number {
    if (this.schemaHealth.validationErrors === 0) return 100;

    const schemaCount = Object.values(this.schemaHealth.schemaTypes).reduce((a, b) => a + b, 0);
    if (schemaCount === 0) return 100;

    const errorRatio = this.schemaHealth.validationErrors / schemaCount;
    return Math.max(0, Math.round(100 - errorRatio * 100));
  }

  static reset(): void {
    this.indexingStatus = {
      totalIndexed: 0,
      lastCrawl: new Date().toISOString(),
      coverageStatus: 'Valid',
      coverageDetails: { valid: 0, excluded: 0, errors: 0, pending: 0 },
    };

    this.crawlErrors = [];
    this.searchPerformance = [];
    this.schemaHealth = {
      schemaTypes: {},
      validationErrors: 0,
      lastValidation: new Date().toISOString(),
      errorTypes: [],
    };
  }
}

// Initialize with base sample data for dashboards and observability surfaces.
SearchConsoleAuthorityEngine.updateIndexingCoverage(4520, 120, 0, 45);
SearchConsoleAuthorityEngine.recordSearchPerformance(15420, 248400, 12220, 4.2);
SearchConsoleAuthorityEngine.registerSchemaType('MusicGroup', 1200);
SearchConsoleAuthorityEngine.registerSchemaType('Event', 450);
SearchConsoleAuthorityEngine.registerSchemaType('Article', 890);
SearchConsoleAuthorityEngine.registerSchemaType('Venue', 120);
SearchConsoleAuthorityEngine.registerSchemaType('Ticket', 300);
SearchConsoleAuthorityEngine.registerSchemaType('Organization', 1);
