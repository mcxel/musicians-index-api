// HostContestantAudioGate.ts
// Controls host/contestant audio routing in shows.
// Host hears contestant cleanly. Audience does not hear contestant background noise.
// Host can open crowd at key moments.

import type { VoiceRoomState } from "./RoomVoiceEngine";
import type { CrowdMoment } from "./CrowdAudioMixEngine";

export type AudioChannel = "HOST" | "CONTESTANT" | "PERFORMER" | "CROWD" | "AMBIENT";

export interface ChannelGateState {
  channel: AudioChannel;
  active: boolean;
  volume: number; // 0–1
  isolatedFromAudience: boolean; // true = audience can't hear this channel
}

export interface HostAudioGateConfig {
  roomId: string;
  roomState: VoiceRoomState;
  channels: Record<AudioChannel, ChannelGateState>;
  crowdGateOpen: boolean;
  activeCrowdMoment: CrowdMoment;
}

const DEFAULT_VOLUME: Record<AudioChannel, number> = {
  HOST: 1.0,
  CONTESTANT: 1.0,
  PERFORMER: 1.0,
  CROWD: 0.0, // starts muted in live show
  AMBIENT: 0.0, // always 0 — background noise never leaks to audience
};

function buildChannels(
  roomState: VoiceRoomState
): Record<AudioChannel, ChannelGateState> {
  const isLive = roomState === "LIVE_SHOW";

  return {
    HOST: {
      channel: "HOST",
      active: true,
      volume: DEFAULT_VOLUME.HOST,
      isolatedFromAudience: false,
    },
    CONTESTANT: {
      channel: "CONTESTANT",
      active: isLive,
      volume: DEFAULT_VOLUME.CONTESTANT,
      isolatedFromAudience: false, // contestant IS heard by audience
    },
    PERFORMER: {
      channel: "PERFORMER",
      active: true,
      volume: DEFAULT_VOLUME.PERFORMER,
      isolatedFromAudience: false,
    },
    CROWD: {
      channel: "CROWD",
      active: !isLive, // crowd active in non-live states
      volume: isLive ? 0.0 : 0.6,
      isolatedFromAudience: false,
    },
    AMBIENT: {
      channel: "AMBIENT",
      active: false,
      volume: 0.0,
      isolatedFromAudience: true, // background noise is always isolated from audience
    },
  };
}

export class HostContestantAudioGate {
  private configs: Map<string, HostAudioGateConfig> = new Map();

  buildAudioGate(roomId: string, roomState: VoiceRoomState): HostAudioGateConfig {
    const config: HostAudioGateConfig = {
      roomId,
      roomState,
      channels: buildChannels(roomState),
      crowdGateOpen: roomState !== "LIVE_SHOW",
      activeCrowdMoment: "NONE",
    };
    this.configs.set(roomId, config);
    return config;
  }

  getConfig(roomId: string): HostAudioGateConfig | undefined {
    return this.configs.get(roomId);
  }

  updateRoomState(roomId: string, roomState: VoiceRoomState): HostAudioGateConfig {
    return this.buildAudioGate(roomId, roomState);
  }

  /**
   * Open crowd gate at a key moment. Volume pumps up.
   */
  openCrowdGate(roomId: string, moment: CrowdMoment): void {
    const config = this.configs.get(roomId);
    if (!config) return;
    config.crowdGateOpen = true;
    config.activeCrowdMoment = moment;
    config.channels.CROWD.active = true;
    config.channels.CROWD.volume = this.crowdVolumeForMoment(moment);
  }

  /**
   * Close crowd gate — returns crowd to muted state.
   */
  closeCrowdGate(roomId: string): void {
    const config = this.configs.get(roomId);
    if (!config) return;
    config.crowdGateOpen = false;
    config.activeCrowdMoment = "NONE";
    if (config.roomState === "LIVE_SHOW") {
      config.channels.CROWD.active = false;
      config.channels.CROWD.volume = 0.0;
    }
  }

  /**
   * Host hears contestant at full volume (host-side monitoring).
   * This is always true in LIVE_SHOW — contestant audio is primary.
   */
  isContestantAudibleToHost(roomId: string): boolean {
    const config = this.configs.get(roomId);
    if (!config) return false;
    return config.channels.CONTESTANT.active;
  }

  /**
   * Ambient/background noise around contestant is always isolated from audience.
   */
  isAmbientIsolated(roomId: string): boolean {
    return this.configs.get(roomId)?.channels.AMBIENT.isolatedFromAudience ?? true;
  }

  private crowdVolumeForMoment(moment: CrowdMoment): number {
    switch (moment) {
      case "WINNER": return 1.0;
      case "APPLAUSE": return 0.9;
      case "COMEBACK": return 0.85;
      case "BEBO_RETURN": return 0.8;
      case "YAY": return 0.75;
      case "BOO": return 0.7;
      case "BEBO_PULL": return 0.65;
      default: return 0.5;
    }
  }
}
