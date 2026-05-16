// MagazineSourceValidationEngine
// Source credibility + media rights validation before publishing.
// Blocks untrusted/stolen content from reaching the magazine.

export type SourceTrust = "verified" | "trusted" | "unverified" | "flagged" | "blocked";

export interface SourceRecord {
  url: string;
  domain: string;
  trustLevel: SourceTrust;
  mediaRightsCleared: boolean;
  originalAuthorConfirmed: boolean;
  plagiarismScore: number;   // 0 = clean, 1 = full copy
  lastValidatedAt: string;
}

export interface SourceValidationResult {
  passed: boolean;
  trustLevel: SourceTrust;
  reason?: string;
}

// Static domain allow-list (extend at runtime)
const VERIFIED_DOMAINS = new Set([
  "rollingstone.com", "billboard.com", "pitchfork.com", "npr.org",
  "allhiphop.com", "xxlmag.com", "complex.com", "hotnewhiphop.com",
  "thefader.com", "vibe.com", "ok4rlg.com",
]);

const BLOCKED_DOMAINS = new Set([
  "clickbait-news.fake", "plagiarism-scrapers.co",
]);

export function validateSource(record: SourceRecord): SourceValidationResult {
  if (BLOCKED_DOMAINS.has(record.domain)) {
    return { passed: false, trustLevel: "blocked", reason: "Domain is blocked." };
  }

  if (record.plagiarismScore >= 0.7) {
    return { passed: false, trustLevel: "flagged", reason: "High plagiarism score." };
  }

  if (!record.mediaRightsCleared) {
    return { passed: false, trustLevel: "flagged", reason: "Media rights not cleared." };
  }

  if (VERIFIED_DOMAINS.has(record.domain)) {
    return { passed: true, trustLevel: "verified" };
  }

  if (record.originalAuthorConfirmed) {
    return { passed: true, trustLevel: "trusted" };
  }

  return { passed: false, trustLevel: "unverified", reason: "Author confirmation required." };
}

export function addVerifiedDomain(domain: string): void {
  VERIFIED_DOMAINS.add(domain);
}

export function blockDomain(domain: string): void {
  BLOCKED_DOMAINS.add(domain);
  VERIFIED_DOMAINS.delete(domain);
}
