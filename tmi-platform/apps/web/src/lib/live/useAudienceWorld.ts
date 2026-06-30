'use client';

/**
 * useAudienceWorld — the React hook that makes the audience feel like a living world.
 *
 * Connects:
 *   AudienceVisibilityEngine  (who is in which seat, real + bots)
 *   BotCrowdFillEngine        (keeps seats populated, periodic reactions)
 *   RoomEnergyEngine          (COLD → WARMING → HOT → ON FIRE → LEGENDARY)
 *   HostIdentityRegistry      (host entities seated in VIP zone)
 *   StageDirectorEngine       (energy level → automatic lighting preset)
 *
 * Returns a snapshot that updates every 5s (or on-demand after events):
 *   seats[]            — full seat grid with occupants
 *   avatars[]          — all present audience members (real + bot + host)
 *   energy             — current room energy state
 *   occupancyRatio     — 0–1, feeds AudienceScene.occupancyRatio prop
 *   hostSeats          — host entities currently in audience (not on stage)
 *
 * Signal methods (call these from reaction/tip/vote handlers):
 *   recordReaction()   — +1 energy, refreshes snapshot
 *   recordTip(amount)  — +energy proportional to tip, refreshes
 *   recordVote()       — +2 energy, refreshes
 *   recordJoin()       — +3 energy (called when real user joins)
 */

import { useEffect, useState, useCallback } from 'react';
import {
  audienceVisibilityEngine,
  type AudienceAvatar,
  type SeatPosition,
} from './AudienceVisibilityEngine';
import { botCrowdFillEngine } from './BotCrowdFillEngine';
import { roomEnergyEngine, type RoomEnergyState } from './RoomEnergyEngine';
import { HOST_IDENTITY_REGISTRY } from '@/lib/hosts/HostIdentityRegistry';
import { setLightingPreset } from './StageDirectorEngine';
import {
  fromAudienceAvatar,
  registerEntity,
  type AvatarEntity,
} from '@/lib/avatars/UnifiedAvatarRuntime';
import type {
  AttentionVector,
} from '@/lib/engines/runtime/CrowdAttentionEngine';

// Type-only import to avoid SSR evaluation
import type {
  onAttentionUpdate as TOnAttentionUpdate,
  getRoomAttentionVectors as TGetRoomAttentionVectors,
} from '@/lib/engines/runtime/CrowdAttentionEngine';

// ─── Energy → automatic lighting ─────────────────────────────────────────────

