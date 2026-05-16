export type SafetyRule = {
  id: string;
  label: string;
  category: "blocked-word" | "flagged-upload" | "flagged-message";
  enabled: boolean;
};

export const BLOCKED_WORDS: string[] = [
  "scam",
  "fraud",
  "phishing",
  "malware",
  "hateword-placeholder",
];

export const DEFAULT_SAFETY_RULES: SafetyRule[] = [
  { id: "rule-001", label: "Block malicious links", category: "flagged-message", enabled: true },
  { id: "rule-002", label: "Detect suspicious payout text", category: "blocked-word", enabled: true },
  { id: "rule-003", label: "Flag unknown executable uploads", category: "flagged-upload", enabled: true },
];

export function containsBlockedWord(input: string): boolean {
  const lower = input.toLowerCase();
  return BLOCKED_WORDS.some((word) => lower.includes(word));
}
