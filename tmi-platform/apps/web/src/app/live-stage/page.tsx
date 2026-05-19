'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import LiveStageVideoOverlay from '@/components/stage/LiveStageVideoOverlay';
import { useFamilyConsensus } from '@/hooks/useFamilyConsensus';
import { useOverseerDeck } from '@/hooks/useOverseerDeck';
import { useWebRtcSignaling } from '@/hooks/useWebRtcSignaling';
import { useGamificationEngine } from '@/hooks/useGamificationEngine';
import type { AccountTier, FamilyGroup } from '@/types/security';

const ACCOUNT_TIER_BY_ROLE: Record<'FAN' | 'PERFORMER' | 'ADMIN', AccountTier> = {
  FAN: 'YOUTH_16',
  PERFORMER: 'ADULT',
  ADMIN: 'ADULT',
};

const DEMO_FAMILY: FamilyGroup = {
  id: 'family_demo_001',
  familyName: 'Demo Family',
  approvalThreshold: 2,
  members: [
    { id: 'adult_custodian_1', userName: 'Custodian A', tier: 'ADULT', isVerifiedCustodian: true },
    { id: 'adult_custodian_2', userName: 'Custodian B', tier: 'ADULT', isVerifiedCustodian: true },
    { id: 'adult_guest_1', userName: 'Unverified Adult', tier: 'ADULT', isVerifiedCustodian: false },
    { id: 'youth_1', userName: 'Youth Member', tier: 'YOUTH_16', isVerifiedCustodian: false },
  ],
};

export default function LiveStagePage() {
  const { trackAction } = useGamificationEngine();
  const { currentRole } = useOverseerDeck();

  useEffect(() => {
    trackAction('JOIN_STAGE');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const accountTier = ACCOUNT_TIER_BY_ROLE[currentRole];

  const [streamState, setStreamState] = useState<'VIDEO' | 'AVATAR_ONLY'>('VIDEO');
  const [selectedPeer, setSelectedPeer] = useState<'ADULT' | 'YOUTH_16'>('ADULT');

  const {
    activeRequest,
    allowConnection,
    createRequest,
    approveRequest,
    declineRequest,
    resetRequest,
    approvedVotes,
    hasDeclinedVote,
  } = useFamilyConsensus(DEMO_FAMILY);

  const { localStream, remoteStream, signalingState } = useWebRtcSignaling(allowConnection);

  // Attach local stream to the PiP preview video element
  const localVideoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = localVideoRef.current;
    if (!el) return;
    el.srcObject = localStream;
  }, [localStream]);

  const verifiedFamily = useMemo(() => allowConnection, [allowConnection]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #070010, #0d081b)',
        color: '#fff',
        padding: 20,
        display: 'grid',
        gap: 14,
      }}
    >
      <header style={{ display: 'grid', gap: 6 }}>
        <div style={{ fontSize: 10, letterSpacing: '0.2em', color: '#00ffff', fontWeight: 800 }}>
          LIVE STAGE ROUTE
        </div>
        <h1 style={{ margin: 0, fontSize: 'clamp(1.25rem, 2.5vw, 1.9rem)' }}>
          Gated Video Overlay Sandbox
        </h1>
      </header>

      <section
        style={{
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 10,
          background: 'rgba(0,0,0,0.26)',
          padding: 12,
          display: 'grid',
          gap: 8,
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: '0.14em', color: '#ffd700', fontWeight: 800 }}>
          CONTROL PANEL
        </div>

        <div style={{ fontSize: 11 }}>Current role: <strong>{currentRole}</strong> ({accountTier})</div>
        <div style={{ fontSize: 11 }}>Peer tier: <strong>{selectedPeer}</strong></div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" onClick={() => setSelectedPeer('ADULT')}>Peer Adult</button>
          <button type="button" onClick={() => setSelectedPeer('YOUTH_16')}>Peer Youth</button>
          <button type="button" onClick={() => setStreamState('VIDEO')}>VIDEO</button>
          <button type="button" onClick={() => setStreamState('AVATAR_ONLY')}>AVATAR_ONLY</button>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => createRequest('adult_custodian_1', 'Custodian A', 'youth_1')}
          >
            Create Request
          </button>
          <button
            type="button"
            disabled={!activeRequest}
            onClick={() => activeRequest && approveRequest(activeRequest.requestId, 'adult_custodian_1')}
          >
            Approve A
          </button>
          <button
            type="button"
            disabled={!activeRequest}
            onClick={() => activeRequest && approveRequest(activeRequest.requestId, 'adult_custodian_2')}
          >
            Approve B
          </button>
          <button
            type="button"
            disabled={!activeRequest}
            onClick={() => activeRequest && declineRequest(activeRequest.requestId, 'adult_custodian_2')}
          >
            Decline
          </button>
          <button type="button" onClick={resetRequest}>Reset</button>
        </div>

        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
          status: <strong>{activeRequest?.status ?? 'NONE'}</strong> | approvals: <strong>{approvedVotes}</strong> | declined: <strong>{String(hasDeclinedVote)}</strong>
        </div>
      </section>

      {/* Signaling state badge */}
      <div
        style={{
          fontSize: 10,
          letterSpacing: '0.15em',
          fontFamily: 'monospace',
          color:
            signalingState === 'CONNECTED'  ? '#00FF88' :
            signalingState === 'CONNECTING' ? '#FFD700' :
            signalingState === 'DESTROYED'  ? 'rgba(220,0,60,0.9)' :
                                              'rgba(255,255,255,0.3)',
        }}
      >
        RTC: {signalingState}
      </div>

      {/* Stage viewport — local PiP overlaid bottom-right when stream is live */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 640 }}>
        <LiveStageVideoOverlay
          allowConnection={verifiedFamily}
          userTier={accountTier}
          peerTier={selectedPeer}
          streamState={streamState}
          stream={remoteStream}
          hasDeclinedVote={hasDeclinedVote}
        />
        {localStream && (
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              width: 96,
              height: 72,
              borderRadius: 4,
              overflow: 'hidden',
              border: '1px solid rgba(0,255,255,0.4)',
              zIndex: 20,
            }}
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              aria-label="Local camera preview"
            />
          </div>
        )}
      </div>
    </main>
  );
}
