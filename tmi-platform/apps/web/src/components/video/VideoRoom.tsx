'use client';

import { useCallback, useState } from 'react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { DailyProvider, useParticipantIds, useLocalParticipant, useDailyEvent } from '@daily-co/daily-react';
import VideoTile from './VideoTile';

interface VideoRoomProps {
  roomUrl: string;
  token?: string;
  userName?: string;
  onLeave?: () => void;
}

function RoomContent({ onLeave }: { onLeave?: () => void }) {
  const participantIds = useParticipantIds();
  const localParticipant = useLocalParticipant();
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [copyDone, setCopyDone] = useState(false);

  useDailyEvent('active-speaker-change', useCallback((e: any) => {
    setActiveSpeakerId(e?.activeSpeaker?.peerId ?? null);
  }, []));

  function toggleMic() {
    const call = DailyIframe.getCallInstance();
    if (!call) return;
    if (isMuted) {
      call.setLocalAudio(true);
    } else {
      call.setLocalAudio(false);
    }
    setIsMuted(!isMuted);
  }

  function toggleCam() {
    const call = DailyIframe.getCallInstance();
    if (!call) return;
    if (isCamOff) {
      call.setLocalVideo(true);
    } else {
      call.setLocalVideo(false);
    }
    setIsCamOff(!isCamOff);
  }

  function copyInviteLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    });
  }

  const allIds = localParticipant
    ? [localParticipant.session_id, ...participantIds.filter(id => id !== localParticipant.session_id)]
    : participantIds;

  return (
    <div style={{ minHeight: '100vh', background: '#060410', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 900, margin: 0, color: '#00FFFF' }}>🎥 Video Room</h1>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>
            {allIds.length} participant{allIds.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={copyInviteLink}
          style={{
            padding: '8px 16px', borderRadius: 20, border: '1px solid rgba(0,255,255,0.3)',
            background: 'rgba(0,255,255,0.08)', color: '#00FFFF',
            fontSize: 11, fontWeight: 800, cursor: 'pointer', letterSpacing: '0.05em',
          }}
        >
          {copyDone ? '✓ Copied!' : '🔗 Invite'}
        </button>
      </div>

      {/* Participant Grid */}
      <div style={{
        flex: 1, padding: 24,
        display: 'grid',
        gridTemplateColumns: allIds.length === 1 ? '1fr' : allIds.length <= 4 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
        gap: 12, alignContent: 'start',
      }}>
        {localParticipant && (
          <VideoTile
            participant={localParticipant}
            isLocalParticipant
            isActiveSpeaker={activeSpeakerId === localParticipant.session_id}
          />
        )}
        {participantIds
          .filter(id => id !== localParticipant?.session_id)
          .map(id => (
            <VideoTileById key={id} id={id} activeSpeakerId={activeSpeakerId} />
          ))}
        {allIds.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 0', color: 'rgba(255,255,255,0.3)' }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>🎙️</p>
            <p style={{ fontSize: 14 }}>Waiting for others to join…</p>
            <p style={{ fontSize: 11, marginTop: 4 }}>Share the invite link to bring someone in</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{
        padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        <button
          onClick={toggleMic}
          style={{
            width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: isMuted ? 'rgba(255,80,80,0.2)' : 'rgba(255,255,255,0.08)',
            color: isMuted ? '#FF5050' : '#fff', fontSize: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? '🔇' : '🎙️'}
        </button>

        <button
          onClick={toggleCam}
          style={{
            width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: isCamOff ? 'rgba(255,80,80,0.2)' : 'rgba(255,255,255,0.08)',
            color: isCamOff ? '#FF5050' : '#fff', fontSize: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          title={isCamOff ? 'Camera on' : 'Camera off'}
        >
          {isCamOff ? '📵' : '📷'}
        </button>

        <button
          onClick={onLeave}
          style={{
            padding: '0 28px', height: 52, borderRadius: 26, border: 'none', cursor: 'pointer',
            background: 'rgba(255,50,50,0.25)', color: '#FF5050',
            fontWeight: 800, fontSize: 13, letterSpacing: '0.05em',
          }}
        >
          Leave
        </button>
      </div>
    </div>
  );
}

function VideoTileById({ id, activeSpeakerId }: { id: string; activeSpeakerId: string | null }) {
  // @daily-co/daily-react provides useParticipant but we do a simple lookup here
  return (
    <div style={{
      borderRadius: 12, background: '#0d0820', border: '2px solid rgba(255,255,255,0.1)',
      aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 8,
      ...(activeSpeakerId === id ? { borderColor: '#00FFFF', boxShadow: '0 0 18px #00FFFF44' } : {}),
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%', background: 'rgba(0,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#00FFFF',
      }}>
        🎤
      </div>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Participant</span>
    </div>
  );
}

export default function VideoRoom({ roomUrl, token, userName, onLeave }: VideoRoomProps) {
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const [joined, setJoined] = useState(false);

  const joinCall = useCallback(async () => {
    const call = DailyIframe.createCallObject({ url: roomUrl, token });
    await call.join({ userName });
    setCallObject(call);
    setJoined(true);
  }, [roomUrl, token, userName]);

  const leaveCall = useCallback(async () => {
    await callObject?.leave();
    callObject?.destroy();
    setCallObject(null);
    setJoined(false);
    onLeave?.();
  }, [callObject, onLeave]);

  if (!joined) {
    return (
      <div style={{ minHeight: '100vh', background: '#060410', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🎥</p>
          <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Ready to join?</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>Your camera and mic will be on when you join.</p>
          <button
            onClick={joinCall}
            style={{
              padding: '14px 40px', borderRadius: 28,
              background: 'linear-gradient(135deg, #00FFFF22, #AA2DFF22)',
              border: '1px solid rgba(0,255,255,0.4)',
              color: '#00FFFF', fontWeight: 900, fontSize: 14, cursor: 'pointer', letterSpacing: '0.05em',
            }}
          >
            Join Video Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <DailyProvider callObject={callObject!}>
      <RoomContent onLeave={leaveCall} />
    </DailyProvider>
  );
}
