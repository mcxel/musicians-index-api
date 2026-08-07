/**
 * EmergencyDisclosureProtocol — separate, accelerated workflow.
 * Still requires human/counsel approval before delivery. Never auto-releases records.
 */

import type { LegalCaseRecord } from "./types";

export type EmergencyProtocolResult = {
  entered: boolean;
  caseId: string;
  message: string;
  stillRequiresHumanApproval: true;
  stillRequiresAuthorityVerified: true;
};

/**
 * Mark a case as emergency-tracked. Does NOT skip HumanApprovalGate or authority VERIFIED.
 */
export function enterEmergencyDisclosureProtocol(
  caseRecord: LegalCaseRecord,
  reason: string,
): EmergencyProtocolResult {
  return {
    entered: true,
    caseId: caseRecord.caseId,
    message:
      `Emergency protocol noted for ${caseRecord.caseId}: ${reason}. ` +
      "Workflow is accelerated for review priority only. " +
      "Human/counsel approval and VERIFIED authority remain mandatory before delivery. " +
      "This is Defensible Compliance & Accountability — not an open-access channel.",
    stillRequiresHumanApproval: true,
    stillRequiresAuthorityVerified: true,
  };
}
