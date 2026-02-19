/**
 * PROMPT #3B: Arena Viewer Main Component
 * Wires together: SeatMap, AvatarSprite, AvatarWalkIn, EmoteOverlay, ChatBubblesLayer, CameraRig
 * Connects to EngineClient for real-time avatar/seat/chat updates
 */

'use client';

import React, { useEffect, useState, useRef } from 'react';
import type { AvatarState } from '@/types/shared';
import { EngineClient } from '@/lib/client/EngineClient';
import { generateAudienceSeatsWithTiers, generateStageSeats, type EnhancedSeatState, findNearestAvailableSeat } from './SeatMap';
import { AvatarSprite } from './AvatarSprite';
import { EmoteOverlay, type EmoteInstance } from './EmoteOverlay';
import { ChatBubblesLayer, type ChatMessage } from './ChatBubblesLayer';
import { CameraRig, startCameraLoop, type CameraState } from './CameraRig';
import { animateToSeat, animatePopIn, type WalkInState } from './AvatarWalkIn';

export interface ArenaViewerProps {
  roomId: string;
  userId: string;
  username: string;
  role: 'ARTIST' | 'AUDIENCE';
  avatarAssetId?: string;
  className?: string;
}

interface AvatarRenderState {
  avatar: AvatarState;
  walkState?: WalkInState; // During walk-in animation
}