const ENERGY_LIGHTING: Record<string, string> = {
  LEGENDARY:  'rainbow',
  'ON FIRE':  'concert-red',
  HOT:        'purple-wash',
  WARMING:    'blue-arena',
  COLD:       'blackout',
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AudienceWorldState {
  seats: SeatPosition[];
  avatars: AudienceAvatar[];
  /** Canonical unified entities — same data as avatars[], via UnifiedAvatarRuntime adapters */
  entities: AvatarEntity[];
  energy: RoomEnergyState | null;
  /** 0–1 ratio, pass directly to AudienceScene as occupancyRatio */
  occupancyRatio: number;
  /** Host entities currently seated in the audience (not on stage) */
  hostSeats: AudienceAvatar[];
  /** Real-time attention vectors for each avatar — drives head rotation in AudienceScene */
  attentionVectors: AttentionVector[];
}

interface AudienceWorldHandlers {
  recordReaction: () => void;
  recordTip: (amountUsd: number) => void;
  recordVote: () => void;
  recordJoin: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAudienceWorld(
  roomId: string,
  rows = 8,
  cols = 12,
  performerId?: string,
): AudienceWorldState & AudienceWorldHandlers {
  const [seats, setSeats] = useState<SeatPosition[]>([]);
  const [avatars, setAvatars] = useState<AudienceAvatar[]>([]);
  const [entities, setEntities] = useState<AvatarEntity[]>([]);
  const [energy, setEnergy] = useState<RoomEnergyState | null>(null);
  const [attentionVectors, setAttentionVectors] = useState<AttentionVector[]>([]);

  const snapshot = useCallback(() => {
    const s = audienceVisibilityEngine.getSeats(roomId);
    const a = audienceVisibilityEngine.getAvatars(roomId);
    const e = roomEnergyEngine.getState(roomId) ?? null;

    setSeats(s);
    setAvatars(a);
    setEnergy(e);

    // Convert to canonical AvatarEntity and register in UnifiedAvatarRuntime
    const unified = a.map(av => fromAudienceAvatar(av, roomId));
    unified.forEach(entity => registerEntity(entity));
    setEntities(unified);

    // Register avatarIds with RoomEnergyEngine for attention tracking
    const avatarIds = a.map(av => av.userId);
    roomEnergyEngine.setRoomAvatars(roomId, avatarIds);
    if (performerId) {
      roomEnergyEngine.setRoomPerformer(roomId, performerId);
    }

    // Feed attention vectors to AvatarAttentionRuntime for visual rendering
    if (typeof window !== 'undefined') {
      import('@/lib/engines/runtime/CrowdAttentionEngine').then(crowdEngine => {
        const vectors = crowdEngine.getRoomAttentionVectors(avatarIds);
        import('@/lib/engines/attention/AvatarAttentionRuntime').then(runtime => {
          runtime.avatarAttentionRuntime.updateFromAttentionVectors(avatarIds, vectors);
          setAttentionVectors(vectors);
        });
      });
    } else {
      setAttentionVectors([]);
    }

    // Auto-wire energy level → StageDirectorEngine CSS lighting
    if (e) {
      const preset = ENERGY_LIGHTING[e.energyLabel];
      if (preset) setLightingPreset(preset);
    }
  }, [roomId, performerId]);

  useEffect(() => {
    // Initialize the seat grid and energy tracker
    audienceVisibilityEngine.initGrid(roomId, rows, cols);
    roomEnergyEngine.initRoom(roomId);

    // Bot fill: 45% minimum, activates when real users < 5, max 92% bots
    botCrowdFillEngine.activate({
      roomId,
      minimumFillRatio: 0.45,
      minimumRealThreshold: 5,
      maxBotCount: Math.floor(rows * cols * 0.92),
    });
    botCrowdFillEngine.startActivity(roomId, 8_000);

    // Seed host entities into VIP seats so they appear in the world
    const hosts = HOST_IDENTITY_REGISTRY
      .filter(h => h.role !== 'PLATFORM_AUTHORITY')
      .slice(0, 4); // up to 4 hosts visible in audience at a time

    hosts.forEach(host => {
      audienceVisibilityEngine.seatUser(roomId, {
        userId: `host-${host.id}`,
        displayName: host.name,
        avatarImageUrl: `/hosts/${host.id}.png`,
        state: 'sitting',
        tier: 'vip',
        isBot: false,
        joinedAt: Date.now(),
        supporterBadge: host.role,
      });
    });

    snapshot();

    // Subscribe to real-time attention updates (client-only, safe for SSR)
    let unsubscribeAttention = () => {};
    if (typeof window !== 'undefined') {
      import('@/lib/engines/runtime/CrowdAttentionEngine').then(crowdEngine => {
        const onAttention = crowdEngine.onAttentionUpdate;
        unsubscribeAttention = onAttention((vectors) => {
          // Feed attention updates to renderer runtime
          const avatarIds = vectors.map(v => v.avatarId);
          import('@/lib/engines/attention/AvatarAttentionRuntime').then(runtime => {
            runtime.avatarAttentionRuntime.updateFromAttentionVectors(avatarIds, vectors);
            setAttentionVectors(vectors);
          });
        });
      });
    }

    // Tick: natural energy decay + periodic snapshot refresh
    const tick = setInterval(() => {
      roomEnergyEngine.decay(roomId, 1);
      snapshot();
    }, 5_000);

    return () => {
      clearInterval(tick);
      unsubscribeAttention();
      botCrowdFillEngine.stopActivity(roomId);
    };
  }, [roomId, rows, cols, snapshot]);

  // ── Signal handlers ─────────────────────────────────────────────────────────

  const recordReaction = useCallback(() => {
    roomEnergyEngine.recordReaction(roomId);
    snapshot();
  }, [roomId, snapshot]);

  const recordTip = useCallback((amountUsd: number) => {
    roomEnergyEngine.recordTip(roomId, amountUsd);
    snapshot();
  }, [roomId, snapshot]);

  const recordVote = useCallback(() => {
    roomEnergyEngine.recordVote(roomId);
    snapshot();
  }, [roomId, snapshot]);

  const recordJoin = useCallback(() => {
    roomEnergyEngine.recordJoin(roomId);
    snapshot();
  }, [roomId, snapshot]);

  // ── Derived state ───────────────────────────────────────────────────────────

  const occupancyRatio = Math.min(1, avatars.length / Math.max(1, seats.length));
  const hostSeats = avatars.filter(a => a.userId.startsWith('host-'));

  return {
    seats,
    avatars,
    entities,
    energy,
    occupancyRatio,
    hostSeats,
    attentionVectors,
    recordReaction,
    recordTip,
    recordVote,
    recordJoin,
  };
}
