"use client";

import LiveRoomMonitorShareStack from "./LiveRoomMonitorShareStack";

interface LiveRoomMonitorShareSectionProps {
  roomId: string;
  isPerformerSession?: boolean;
}

/** Auxiliary dual monitors + local screen share (does not replace venue stage above). */
export default function LiveRoomMonitorShareSection({
  roomId,
  isPerformerSession = false,
}: LiveRoomMonitorShareSectionProps) {
  return (
    <LiveRoomMonitorShareStack
      roomId={roomId}
      roleLabel={isPerformerSession ? "PERFORMER" : "FAN"}
    />
  );
}
