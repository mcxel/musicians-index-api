"use client";

/**
 * Challenge Arena — Song Challenge contest stage.
 * Wires SongChallengeVenueRoom (overlays, dual WebRTC, song picker, 3D seats).
 * Anchor room: anchor-song-challenge-lab · capacity from AnchorRoomCapacityMatrix.
 */

import dynamic from "next/dynamic";

const SongChallengeVenueRoom = dynamic(
  () => import("@/components/challenge/SongChallengeVenueRoom"),
  { ssr: false },
);

export default function ChallengeArenaPage() {
  return <SongChallengeVenueRoom roomId="anchor-song-challenge-lab" genre="open_genre" />;
}
