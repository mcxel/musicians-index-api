const BLOCKED_PATTERNS = [
  /\bwhite\s+power\b/i,
  /\bkill\s+all\b/i,
  /\bhate\s+group\b/i,
];

const SPAM_PATTERNS = [/\bfree\s+money\b/i, /\bclick\s+here\b/i];

export interface ContentSafetyResult {
  safe: boolean;
  reason?: string;
}

class ContentSafetyEngine {
  validate(input: { title: string; body: string }): ContentSafetyResult {
    const text = `${input.title}\n${input.body}`;

    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(text)) {
        return { safe: false, reason: "hate-or-violent-content" };
      }
    }

    for (const pattern of SPAM_PATTERNS) {
      if (pattern.test(text)) {
        return { safe: false, reason: "spam-content" };
      }
    }

    if (text.length < 120) {
      return { safe: false, reason: "insufficient-content" };
    }

    return { safe: true };
  }
}

export const contentSafetyEngine = new ContentSafetyEngine();
