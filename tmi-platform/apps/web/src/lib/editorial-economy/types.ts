export type ContributorLevel = "new-contributor" | "verified-contributor" | "trusted-editor" | "staff-editor";

export type SubmissionStatus = "draft" | "submitted" | "approved" | "rejected";

export interface ContributorAccount {
  contributorId: string;
  displayName: string;
  level: ContributorLevel;
  verifiedAt?: string;
  trustScore: number;
  payoutCapUsd: number;
}

export interface EditorialSubmission {
  submissionId: string;
  contributorId: string;
  title: string;
  body: string;
  category: "news" | "artist" | "performer" | "sponsor" | "advertiser" | "interview";
  sourceUrls: string[];
  artistSlug?: string;
  sponsorSlug?: string;
  status: SubmissionStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EditorialPerformance {
  submissionId: string;
  verifiedUniqueReaders: number;
  readCompletionRate: number;
  artistProfileConversions: number;
  followsGenerated: number;
  tipsGeneratedUsd: number;
  sponsorRevenueUsd: number;
  suspiciousTrafficRatio: number;
}
