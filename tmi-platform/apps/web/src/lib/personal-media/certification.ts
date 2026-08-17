/**
 * Live lounge media-routing certification.
 *
 * Contract tests MAY pass from automated assertions.
 * Live room / device / WebRTC lounge remains OPEN.
 * MONITORS 0 phone-cert stays separately OPEN.
 * Do not treat this file as a live-lounge PASS.
 */

export const LIVE_LOUNGE_MEDIA_ROUTING_CERT = {
  id: "LIVE_LOUNGE_MEDIA_ROUTING",
  status: "open",
  certified: false,
  contractTestsMayPass: true,
  liveRoomDevice: "open",
  webrtcLiveLounge: "open",
  monitors0PhoneCert: "open",
  note:
    "PersonalMediaRouter is client-local curation only. Passing unit/contract tests does not certify live lounge media routing or MONITORS 0 phone identity.",
} as const;

export type LiveLoungeMediaRoutingCert = typeof LIVE_LOUNGE_MEDIA_ROUTING_CERT;
