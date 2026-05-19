'use client';

import type { AccountTier } from '@/types/security';
import AvatarMiniPreview from '@/components/avatar/AvatarMiniPreview';
import SecurityShieldMask from './SecurityShieldMask';
import VideoChatWidget from './VideoChatWidget';

export type StreamState = 'VIDEO' | 'AVATAR_ONLY';

interface LiveStageVideoOverlayProps {
  allowConnection: boolean;
  userTier: AccountTier;
  peerTier: AccountTier;
  peerId: string;
  peerName?: string;
  streamState: StreamState;
  stream?: MediaStream | null;
  accentColor?: string;
}

export default function LiveStageVideoOverlay({
  allowConnection,
  peerName = 'Remote',
  streamState,
  stream = null,
  accentColor = '#00FFFF',
}: LiveStageVideoOverlayProps) {
  // Primary enforcement gate — if not allowed, video element MUST NOT exist in DOM
  if (!allowConnection) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <SecurityShieldMask />
      </div>
    );
  }

  // Approved + avatar-only: render avatar, no camera element
  if (streamState === 'AVATAR_ONLY') {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#060410',
          border: `1px solid ${accentColor}33`,
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AvatarMiniPreview variant="seat" accentColor={accentColor} />
      </div>
    );
  }

  // Approved + VIDEO: render widget (video element enters DOM here, nowhere else)
  return (
    <VideoChatWidget
      stream={stream}
      peerName={peerName}
      accentColor={accentColor}
    />
  );
}
