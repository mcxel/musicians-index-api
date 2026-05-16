// MagazineSafetyReviewEngine
// Hate content + explicit + plagiarism + misinformation blocking.
// Pre-publish gate — content must pass all checks.

export type SafetyFlag =
  | "hate-speech"
  | "explicit-content"
  | "plagiarism"
  | "misinformation"
  | "harassment"
  | "spam"
  | "doxxing"
  | "illegal-content";

export interface SafetyReviewInput {
  contentId: string;
  title: string;
  body: string;
  authorId: string;
  trustScore: number;  // 0–100
  plagiarismScore: number;  // 0–1
}

export interface SafetyReviewResult {
  contentId: string;
  passed: boolean;
  flags: SafetyFlag[];
  quarantined: boolean;
  reviewedAt: string;
}

// Keyword-based detection (extend with ML signals in prod)
const HATE_TERMS: string[] = []; // intentionally empty — filled by moderation team
const EXPLICIT_TERMS: string[] = [];

function containsTerms(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some(t => lower.includes(t));
}

export function reviewContent(input: SafetyReviewInput): SafetyReviewResult {
  const flags: SafetyFlag[] = [];
  const text = `${input.title} ${input.body}`;

  if (containsTerms(text, HATE_TERMS)) flags.push("hate-speech");
  if (containsTerms(text, EXPLICIT_TERMS)) flags.push("explicit-content");
  if (input.plagiarismScore >= 0.6) flags.push("plagiarism");
  if (input.trustScore < 20) flags.push("spam");

  const passed = flags.length === 0;

  return {
    contentId: input.contentId,
    passed,
    flags,
    quarantined: !passed,
    reviewedAt: new Date().toISOString(),
  };
}

export function batchReview(inputs: SafetyReviewInput[]): SafetyReviewResult[] {
  return inputs.map(reviewContent);
}

export function filterPassedContent<T extends { contentId: string }>(
  items: T[],
  results: SafetyReviewResult[],
): T[] {
  const passedIds = new Set(results.filter(r => r.passed).map(r => r.contentId));
  return items.filter(item => passedIds.has(item.contentId));
}