export const ArenaViewer: React.FC<ArenaViewerProps> = ({ roomId, userId, username, role, avatarAssetId = 'default-front.png', className = '' }) => {
  const [engineClient] = useState(() => new EngineClient({ url: 'ws://localhost:3001' }));
  const [connected, setConnected] = useState(false);
  const [seats, setSeats] = useState<EnhancedSeatState[]>([]);
  const [avatars, setAvatars] = useState<Map<string, AvatarRenderState>>(new Map());
  const [emotes, setEmotes] = useState<EmoteInstance[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [cameraState, setCameraState] = useState<CameraState | null>(null);
  const cameraRigRef = useRef<CameraRig | null>(null);
  const walkAnimationsRef = useRef<Map<string, () => void>>(new Map()); // Cancel functions

  // Initialize seats
  useEffect(() => {
    const audienceSeats = generateAudienceSeatsWithTiers({
      stageCenterX: 500,
      stageCenterY: 300,
    });
    const stageSeats = generateStageSeats(500, 300);
    setSeats([...audienceSeats, ...stageSeats]);
  }, []);

  // Initialize camera rig
  useEffect(() => {
    const rig = new CameraRig({
      stageCenterX: 500,
      stageCenterY: 300,
      defaultZoom: 1.0,
      interpolationSpeed: 0.08,
      reducedMotion: false,
      scanInterval: 5000,
    });

    rig.focusStage(); // Start at stage view
    cameraRigRef.current = rig;

    // Start camera update loop
    const stopLoop = startCameraLoop(rig, (state) => {
      setCameraState(state);
    });

    return () => {
      stopLoop();
      rig.destroy();
    };
  }, []);

  // Connect to engine
  useEffect(() => {
    if (!engineClient || connected) return;

    const connect = async () => {
      try {
        await engineClient.connect();
        await engineClient.joinRoom(roomId, username);
        setConnected(true);

        // Join as avatar
        await engineClient.joinAsAvatar(avatarAssetId);

        // Request seat (auto-assign)
        const preferredTier = role === 'ARTIST' ? 'STAGE' : 'LOWER';
        await engineClient.requestSeat(preferredTier);
      } catch (err) {
        console.error('[ArenaViewer] Connection error:', err);
      }
    };

    connect();

    return () => {
      engineClient.disconnect?.();
    };
  }, [engineClient, roomId, username, avatarAssetId, role, connected]);

  // Subscribe to avatar updates
  useEffect(() => {
    if (!engineClient) return;

    const unsubAvatars = engineClient.onAvatarUpdate?.((updatedAvatars) => {
      const newAvatars = new Map<string, AvatarRenderState>();

      updatedAvatars.forEach((avatar) => {
        const existing = avatars.get(avatar.userId);

        // If avatar just got a seat, animate walk-in
        if (!existing?.avatar.seatId && avatar.seatId) {
          const seat = seats.find((s) => s.id === avatar.seatId);
          if (seat) {
            // Cancel existing animation
            const cancel = walkAnimationsRef.current.get(avatar.userId);
            if (cancel) cancel();

            // Start walk animation
            const walkState: WalkInState = { x: avatar.position.x, y: avatar.position.y, tilt: 0, scale: 1, progress: 0 };
            newAvatars.set(avatar.userId, { avatar, walkState });

            const cancelWalk = animateToSeat(
              { x: avatar.position.x, y: avatar.position.y },
              { x: seat.position.x, y: seat.position.y },
              (state) => {
                setAvatars((prev) => {
                  const updated = new Map(prev);
                  updated.set(avatar.userId, { avatar, walkState: state });
                  return updated;
                });
              },
              () => {
                // Animation done
                setAvatars((prev) => {
                  const updated = new Map(prev);
                  updated.set(avatar.userId, { avatar, walkState: undefined });
                  return updated;
                });
                walkAnimationsRef.current.delete(avatar.userId);
              }
            );

            walkAnimationsRef.current.set(avatar.userId, cancelWalk);
          }
        } else {
          newAvatars.set(avatar.userId, { avatar, walkState: existing?.walkState });
        }
      });

      setAvatars(newAvatars);
    });

    const unsubSeats = engineClient.onSeatUpdate?.((updatedSeats) => {
      // Seat updates handled via avatar seat assignments
      console.log('[ArenaViewer] Seats updated:', updatedSeats.length);
    });

    return () => {
      unsubAvatars?.();
      unsubSeats?.();
    };
  }, [engineClient, avatars, seats]);

  // Handle emote events
  useEffect(() => {
    if (!engineClient) return;

    const handleEmote = (data: { userId: string; emoteType: string }) => {
      const avatar = avatars.get(data.userId);
      if (!avatar) return;

      const emote: EmoteInstance = {
        id: `emote-${Date.now()}-${data.userId}`,
        userId: data.userId,
        emoteType: data.emoteType as any,
        position: { x: avatar.avatar.position.x, y: avatar.avatar.position.y - 60 },
        startTime: Date.now(),
        duration: 1500,
      };

      setEmotes((prev) => [...prev, emote]);

      // Track activity for camera heat
      if (cameraRigRef.current && avatar.avatar.seatId) {
        cameraRigRef.current.trackActivity(avatar.avatar.seatId, 'EMOTE');
      }

      // Auto-remove after duration
      setTimeout(() => {
        setEmotes((prev) => prev.filter((e) => e.id !== emote.id));
      }, emote.duration + 100);
    };

    // Note: Real socket event would be like engineClient.on('avatar:emote', handleEmote)
    // For now, this is a placeholder showing the intent

    return () => {
      // Cleanup emote listener
    };
  }, [engineClient, avatars]);

  // Render avatars with walk-in animation
  const renderAvatars = () => {
    return Array.from(avatars.values()).map((renderState) => {
      const { avatar, walkState } = renderState;
      const seat = seats.find((s) => s.id === avatar.seatId);

      // Position: use walkState if animating, else seat position
      const x = walkState ? walkState.x : seat?.position.x ?? avatar.position.x;
      const y = walkState ? walkState.y : seat?.position.y ?? avatar.position.y;
      const tilt = walkState?.tilt ?? 0;
      const scale = walkState?.scale ?? 1;

      return (
        <div
          key={avatar.userId}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            transform: `translate(-50%, -50%)`,
          }}
        >
          <AvatarSprite
            avatar={avatar}
            cameraYaw={cameraState?.currentX ? Math.atan2(cameraState.currentY - y, cameraState.currentX - x) * (180 / Math.PI) : 270}
            seatYaw={seat?.yaw ?? 90}
            scale={scale}
            tilt={tilt}
            showAccessories={true}
            showEmote={true}
          />
        </div>
      );
    });
  };

  return (
    <div className={`arena-viewer ${className}`} style={{ position: 'relative', width: '100%', height: '100%', background: '#0a0a0a', overflow: 'hidden' }}>
      {/* Connection status */}
      {!connected && (
        <div style={{ position: 'absolute', top: 20, left: 20, color: '#FFF', background: 'rgba(0,0,0,0.8)', padding: '8px 16px', borderRadius: 8 }}>
          Connecting to room...
        </div>
      )}

      {/* Arena viewport (centered, transformed by camera) */}
      <div
        className="arena-viewport"
        style={{
          position: 'absolute',
          width: 1000,
          height: 800,
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translate(${-(cameraState?.currentX ?? 500)}px, ${-(cameraState?.currentY ?? 300)}px) scale(${cameraState?.currentZoom ?? 1})`,
          transition: 'transform 0.1s linear',
        }}
      >
        {/* Stage background */}
        <div
          style={{
            position: 'absolute',
            left: 300,
            top: 200,
            width: 400,
            height: 200,
            background: 'linear-gradient(180deg, rgba(255,193,7,0.3) 0%, rgba(255,193,7,0.1) 100%)',
            borderRadius: 16,
            border: '2px solid rgba(255,193,7,0.5)',
          }}
        />

        {/* Seat markers (for debugging) */}
        {seats.map((seat) => (
          <div
            key={seat.id}
            style={{
              position: 'absolute',
              left: seat.position.x,
              top: seat.position.y,
              width: 20,
              height: 20,
              background: seat.tier === 'STAGE' ? 'rgba(255,193,7,0.3)' : 'rgba(100,100,100,0.2)',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          />
        ))}

        {/* Avatars */}
        {renderAvatars()}
      </div>

      {/* Overlays (not affected by camera transform) */}
      <EmoteOverlay emotes={emotes} />
      <ChatBubblesLayer messages={chatMessages} seats={seats} />

      {/* Camera controls (optional UI) */}
      <div style={{ position: 'absolute', bottom: 20, left: 20, display: 'flex', gap: 8 }}>
        <button
          onClick={() => cameraRigRef.current?.focusStage()}
          style={{ padding: '8px 16px', background: '#444', color: '#FFF', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >
          Focus Stage
        </button>
        <button
          onClick={() => cameraRigRef.current?.crowdScan()}
          style={{ padding: '8px 16px', background: '#444', color: '#FFF', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >
          Crowd Scan
        </button>
      </div>
    </div>
  );
};

export default ArenaViewer;
