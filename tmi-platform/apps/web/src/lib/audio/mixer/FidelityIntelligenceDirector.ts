/**
 * FidelityIntelligenceDirector — thin provenance + health coordinator.
 * NEVER claims 4K / 8K / Hi-Fi without evidence. Labels only from real fields.
 */

export type FidelityProvenanceKind = "NATIVE" | "ENHANCED" | "DELIVERED" | "RENDERED";

export interface FidelityProvenanceFields {
  /** Source capture / original asset fidelity signal when known */
  native?: string | null;
  /** Post-process enhancement applied (only if real pipeline ran) */
  enhanced?: string | null;
  /** What the transport actually delivered */
  delivered?: string | null;
  /** What the client rendered / displayed */
  rendered?: string | null;
}

export type FidelityClaimStatus = "EVIDENCED" | "UNKNOWN" | "UNCLAIMED";

export interface FidelitySystemHealth {
  director: "FidelityIntelligenceDirector";
  powerState: "ON" | "OFF" | "DEFAULT_ONLY";
  claims4k: FidelityClaimStatus;
  claims8k: FidelityClaimStatus;
  claimsHiFi: FidelityClaimStatus;
  provenance: FidelityProvenanceFields;
  notes: string;
}

class FidelityIntelligenceDirectorImpl {
  private provenance: FidelityProvenanceFields = {
    native: null,
    enhanced: null,
    delivered: null,
    rendered: null,
  };

  setProvenance(partial: Partial<FidelityProvenanceFields>): FidelityProvenanceFields {
    this.provenance = { ...this.provenance, ...partial };
    return this.getProvenance();
  }

  getProvenance(): FidelityProvenanceFields {
    return { ...this.provenance };
  }

  /**
   * Only EVIDENCED when a non-empty measured/declared field matches the claim.
   * No decorative Hi-Fi / 4K labels from absence of data.
   */
  evaluateClaim(
    kind: "4K" | "8K" | "HI_FI",
    fields: FidelityProvenanceFields = this.provenance,
  ): FidelityClaimStatus {
    const haystack = [fields.native, fields.enhanced, fields.delivered, fields.rendered]
      .filter((v): v is string => typeof v === "string" && v.length > 0)
      .join(" ")
      .toUpperCase();

    if (!haystack) return "UNCLAIMED";

    if (kind === "4K") {
      return /\b(2160|4K|UHD)\b/.test(haystack) ? "EVIDENCED" : "UNKNOWN";
    }
    if (kind === "8K") {
      return /\b(4320|8K)\b/.test(haystack) ? "EVIDENCED" : "UNKNOWN";
    }
    // HI_FI — only if explicit measured audio fidelity, never assumed
    return /\b(HI[-_]?FI|LOSSLESS|48KHZ|96KHZ|24[-_]?BIT)\b/.test(haystack)
      ? "EVIDENCED"
      : "UNKNOWN";
  }

  getHealth(): FidelitySystemHealth {
    const p = this.getProvenance();
    const anyField = Boolean(p.native || p.enhanced || p.delivered || p.rendered);
    return {
      director: "FidelityIntelligenceDirector",
      powerState: anyField ? "ON" : "DEFAULT_ONLY",
      claims4k: this.evaluateClaim("4K", p),
      claims8k: this.evaluateClaim("8K", p),
      claimsHiFi: this.evaluateClaim("HI_FI", p),
      provenance: p,
      notes: anyField
        ? "Provenance fields set — no decorative fidelity badges"
        : "DEFAULT_ONLY — no measured fidelity; do not display 4K/Hi-Fi",
    };
  }

  reset(): void {
    this.provenance = { native: null, enhanced: null, delivered: null, rendered: null };
  }
}

export const FidelityIntelligenceDirector = new FidelityIntelligenceDirectorImpl();
