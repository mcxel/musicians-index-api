'use client';

import { useState } from 'react';
import { useFamilyConsensus } from '@/hooks/useFamilyConsensus';
import LiveStageVideoOverlay, { type StreamState } from '@/components/stage/LiveStageVideoOverlay';
import type { FamilyGroup } from '@/types/security';

const DEMO_FAMILY: FamilyGroup = {
  id: 'family-stage-demo',
  familyName: 'Stage Demo Family',
  members: [
    { id: 'parent_mom', userName: 'Parent (Mom)', tier: 'ADULT',    isVerifiedCustodian: true },
    { id: 'parent_dad', userName: 'Parent (Dad)', tier: 'ADULT',    isVerifiedCustodian: true },
    { id: 'guardian_3', userName: 'Guardian',     tier: 'ADULT',    isVerifiedCustodian: true },
    { id: 'youth_01',   userName: 'Youth (16)',   tier: 'YOUTH_16', isVerifiedCustodian: false },
  ],
  approvalThreshold: 2,
};

const DEMO_ADULT_ID = 'STAGE_ADULT_01';
const DEMO_YOUTH_ID = 'youth_01';

const BTN: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 4,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.05)',
  color: '#fff',
  fontFamily: 'monospace',
  fontSize: 11,
  letterSpacing: '0.08em',
  cursor: 'pointer',
  textTransform: 'uppercase' as const,
};

export default function LiveStagePage() {
  const {
    activeRequest,
    allowConnection,
    approvedVotes,
    hasDeclinedVote,
    trustLinks,
    createRequest,
    approveRequest,
    declineRequest,
    resetRequest,
  } = useFamilyConsensus(DEMO_FAMILY);

  const [streamState, setStreamState] = useState<StreamState>('VIDEO');
  const custodians = DEMO_FAMILY.members.filter((m) => m.isVerifiedCustodian);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#060410',
        color: '#fff',
        fontFamily: 'monospace',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 24px',
        gap: 32,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#00FFFF', textTransform: 'uppercase', marginBottom: 4 }}>
          TMI LIVE STAGE
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.05em' }}>Video Overlay Enforcement</div>
      </div>

      {/* Stage viewport */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 520,
          height: 320,
          borderRadius: 6,
          overflow: 'hidden',
          border: '1px solid rgba(0,255,255,0.15)',
        }}
      >
        <LiveStageVideoOverlay
          allowConnection={allowConnection}
          userTier="YOUTH_16"
          peerTier="ADULT"
          peerId={DEMO_ADULT_ID}
          peerName="Stage Host"
          streamState={streamState}
          stream={null}
          accentColor="#00FFFF"
        />
      </div>

      {/* Status strip */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        <span style={{ color: allowConnection ? '#00FFFF' : 'rgba(220,0,60,0.9)' }}>
          {allowConnection ? '✓ CONNECTION ALLOWED' : '✗ STREAM BLOCKED'}
        </span>
        <span style={{ color: '#888' }}>|</span>
        <span style={{ color: '#888' }}>APPROVALS: {approvedVotes} / {DEMO_FAMILY.approvalThreshold}</span>
        {hasDeclinedVote && <span style={{ color: 'rgba(220,0,60,0.9)' }}>DECLINED</span>}
        {trustLinks.length > 0 && <span style={{ color: '#FFD700' }}>TRUST LINKS: {trustLinks.length}</span>}
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          width: '100%',
          maxWidth: 520,
        }}
      >
        {/* Stream mode toggle */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', width: 100 }}>Mode:</span>
          {(['VIDEO', 'AVATAR_ONLY'] as StreamState[]).map((m) => (
            <button
              key={m}
              onClick={() => setStreamState(m)}
              style={{
                ...BTN,
                borderColor: streamState === m ? '#00FFFF' : 'rgba(255,255,255,0.15)',
                color: streamState === m ? '#00FFFF' : '#888',
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Consensus controls */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
          <div style={{ fontSize: 11, color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
            Custodian Consensus Sim
          </div>

          {!activeRequest && !allowConnection && (
            <button
              style={{ ...BTN, borderColor: '#00FFFF', color: '#00FFFF' }}
              onClick={() => createRequest(DEMO_ADULT_ID, 'Stage Host', DEMO_YOUTH_ID)}
            >
              Request Adult Connection
            </button>
          )}

          {activeRequest && activeRequest.status === 'PENDING' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {custodians.map((c) => (
                <div key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#aaa', width: 130 }}>{c.userName}</span>
                  <button
                    style={{ ...BTN, borderColor: '#00FF88', color: '#00FF88' }}
                    onClick={() => approveRequest(activeRequest.requestId, c.id)}
                    disabled={activeRequest.votes[c.id] !== 'PENDING'}
                  >
                    Approve
                  </button>
                  <button
                    style={{ ...BTN, borderColor: 'rgba(220,0,60,0.7)', color: 'rgba(220,0,60,0.9)' }}
                    onClick={() => declineRequest(activeRequest.requestId, c.id)}
                    disabled={activeRequest.votes[c.id] !== 'PENDING'}
                  >
                    Decline
                  </button>
                  <span style={{ fontSize: 10, color: '#555', textTransform: 'uppercase' }}>
                    {activeRequest.votes[c.id]}
                  </span>
                </div>
              ))}
            </div>
          )}

          {activeRequest && activeRequest.status !== 'PENDING' && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  color: activeRequest.status === 'FULLY_APPROVED' ? '#00FFFF' : 'rgba(220,0,60,0.9)',
                  textTransform: 'uppercase',
                }}
              >
                {activeRequest.status === 'FULLY_APPROVED' ? '✓ FULLY APPROVED' : '✗ REJECTED / WIPED'}
              </span>
              <button style={{ ...BTN }} onClick={resetRequest}>Reset Sim</button>
            </div>
          )}

          {allowConnection && !activeRequest && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#00FFFF', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                ✓ TRUST LINK ACTIVE
              </span>
              <button style={{ ...BTN }} onClick={resetRequest}>Reset Sim</button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
