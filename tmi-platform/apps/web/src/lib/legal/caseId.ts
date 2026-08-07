/**
 * Legal case ID generator — format LEGAL-YYYY-######
 */

let seq = 0;

export function generateLegalCaseId(now: Date = new Date()): string {
  const year = now.getFullYear();
  seq += 1;
  const n = String(seq).padStart(6, "0");
  return `LEGAL-${year}-${n}`;
}

/** Test/reset helper — not for production reset of real cases. */
export function __resetLegalCaseIdSeq(next = 0): void {
  seq = next;
}
