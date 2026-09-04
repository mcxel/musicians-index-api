/**
 * RightsContracts.ts — LiveRights/1.0 — fail-closed source + derived output rights
 */

import type { SourceRightsPolicy, SourcePrivacyPolicy } from "./MediaSourceContracts";
import { FABRIC_CONTRACT_VERSIONS } from "./ContractVersions";

export type RightsDecision = "ALLOW" | "DENY";

export interface RightsEvaluationContext {
  action:
    | "PUBLISH"
    | "RECORD_PROGRAM"
    | "RECORD_ISO"
    | "CAST"
    | "REPLAY"
    | "COMMERCIAL"
    | "EXTERNAL_DISTRIBUTE";
  territory?: string;
  nowMs?: number;
}

export interface RightsEvaluationResult {
  decision: RightsDecision;
  reason: string;
  contractVersion: string;
  failClosed: boolean;
}

export interface DerivedOutputRights {
  outputId: string;
  /** Intersection of all contributing source rights — never more permissive. */
  effective: SourceRightsPolicy;
  contributingSourceIds: string[];
  privacy: SourcePrivacyPolicy;
  publishEligible: boolean;
}

export const LIVE_RIGHTS_CONTRACT_VERSION = FABRIC_CONTRACT_VERSIONS.LIVE_RIGHTS;
