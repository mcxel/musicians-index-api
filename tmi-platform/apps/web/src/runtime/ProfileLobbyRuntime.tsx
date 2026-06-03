'use client';

import BaseProfileLobbyRuntime, {
  type ProfileRole,
} from '@/components/profile/ProfileLobbyRuntime';
import type { ProfileLobbyRuntimeContract } from './contracts';
import { fanAdapter, performerAdapter, venueAdapter } from './adapters';

export type CanonicalRuntimeProps = {
  role: 'performer' | 'fan' | 'venue';
  displayName: string;
  userId?: string;
  bio?: string;
  isLive?: boolean;
  videoSrc?: string;
};

export function buildRuntimeContract(props: CanonicalRuntimeProps): ProfileLobbyRuntimeContract {
  if (props.role === 'performer') {
    return performerAdapter(props);
  }
  if (props.role === 'fan') {
    return fanAdapter(props);
  }
  return venueAdapter(props);
}

export default function ProfileLobbyRuntime(props: CanonicalRuntimeProps) {
  const contract = buildRuntimeContract(props);

  // Phase 1 bridge:
  // Reuse existing shell with adapter contract resolved here.
  // No route breakage, no destructive merge.
  return (
    <BaseProfileLobbyRuntime
      role={contract.role as ProfileRole}
      displayName={contract.displayName}
      userId={contract.userId}
      bio={contract.bio}
      isLive={contract.isLive}
      videoSrc={contract.videoSrc}
    />
  );
}
