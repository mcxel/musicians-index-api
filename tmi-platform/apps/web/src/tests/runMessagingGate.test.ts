/**
 * Level 1 — Age / policy / eligibility / relationship / error-code mapping.
 */
import {
  ageVerificationStatusFromAgeYears,
  evaluateAgeVerification,
} from "../lib/messaging/AgeVerification";
import {
  isMessagingRelationshipAllowed,
  conversationKindForRoles,
} from "../lib/messaging/MessagingRelationshipRules";
import { REQUIRED_MESSAGING_POLICIES } from "../lib/messaging/policyCatalog";
import { START_CONVERSATION_ERROR_CODES } from "../lib/messaging/startConversation";

export function runMessagingGateTest(): Record<string, boolean> {
  const age15 = evaluateAgeVerification({ ageYears: 15 });
  const age16 = evaluateAgeVerification({ ageYears: 16 });
  const age18 = evaluateAgeVerification({ ageYears: 18 });
  const age21 = evaluateAgeVerification({ ageYears: 21 });
  const unknown = evaluateAgeVerification({});

  return {
    underage_rejected: age15.status === "REJECTED_UNDERAGE" && age15.rejected,
    verified_16_17: age16.status === "VERIFIED_16_17" && age16.eligibleForMessagingAge,
    verified_18_20: age18.status === "VERIFIED_18_20",
    verified_21_plus: age21.status === "VERIFIED_21_PLUS",
    unverified_null: unknown.status === "UNVERIFIED" && !unknown.eligibleForMessagingAge,
    status_from_years_17: ageVerificationStatusFromAgeYears(17) === "VERIFIED_16_17",
    fan_performer_allowed: isMessagingRelationshipAllowed("FAN", "PERFORMER").allowed,
    venue_performer_allowed: isMessagingRelationshipAllowed("VENUE", "PERFORMER").allowed,
    promoter_performer_allowed: isMessagingRelationshipAllowed("PROMOTER", "ARTIST").allowed,
    advertiser_fan_denied: !isMessagingRelationshipAllowed("ADVERTISER", "FAN").allowed,
    kind_fan_artist: conversationKindForRoles("FAN", "PERFORMER") === "fan-artist",
    policies_five_required: REQUIRED_MESSAGING_POLICIES.filter((p) => p.required).length === 5,
    error_codes_include_age: START_CONVERSATION_ERROR_CODES.includes("AGE_VERIFICATION_REQUIRED"),
    error_codes_include_policy: START_CONVERSATION_ERROR_CODES.includes("POLICY_ACCEPTANCE_REQUIRED"),
    error_codes_include_blocked: START_CONVERSATION_ERROR_CODES.includes("BLOCKED"),
  };
}
