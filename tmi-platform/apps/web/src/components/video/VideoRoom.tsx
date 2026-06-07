'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import DailyIframe, { DailyCall, DailyParticipant } from '@daily-co/daily-js';
import { DailyProvider, useParticipantIds, useLocalParticipant, useDailyEvent, useParticipant } from '@daily-co/daily-react';
import SecurityShieldMask from '@/components/stage/SecurityShieldMask';
import VideoTile from './VideoTile';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoRoomProps {
  roomUrl: string;
  token?: string;
  userName?: string;
  onLeave?: () => void;
  allowConnection?: boolean;
  onParticipantsChange?: (participantIds: string[]) => void;
}

interface ChatMessage { id: number; name: string; text: string; }

// ─── Remote participant tile (uses daily-react hook) ─────────────────────────

function RemoteTile({ id, isActiveSpeaker }: { id: string; isActiveSpeaker: boolean }) {
  const participant = useParticipant(id) as DailyParticipant | undefined;
  if (!participant) return null;
  return <VideoTile participant={participant} isLocalParticipant={false} isActiveSpeaker={isActiveSpeaker} />;
}

// ─── Room content (inside DailyProvider) ─────────────────────────────────────

function RoomContent({ onLeave, onParticipantsChange }: { onLeave?: () => void; onParticipantsChange?: (ids: string[]) => void }) {
  const participantIds = useParticipantIds();
  const localParticipant = useLocalParticipant();

  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [spotlightId, setSpotlightId] = useState<string | null>(null);
  const [copyDone, setCopyDone] = useState(false);
  const [energyLevel, setEnergyLevel] = useState(22);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const chatIdRef = useRef(0);

  // Expose participant list to parent layer
  useEffect(() => {
    onParticipantsChange?.(participantIds);
  }, [participantIds, onParticipantsChange]);

  // Energy decay — slow drain toward baseline
  useEffect(() => {
    const id = setInterval(() => setEnergyLevel(e => Math.max(15, e - 1)), 600);
    return () => clearInterval(id);
  }, []);

  // Active speaker → boost energy
  useDailyEvent('active-speaker-change', useCallback((e: any) => {
    const id: string | null = e?.activeSpeaker?.peerId ?? null;
    setActiveSpeakerId(id);
    if (id) setEnergyLevel(prev => Math.min(100, prev + 18));
  }, []));

  // Participant join/leave → small energy pulse
  useDailyEvent('participant-joined', useCallback(() => {
    setEnergyLevel(prev => Math.min(100, prev + 10));
  }, []));

  // Chat receive from other participants via Daily app-message
  useDailyEvent('app-message', useCallback((e: any) => {
    const { name, text } = (e?.data ?? {}) as { name?: string; text?: string };
    if (!text) return;
    const msgId = ++chatIdRef.current;
    setChatMessages(prev => [...prev.slice(-49), { id: msgId, name: name ?? 'Guest', text }]);
  }, []));

  function toggleMic() {
    const call = DailyIframe.getCallInstance();
    if (!call) return;
    call.setLocalAudio(isMuted);
    setIsMuted(!isMuted);
  }

  function toggleCam() {
    const call = DailyIframe.getCallInstance();
    if (!call) return;
    call.setLocalVideo(isCamOff);
    setIsCamOff(!isCamOff);
  }

  function copyInviteLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    });
  }

  function sendChat() {
    const text = chatInput.trim();
    if (!text) return;
    const name = localParticipant?.user_name ?? 'You';
    DailyIframe.getCallInstance()?.sendAppMessage({ name, text });
    const msgId = ++chatIdRef.current;
    setChatMessages(prev => [...prev.slice(-49), { id: msgId, name, text }]);
    setChatInput('');
  }

  function toggleSpotlight(id: string) {
    setSpotlightId(prev => prev === id ? null : id);
  }

  const localId = localParticipant?.session_id ?? null;
  const remoteIds = participantIds.filter(id => id !== localId);
  const allIds = localId ? [localId, ...remoteIds] : [...remoteIds];
  const featuredId = spotlightId ?? activeSpeakerId ?? (allIds[0] ?? null);
  const railIds = allIds.filter(id => id !== featuredId);
  const isAlone = allIds.length <= 1;
  const energyColor = energyLevel > 70 ? '#FF2DAA' : energyLevel > 40 ? '#AA2DFF' : '#00FFFF';

  return (
    <div style={{ minHeight: '100vh', background: '#060410', color: '#fff', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* Arena grid underlay */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,255,0.025) 1px,transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none', zIndex: 0 }} />

      {/* Header */}
      <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10, position: 'relative', flexShrink: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 900, color: '#00FFFF', letterSpacing: '0.05em' }}>ARENA</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>LIVE ROOM</span>
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
            {allIds.length} participant{allIds.length !== 1 ? 's' : ''}
            {spotlightId && <span style={{ color: '#FFD700', marginLeft: 8 }}>◉ spotlight</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setChatOpen(o => !o)}
            style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${chatOpen ? 'rgba(170,45,255,0.5)' : 'rgba(255,255,255,0.12)'}`, background: chatOpen ? 'rgba(170,45,255,0.12)' : 'rgba(255,255,255,0.04)', color: chatOpen ? '#AA2DFF' : 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
          >
            💬 Chat
          </button>
          <button
            onClick={copyInviteLink}
            style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid rgba(0,255,255,0.25)', background: 'rgba(0,255,255,0.06)', color: '#00FFFF', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
          >
            {copyDone ? '✓' : '🔗'} Invite
          </button>
        </div>
      </div>

      {/* ── SPOTLIGHT ZONE ──────────────────────────────────────────── */}
      <div style={{ flex: '1 0 0', position: 'relative', padding: '12px 16px', minHeight: '44vh', zIndex: 10 }}>
        {isAlone ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: 44 }}>🎙️</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Waiting for others to join…</div>
            <div style={{ fontSize: 11 }}>Share the invite link to bring someone in</div>
          </div>
        ) : featuredId ? (
          <div style={{ width: '100%', height: '100%', borderRadius: 14, overflow: 'hidden', border: `2px solid ${spotlightId ? '#FFD70066' : activeSpeakerId === featuredId ? '#00FFFF55' : 'rgba(255,255,255,0.08)'}`, boxShadow: activeSpeakerId === featuredId ? '0 0 36px #00FFFF1a' : 'none', position: 'relative', minHeight: 200, transition: 'border-color 0.3s, box-shadow 0.3s' }}>
            {featuredId === localId && localParticipant ? (
              <VideoTile participant={localParticipant} isLocalParticipant isActiveSpeaker={activeSpeakerId === featuredId} />
            ) : (
              <RemoteTile id={featuredId} isActiveSpeaker={activeSpeakerId === featuredId} />
            )}
            {spotlightId && (
              <>
                <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,215,0,0.18)', border: '1px solid #FFD70055', borderRadius: 20, padding: '3px 10px', fontSize: 8, fontWeight: 900, color: '#FFD700', letterSpacing: '0.15em', pointerEvents: 'none' }}>
                  ◉ SPOTLIGHT
                </div>
                <button onClick={() => setSpotlightId(null)} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '3px 8px', fontSize: 9, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                  ✕ clear
                </button>
              </>
            )}
          </div>
        ) : null}
      </div>

      {/* ── PARTICIPANT RAIL ─────────────────────────────────────────── */}
      {!isAlone && railIds.length > 0 && (
        <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 8, overflowX: 'auto', flexShrink: 0, zIndex: 10, scrollbarWidth: 'none' }}>
          {railIds.map(id => (
            <div
              key={id}
              onClick={() => toggleSpotlight(id)}
              title="Click to spotlight"
              style={{ width: 100, flexShrink: 0, cursor: 'pointer', borderRadius: 8, overflow: 'hidden', border: `1.5px solid ${spotlightId === id ? '#FFD70088' : activeSpeakerId === id ? '#00FFFF44' : 'rgba(255,255,255,0.08)'}`, transition: 'border-color 0.25s', opacity: 0.82 }}
            >
              {id === localId && localParticipant ? (
                <VideoTile participant={localParticipant} isLocalParticipant isActiveSpeaker={activeSpeakerId === id} />
              ) : (
                <RemoteTile id={id} isActiveSpeaker={activeSpeakerId === id} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── ENERGY BAR ───────────────────────────────────────────────── */}
      <div style={{ height: 5, background: 'rgba(255,255,255,0.04)', flexShrink: 0, zIndex: 10, position: 'relative' }}>
        <div style={{ height: '100%', width: `${energyLevel}%`, background: `linear-gradient(90deg,#AA2DFF,${energyColor})`, transition: 'width 0.4s ease,background 0.6s ease', boxShadow: energyLevel > 55 ? `0 0 8px ${energyColor}88` : 'none' }} />
        <div aria-hidden style={{ position: 'absolute', right: 8, top: -15, fontSize: 8, fontWeight: 900, letterSpacing: '0.15em', color: energyColor, opacity: 0.65, transition: 'color 0.6s ease', userSelect: 'none' }}>
          ENERGY {energyLevel}
        </div>
      </div>

      {/* ── CONTROLS ─────────────────────────────────────────────────── */}
      <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexShrink: 0, zIndex: 10 }}>
        <button onClick={toggleMic} title={isMuted ? 'Unmute' : 'Mute'} style={{ width: 50, height: 50, borderRadius: '50%', border: 'none', cursor: 'pointer', background: isMuted ? 'rgba(255,80,80,0.2)' : 'rgba(255,255,255,0.08)', color: isMuted ? '#FF5050' : '#fff', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isMuted ? '🔇' : '🎙️'}
        </button>
        <button onClick={toggleCam} title={isCamOff ? 'Camera on' : 'Camera off'} style={{ width: 50, height: 50, borderRadius: '50%', border: 'none', cursor: 'pointer', background: isCamOff ? 'rgba(255,80,80,0.2)' : 'rgba(255,255,255,0.08)', color: isCamOff ? '#FF5050' : '#fff', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isCamOff ? '📵' : '📷'}
        </button>
        <button onClick={onLeave} style={{ padding: '0 28px', height: 50, borderRadius: 25, border: 'none', cursor: 'pointer', background: 'rgba(255,50,50,0.2)', color: '#FF5050', fontWeight: 900, fontSize: 13, letterSpacing: '0.05em' }}>
          Leave
        </button>
      </div>

      {/* ── CHAT OVERLAY ─────────────────────────────────────────────── */}
      {chatOpen && (
        <div style={{ position: 'absolute', bottom: 80, left: 16, width: 280, zIndex: 300, background: 'rgba(6,4,16,0.96)', border: '1px solid rgba(170,45,255,0.35)', borderRadius: 12, backdropFilter: 'blur(14px)', overflow: 'hidden' }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: '#AA2DFF' }}>
            LIVE CHAT
          </div>
          <div style={{ padding: '8px 12px', minHeight: 56, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {chatMessages.length === 0 ? (
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>No messages yet…</div>
            ) : chatMessages.map(msg => (
              <div key={msg.id} style={{ fontSize: 10, lineHeight: 1.4 }}>
                <span style={{ fontWeight: 900, color: '#AA2DFF' }}>{msg.name}: </span>
                <span style={{ color: 'rgba(255,255,255,0.85)' }}>{msg.text}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: '6px 10px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 6 }}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder="Say something…"
              style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 10px', fontSize: 11, color: '#fff', outline: 'none' }}
            />
            <button onClick={sendChat} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: 'rgba(170,45,255,0.3)', color: '#AA2DFF', fontWeight: 900, fontSize: 11, cursor: 'pointer' }}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function VideoRoom({ roomUrl, token, userName, onLeave, allowConnection = true, onParticipantsChange }: VideoRoomProps) {
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

  if (!allowConnection) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', background: '#060410' }}>
        <SecurityShieldMask title="VIDEO ACCESS BLOCKED" reason="CUSTODIAN CONSENSUS REQUIRED" />
      </div>
    );
  }

  if (!joined) {
    return (
      <div style={{ minHeight: '100vh', background: '#060410', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🎥</p>
          <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Ready to join?</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>Your camera and mic will activate when you join.</p>
          <button
            onClick={joinCall}
            style={{ padding: '14px 40px', borderRadius: 28, background: 'linear-gradient(135deg,#00FFFF22,#AA2DFF22)', border: '1px solid rgba(0,255,255,0.4)', color: '#00FFFF', fontWeight: 900, fontSize: 14, cursor: 'pointer', letterSpacing: '0.05em' }}
          >
            Join Live Arena
          </button>
        </div>
      </div>
    );
  }

  return (
    <DailyProvider callObject={callObject!}>
      <RoomContent onLeave={leaveCall} onParticipantsChange={onParticipantsChange} />
    </DailyProvider>
  );
}
