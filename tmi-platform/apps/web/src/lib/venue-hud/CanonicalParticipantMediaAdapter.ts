/**
 * Compatibility path — canonical adapter lives in `@/lib/personal-media`.
 */

export {
  adaptRoomParticipantToMediaIdentity,
  registerAndAdaptParticipant,
} from "@/lib/personal-media/CanonicalParticipantMediaAdapter";
export type { CanonicalParticipantMediaAdapterInput } from "@/lib/personal-media/CanonicalParticipantMediaAdapter";
