/**
 * TMI Messaging System — barrel export
 * Import everything from "@/lib/messaging"
 */

export { messageThreadEngine } from "./MessageThreadEngine";
export type {
  ParticipantRole,
  ThreadParticipant,
  MessageType,
  ThreadMessage,
  ThreadKind,
  MessageThread,
} from "./MessageThreadEngine";

export { fanChatEngine } from "./FanChatEngine";
export type { FanChatProfile } from "./FanChatEngine";

export { artistInboxEngine } from "./ArtistInboxEngine";
export type {
  ArtistDmPolicy,
  ArtistInboxConfig,
  MessageRequest,
} from "./ArtistInboxEngine";

export { sponsorInboxEngine } from "./SponsorInboxEngine";
export type { DealStatus, DealProposal } from "./SponsorInboxEngine";

export { roomChatEngine } from "./RoomChatEngine";
export type {
  RoomChatRole,
  RoomChatMessageType,
  RoomChatMessage,
  RoomChatState,
} from "./RoomChatEngine";

export {
  evaluateAgeVerification,
  ageVerificationStatusFromAgeYears,
  type AgeVerificationStatus,
} from "./AgeVerification";
export {
  getMessagingEligibility,
  needsAgeOrPolicyGate,
  type MessagingEligibilityState,
} from "./MessagingEligibility";
export {
  startConversation,
  startConversationHttpStatus,
  type StartConversationResult,
  START_CONVERSATION_ERROR_CODES,
} from "./startConversation";
export {
  REQUIRED_MESSAGING_POLICIES,
  CURRENT_POLICY_VERSION,
} from "./policyCatalog";
