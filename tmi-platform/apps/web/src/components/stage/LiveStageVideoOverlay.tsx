'use client';

import { useMemo, useState } from 'react';
import AvatarMiniPreview from '@/components/avatar/AvatarMiniPreview';
import SecurityShieldMask from '@/components/stage/SecurityShieldMask';
import VideoChatWidget from '@/components/stage/VideoChatWidget';
import type { AccountTier } from '@/types/security';

interface LiveStageVideoOverlayProps {
  allowConnection: boolean;
  userTier: AccountTier;
  peerTier: AccountTier;
  streamState: 'VIDEO' | 'AVATAR_ONLY';
  /** Remote MediaStream from useWebRtcSignaling. Passed through to VideoChatWidget. */
  stream?: MediaStream | null;
  hasDeclinedVote?: boolean;
}

export default function LiveStageVideoOverlay({
  allowConnection,
  userTier,
  peerTier,
  streamState,
  stream,
  hasDeclinedVote = false,
}: LiveStageVideoOverlayProps) {
  const [isStreamLive, setIsStreamLive] = useState(false);

  const shouldBlock = !allowConnection;
  const showAvatarFallback = allowConnection && streamState === 'AVATAR_ONLY';

  const { blockTitle, blockReason } = useMemo(() => {
    if (!allowConnection) {
      if (hasDeclinedVote) {
        return { blockTitle: 'ACCESS DENIED', blockReason: 'ACCESS DENIED BY CUSTODIAN' };
      }
      if (userTier === 'YOUTH_16' && peerTier === 'ADULT') {
        return { blockTitle: 'SECURITY ISOLATION ACTIVE', blockReason: 'RESTRICTED BY ACCOUNT TIER' };
      }
      return { blockTitle: 'SECURITY ISOLATION ACTIVE', blockReason: 'CUSTODIAN CONSENSUS PENDING' };
    }
    return { blockTitle: '', blockReason: '' };
  }, [allowConnection, hasDeclinedVote, peerTier, userTier]);

  return (
    <section
      style={{
        position: 'relative',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 12,
        background: 'rgba(0,0,0,0.28)',
        padding: 14,
        display: 'grid',
        gap: 10,
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: '0.16em', color: '#ff2daa', fontWeight: 800 }}>
        LIVE STAGE OVERLAY
      </div>

      <div style={{ display: 'grid', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.82)' }}>
        <div>allowConnection: <strong>{String(allowConnection)}</strong></div>
        <div>streamState: <strong>{streamState}</strong></div>
        <div>userTier: <strong>{userTier}</strong> | peerTier: <strong>{peerTier}</strong></div>
      </div>

      {!shouldBlock && streamState === 'VIDEO' && (
        <VideoChatWidget active={true} onStreamStateChange={setIsStreamLive} stream={stream} />
      )}

      {showAvatarFallback && (
        <section
          style={{
            border: '1px solid rgba(0,255,255,0.25)',
            borderRadius: 10,
            background: 'rgba(0,255,255,0.05)',
            padding: 12,
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: '0.12em', color: '#00ffff', fontWeight: 800, marginBottom: 8 }}>
            AVATAR-ONLY MODE
          </div>
          <AvatarMiniPreview variant="seat" accentColor="#00FFFF" />
          <div style={{ marginTop: 8, fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
            Camera stream intentionally not mounted in AVATAR_ONLY mode.
          </div>
        </section>
      )}

      {!shouldBlock && streamState === 'VIDEO' && (
        <div style={{ fontSize: 10, color: isStreamLive ? '#00ff88' : 'rgba(255,255,255,0.65)' }}>
          Stream telemetry: {isStreamLive ? 'LIVE FEED ACTIVE' : 'WAITING FOR CAMERA PERMISSION'}
        </div>
      )}

      {shouldBlock && (
        <SecurityShieldMask title={blockTitle} reason={blockReason} />
      )}
    </section>
  );
}
