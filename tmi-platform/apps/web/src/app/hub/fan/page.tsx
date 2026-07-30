'use client';
import StageLoader from "@/components/eos/StageLoader";

// A fan's landing surface is their Fan Avatar Lobby itself, not a menu that
// routes elsewhere first (Marcel, 2026-07-29) - mirrors the performer side,
// which already lands on PerformerCommandPanel/dashboard and only sees the
// stage after pressing Go Live. Messages/Inventory/Settings stay reachable
// as their own independent routes; this is no longer the only door to them.
export default function FanHubPage() {
  return (
    <StageLoader experienceId="fan-lobby" roomId="fan-lobby" venueId="fan-lobby" role="fan" />
  );
}
