export interface SourceValidationResult {
  valid: boolean;
  reason?: string;
}

class SourceValidationEngine {
  validate(sourceUrls: string[]): SourceValidationResult {
    if (sourceUrls.length === 0) {
      return { valid: false, reason: "source-required" };
    }

    for (const source of sourceUrls) {
      if (!source.startsWith("http://") && !source.startsWith("https://")) {
        return { valid: false, reason: "invalid-url" };
      }
    }

    return { valid: true };
  }
}

export const sourceValidationEngine = new SourceValidationEngine();
