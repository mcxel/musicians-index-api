/**
 * src/lib/hooks/useVisualAuthority.ts
 *
 * React hooks for authority-enforced visual rendering.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  resolveMagazineSlotWithAuthority,
  hydrateImageWithAuthority,
  resolvePerformerPortraitWithAuthority,
  reconstructVenueWithAuthority,
  routeVisualReplacementWithAuthority,
} from '@/lib/ai-visuals/AuthorityAwareVisualGenerators';
import type { ChatRoomId } from '@/lib/chat/RoomChatEngine';

type FallbackState = string | null;

const VALID_ROOM_IDS: readonly ChatRoomId[] = [
  "monthly-idol", "monday-night-stage", "deal-or-feud",
  "name-that-tune", "circle-squares", "cypher-arena", "venue-room",
];

function toChatRoomId(id: string): ChatRoomId | undefined {
  return VALID_ROOM_IDS.includes(id as ChatRoomId) ? (id as ChatRoomId) : undefined;
}

export function useImageSlot(
  imageId: string,
  roomId: string,
  priority: 'critical' | 'high' | 'normal' | 'deferred' = 'normal'
) {
  const [state, setState] = useState({
    assetId: null as string | null,
    blocked: false,
    fallback: null as FallbackState,
    isLoading: true,
    error: null as string | null,
  });

  useEffect(() => {
    (async () => {
      try {
        const result = await hydrateImageWithAuthority(imageId, toChatRoomId(roomId), priority);
        setState({
          assetId: result.jobId ?? null,
          blocked: Boolean(result.blocked),
          fallback: result.blocked ? 'authority-fallback' : null,
          isLoading: false,
          error: 'error' in result ? (result.error ?? null) : null,
        });
      } catch (e) {
        setState({
          assetId: null,
          blocked: false,
          fallback: null,
          isLoading: false,
          error: e instanceof Error ? e.message : 'Failed to hydrate image',
        });
      }
    })();
  }, [imageId, roomId, priority]);

  return state;
}

export function useMagazineSlot(slotId: string, roomId: string, context?: Record<string, unknown>) {
  const [state, setState] = useState({
    assetId: null as string | null,
    blocked: false,
    fallback: null as FallbackState,
    isLoading: true,
    error: null as string | null,
    recoveryAction: null as string | null,
  });

  useEffect(() => {
    (async () => {
      try {
        const result = await resolveMagazineSlotWithAuthority(
          slotId,
          toChatRoomId(roomId),
          context ? JSON.stringify(context) : undefined
        );
        setState({
          assetId: result.assetId ?? null,
          blocked: Boolean(result.blocked),
          fallback: result.fallback ? 'fallback-active' : null,
          isLoading: false,
          error: 'error' in result ? (result.error ?? null) : null,
          recoveryAction: 'recoveryAction' in result ? (result.recoveryAction ?? null) : null,
        });
      } catch (e) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: e instanceof Error ? e.message : 'Magazine slot resolution failed',
        }));
      }
    })();
  }, [slotId, roomId, context]);

  return state;
}

export function usePerformerPortrait(
  performerId: string,
  roomId: string,
  displayName: string,
  kind: 'artist' | 'host' | 'dj' = 'artist'
) {
  const [state, setState] = useState({
    portraitId: null as string | null,
    blocked: false,
    fallback: null as FallbackState,
    isLoading: true,
    error: null as string | null,
    animationState: 'idle' as 'idle' | 'ready',
  });

  useEffect(() => {
    (async () => {
      try {
        const result = await resolvePerformerPortraitWithAuthority(
          performerId,
          toChatRoomId(roomId),
          displayName,
          kind
        );
        setState({
          portraitId: result.portraitId ?? null,
          blocked: Boolean(result.blocked),
          fallback: 'fallback' in result ? (result.fallback ? 'fallback-active' : null) : null,
          isLoading: false,
          error: 'error' in result ? (result.error ?? null) : null,
          animationState: result.generated ? 'ready' : 'idle',
        });
      } catch (e) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: e instanceof Error ? e.message : 'Portrait resolution failed',
        }));
      }
    })();
  }, [performerId, roomId, displayName, kind]);

  return state;
}

export function useVenueReconstruction(
  venueId: string,
  roomId: string,
  venueName: string,
  venueType: 'club' | 'arena' | 'battle-hall' | 'lounge' = 'club'
) {
  const [state, setState] = useState({
    reconstructedAssetId: null as string | null,
    blocked: false,
    fallback: null as FallbackState,
    isLoading: true,
    error: null as string | null,
    environmentState: 'initializing' as 'initializing' | 'ready',
  });

  useEffect(() => {
    (async () => {
      try {
        const result = await reconstructVenueWithAuthority(
          venueId,
          toChatRoomId(roomId),
          venueName,
          venueType
        );
        setState({
          reconstructedAssetId: result.reconstructedAssetId ?? null,
          blocked: Boolean(result.blocked),
          fallback: 'fallback' in result ? (result.fallback ? 'fallback-active' : null) : null,
          isLoading: false,
          error: 'error' in result ? (result.error ?? null) : null,
          environmentState: result.reconstructed ? 'ready' : 'initializing',
        });
      } catch (e) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: e instanceof Error ? e.message : 'Venue reconstruction failed',
        }));
      }
    })();
  }, [venueId, roomId, venueName, venueType]);

  return state;
}

export function useVisualRouting(
  entityId: string,
  entityType: string,
  roomId: string,
  metadata?: Record<string, unknown>
) {
  const [state, setState] = useState({
    assetId: null as string | null,
    blocked: false,
    fallback: null as FallbackState,
    isLoading: true,
    error: null as string | null,
    resolvedType: entityType,
  });

  useEffect(() => {
    (async () => {
      try {
        const meta = metadata ?? {};
        const result = await routeVisualReplacementWithAuthority(
          entityId,
          entityType,
          toChatRoomId(roomId),
          String(meta.displayName ?? entityType),
          String(meta.sourceRoute ?? 'unknown-source'),
          String(meta.targetSlot ?? 'unknown-slot'),
          meta.context !== undefined ? String(meta.context) : undefined,
          Object.fromEntries(
            Object.entries(meta).map(([k, v]) => [k, String(v)])
          )
        );
        setState({
          assetId: result.jobId ?? null,
          blocked: Boolean(result.blocked),
          fallback: 'fallback' in result ? (result.fallback ? 'fallback-active' : null) : null,
          isLoading: false,
          error: 'error' in result ? (result.error ?? null) : null,
          resolvedType: entityType,
        });
      } catch (e) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: e instanceof Error ? e.message : 'Visual routing failed',
        }));
      }
    })();
  }, [entityId, entityType, roomId, metadata]);

  return state;
}

export function useVisualRetry(entityId: string, generatorType: string, roomId: string) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  const triggerRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      const dynamic = await import('@/lib/ai-visuals/VisualRecoveryCoordinator');
      const attempt = (dynamic as Record<string, unknown>)['attemptVisualRecovery'];
      if (typeof attempt !== 'function') {
        throw new Error('attemptVisualRecovery is unavailable');
      }

      const result = await (attempt as (a: string, b: string, c: string) => Promise<unknown>)(
        entityId, generatorType, roomId
      );
      if (!result) {
        setLastError('Recovery attempt returned null result');
      } else {
        setRetryCount((prev) => prev + 1);
        setLastError(null);
      }
    } catch (e) {
      setLastError(e instanceof Error ? e.message : 'Retry failed');
    } finally {
      setIsRetrying(false);
    }
  }, [entityId, generatorType, roomId]);

  return { isRetrying, retryCount, lastError, triggerRetry };
}
