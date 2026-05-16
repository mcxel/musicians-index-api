// ARTICLE SOURCE VALIDATION ENGINE — Anti-Fraud Article Authority
// Purpose: Verify article source, author trust, and content validity
// Prevents fake articles from entering the read-to-earn economy

import { randomUUID } from 'crypto';

export type AuthorTrustLevel = 'verified' | 'pending' | 'flagged' | 'banned';
export type SourceType = 'staff' | 'contributor' | 'guest' | 'community';

export interface AuthorCredential {
  id: string;
  authorId: string;
  name: string;
  email: string;
  trustLevel: AuthorTrustLevel;
  articlesPublished: number;
  reportsReceived: number;
  banReason?: string;
  joinedAt: string;
  verifiedAt?: string;
}

export interface ArticleValidation {
  articleSlug: string;
  authorId: string;
  sourceType: SourceType;
  isValid: boolean;
  validationScore: number; // 0-100
  flags: string[];
  verifiedAt: string;
}

// Author credential registry
const AUTHOR_REGISTRY = new Map<string, AuthorCredential>();

// Article validation log
const VALIDATION_LOG = new Map<string, ArticleValidation>();

// Trust score requirements
const TRUST_THRESHOLDS = {
  minValidationScore: 70,
  minAuthorArticles: 0, // staff can start with 0
  maxReportsBeforeBan: 5,
};

