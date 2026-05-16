import { activatePerformerMonitor, createNeutralMonitorState, type TmiNeutralMonitorState } from "@/lib/video/tmiNeutralMonitorState";
import { setPerformerAudiencePerspective } from "@/lib/video/tmiPerformerAudiencePerspectiveEngine";

export type TmiLivePerformerFeedPacket = {
  performerId: string;
  roomId: string;
  streamUrl?: string;
  isLive: boolean;
  audienceCount: number;
  reactionIntensity: number;
};

const FEED = new Map<string, TmiLivePerformerFeedPacket>();

function key(performerId: string, roomId: string): string {
  return `${performerId}::${roomId}`;
}

export function pushPerformerFeed(packet: TmiLivePerformerFeedPacket): void {
  FEED.set(key(packet.performerId, packet.roomId), packet);

  setPerformerAudiencePerspective(packet.performerId, packet.roomId, {
    audienceVisible: packet.isLive,
    activeFanCount: packet.audienceCount,
    reactionIntensity: packet.reactionIntensity,
  });
}

export function readPerformerFeed(performerId: string, roomId: string): TmiLivePerformerFeedPacket | undefined {
  return FEED.get(key(performerId, roomId));
}

export function readMonitorState(performerId: string, roomId: string): TmiNeutralMonitorState {
  const packet = readPerformerFeed(performerId, roomId);
  if (!packet || !packet.isLive) {
    return createNeutralMonitorState("Performer is not live");
  }
  return activatePerformerMonitor("Performer live feed active");
}
