import type { ProfileRole } from '@/components/profile/ProfileLobbyRuntime';
import type { ProfileLobbyRuntimeContract } from './contracts';

export type RuntimeAdapterInput = {
  role: ProfileRole;
  displayName: string;
  userId?: string;
  bio?: string;
  isLive?: boolean;
  videoSrc?: string;
};

function baseContract(input: RuntimeAdapterInput): ProfileLobbyRuntimeContract {
  return {
    role: input.role as 'performer' | 'fan' | 'venue',
    displayName: input.displayName,
    userId: input.userId,
    bio: input.bio,
    isLive: input.isLive,
    videoSrc: input.videoSrc,
    tripleView: {
      persistentLayoutKey: `triple-view:${input.role}:${input.userId ?? input.displayName}`,
      selfPanel: {
        id: 'self-panel',
        state: 'standard',
        opacity: 1,
        draggable: true,
        avoidZones: ['go-live', 'end-stream', 'challenge', 'battle', 'cypher', 'sponsor-controls', 'broadcast-controls'],
      },
      audiencePanel: {
        id: 'audience-panel',
        state: 'standard',
        opacity: 1,
        draggable: true,
        avoidZones: ['go-live', 'end-stream', 'challenge', 'battle', 'cypher', 'sponsor-controls', 'broadcast-controls'],
      },
      avatarPanel: {
        id: 'avatar-panel',
        state: 'minimized',
        opacity: 1,
        draggable: false,
        avoidZones: ['go-live', 'end-stream', 'challenge', 'battle', 'cypher', 'sponsor-controls', 'broadcast-controls'],
      },
    },
    playlist: {
      protectedEngine: true,
      source: 'existing-playlist-system',
      enabled: true,
    },
    audience: {
      protectedEngine: true,
      source: 'existing-audience-system',
      enabled: true,
    },
    liveStage: {
      enabled: Boolean(input.isLive),
      mode: input.isLive ? 'live' : 'idle',
    },
  };
}

export function performerAdapter(input: Omit<RuntimeAdapterInput, 'role'>): ProfileLobbyRuntimeContract {
  const contract = baseContract({ role: 'performer', ...input });
  contract.tripleView.avatarPanel.state = 'standard';
  return contract;
}

export function fanAdapter(input: Omit<RuntimeAdapterInput, 'role'>): ProfileLobbyRuntimeContract {
  const contract = baseContract({ role: 'fan', ...input });
  contract.tripleView.selfPanel.state = 'minimized';
  contract.tripleView.avatarPanel.state = 'standard';
  return contract;
}

export function venueAdapter(input: Omit<RuntimeAdapterInput, 'role'>): ProfileLobbyRuntimeContract {
  const contract = baseContract({ role: 'venue', ...input });
  contract.tripleView.audiencePanel.state = 'expanded';
  return contract;
}