// Initialize seed authors
function initializeAuthors() {
  const authors: AuthorCredential[] = [
    {
      id: 'writer-001',
      authorId: 'writer-001',
      name: 'Jay Documentation',
      email: 'jay@tmi.magazine',
      trustLevel: 'verified',
      articlesPublished: 47,
      reportsReceived: 0,
      joinedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      verifiedAt: new Date(Date.now() - 360 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'writer-002',
      authorId: 'writer-002',
      name: 'Beat Scientist',
      email: 'science@tmi.magazine',
      trustLevel: 'verified',
      articlesPublished: 23,
      reportsReceived: 0,
      joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      verifiedAt: new Date(Date.now() - 170 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  authors.forEach((author) => {
    AUTHOR_REGISTRY.set(author.authorId, author);
  });
}

initializeAuthors();

export class ArticleSourceValidationEngine {
  /**
   * Validate article source before reward issuance
   * Returns validation result with flags if any
   */
  static async validateArticleSource(articleSlug: string, authorId: string): Promise<ArticleValidation> {
    // Check if already validated recently
    const cached = VALIDATION_LOG.get(articleSlug);
    if (cached && new Date().getTime() - new Date(cached.verifiedAt).getTime() < 60 * 60 * 1000) {
      return cached; // Cache for 1 hour
    }

    const author = AUTHOR_REGISTRY.get(authorId);
    if (!author) {
      return this.createValidation(articleSlug, authorId, 'staff', false, 0, [
        'AUTHOR_NOT_FOUND',
      ]);
    }

    const flags: string[] = [];
    let score = 100;

    // Check author trust level
    if (author.trustLevel === 'banned') {
      return this.createValidation(articleSlug, authorId, 'staff', false, 0, [
        `AUTHOR_BANNED: ${author.banReason}`,
      ]);
    }

    if (author.trustLevel === 'flagged') {
      flags.push('AUTHOR_FLAGGED');
      score -= 25;
    }

    if (author.trustLevel === 'pending') {
      flags.push('AUTHOR_PENDING_VERIFICATION');
      score -= 15;
    }

    // Check report history
    if (author.reportsReceived > 0) {
      flags.push(`AUTHOR_HAS_${author.reportsReceived}_REPORTS`);
      score -= author.reportsReceived * 5;
    }

    // Check ban threshold
    if (author.reportsReceived >= TRUST_THRESHOLDS.maxReportsBeforeBan) {
      flags.push('AUTHOR_BAN_THRESHOLD_EXCEEDED');
      return this.createValidation(articleSlug, authorId, 'staff', false, 0, flags);
    }

    // Check minimum articles for trust
    if (author.articlesPublished < TRUST_THRESHOLDS.minAuthorArticles) {
      flags.push('AUTHOR_INSUFFICIENT_HISTORY');
      score -= 20;
    }

    // Determine source type
    let sourceType: SourceType = 'community';
    if (author.trustLevel === 'verified') sourceType = 'staff';
    else if (author.trustLevel === 'pending') sourceType = 'contributor';

    // Validate score
    const isValid = score >= TRUST_THRESHOLDS.minValidationScore;

    const validation = this.createValidation(articleSlug, authorId, sourceType, isValid, score, flags);

    // Cache validation
    VALIDATION_LOG.set(articleSlug, validation);

    return validation;
  }

  /**
   * Create validation record
   */
  private static createValidation(
    articleSlug: string,
    authorId: string,
    sourceType: SourceType,
    isValid: boolean,
    score: number,
    flags: string[]
  ): ArticleValidation {
    return {
      articleSlug,
      authorId,
      sourceType,
      isValid,
      validationScore: Math.max(0, Math.min(100, score)),
      flags,
      verifiedAt: new Date().toISOString(),
    };
  }

  /**
   * Get author credential
   */
  static async getAuthorCredential(authorId: string): Promise<AuthorCredential | null> {
    return AUTHOR_REGISTRY.get(authorId) || null;
  }

  /**
   * Verify author identity (promote pending → verified)
   */
  static async verifyAuthor(authorId: string): Promise<boolean> {
    const author = AUTHOR_REGISTRY.get(authorId);
    if (author && author.trustLevel === 'pending') {
      author.trustLevel = 'verified';
      author.verifiedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * Flag author for review
   */
  static async flagAuthor(authorId: string, reason?: string): Promise<boolean> {
    const author = AUTHOR_REGISTRY.get(authorId);
    if (author) {
      author.trustLevel = 'flagged';
      return true;
    }
    return false;
  }

  /**
   * Report article/author (fraud, plagiarism, etc.)
   */
  static async reportArticle(articleSlug: string, authorId: string, reason: string): Promise<void> {
    const author = AUTHOR_REGISTRY.get(authorId);
    if (author) {
      author.reportsReceived += 1;

      // Auto-ban if threshold exceeded
      if (author.reportsReceived >= TRUST_THRESHOLDS.maxReportsBeforeBan) {
        author.trustLevel = 'banned';
        author.banReason = `Auto-banned after ${author.reportsReceived} reports: ${reason}`;
      }
    }

    // Clear validation cache for this article
    VALIDATION_LOG.delete(articleSlug);
  }

  /**
   * Add new author to registry
   */
  static async registerAuthor(
    authorId: string,
    name: string,
    email: string,
    sourceType: SourceType
  ): Promise<AuthorCredential> {
    const trustLevel = sourceType === 'staff' ? 'verified' : 'pending';

    const credential: AuthorCredential = {
      id: randomUUID(),
      authorId,
      name,
      email,
      trustLevel,
      articlesPublished: 0,
      reportsReceived: 0,
      joinedAt: new Date().toISOString(),
    };

    AUTHOR_REGISTRY.set(authorId, credential);
    return credential;
  }

  /**
   * Increment article count for author
   */
  static async incrementArticleCount(authorId: string): Promise<void> {
    const author = AUTHOR_REGISTRY.get(authorId);
    if (author) {
      author.articlesPublished += 1;
    }
  }

  /**
   * Get validation score for article
   */
  static async getValidationScore(articleSlug: string): Promise<number> {
    const validation = VALIDATION_LOG.get(articleSlug);
    return validation?.validationScore || 0;
  }

  /**
   * Is article source valid for reward issuance?
   */
  static async isValidForReward(articleSlug: string): Promise<boolean> {
    const validation = VALIDATION_LOG.get(articleSlug);
    return validation?.isValid || false;
  }
}

export default ArticleSourceValidationEngine;
